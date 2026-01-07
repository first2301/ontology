// Dashboard.js - 대시보드 관리

class DashboardManager {
    constructor() {
        this.charts = {};
        this.refreshInterval = null;
        this.autoRefresh = false;
        this.refreshIntervalMs = 30000; // 30초
        this.data = {
            efficiency: null,
            qualityRate: null,
            activeOrders: null,
            productionTrend: null,
            qualityTrend: [],
            equipmentStatus: [],
            recentActivities: []
        };
        
        this.init();
    }

    init() {
        this.setupCharts();
        this.loadDashboardData();
        this.setupAutoRefresh();
    }

    setupCharts() {
        // 품질 트렌드 차트
        const qualityCtx = document.getElementById('qualityChart');
        if (qualityCtx) {
            this.charts.quality = new Chart(qualityCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Pass Rate',
                        data: [],
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Fail Rate',
                        data: [],
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            });
        }

        // 설비 상태 차트
        const equipmentCtx = document.getElementById('equipmentChart');
        if (equipmentCtx) {
            this.charts.equipment = new Chart(equipmentCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Active', 'Maintenance', 'Idle', 'Error'],
                    datasets: [{
                        data: [0, 0, 0, 0],
                        backgroundColor: [
                            '#28a745',
                            '#ffc107',
                            '#6c757d',
                            '#dc3545'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: false
                        }
                    }
                }
            });
        }
    }

    async loadDashboardData() {
        try {
            if (window.utils && window.utils.loading) {
                window.utils.loading.show();
            }

            // 병렬로 모든 데이터 로드
            const [
                qualityTrend,
                equipmentEfficiency,
                workOrders,
                manufacturingLines
            ] = await Promise.allSettled([
                window.api.analytics.getQualityTrend('7d'),
                this.getOverallEfficiency(),
                window.api.manufacturing.getWorkOrders(),
                window.api.manufacturing.getManufacturingLines()
            ]);

            // 데이터 처리
            this.processQualityTrend(qualityTrend.value || { trend: [] });
            this.processEquipmentEfficiency(equipmentEfficiency.value || {});
            this.processWorkOrders(workOrders.value || { workOrders: [] });
            this.processManufacturingLines(manufacturingLines.value || { lines: [] });

            // 차트 업데이트
            this.updateCharts();

            // Alpine.js 상태 업데이트
            this.updateAlpineState();

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            if (window.showToast) {
                window.showToast({
                    type: 'error',
                    message: 'Failed to load dashboard data',
                    icon: 'lucide-alert-circle'
                });
            }
        } finally {
            if (window.utils && window.utils.loading) {
                window.utils.loading.hide();
            }
        }
    }

    async getOverallEfficiency() {
        try {
            const lines = await window.api.manufacturing.getManufacturingLines();
            const efficiencies = await Promise.allSettled(
                lines.lines.map(line => 
                    window.api.analytics.getEquipmentEfficiency(line.id)
                )
            );

            const validEfficiencies = efficiencies
                .filter(result => result.status === 'fulfilled' && result.value.efficiency)
                .map(result => result.value.efficiency.oee || 0);

            const averageEfficiency = validEfficiencies.length > 0 
                ? validEfficiencies.reduce((sum, eff) => sum + eff, 0) / validEfficiencies.length
                : 0;

            return { efficiency: { oee: averageEfficiency } };
        } catch (error) {
            console.error('Failed to get overall efficiency:', error);
            return { efficiency: { oee: 0 } };
        }
    }

    processQualityTrend(data) {
        const trend = data.trend || [];
        const groupedByDate = {};
        
        trend.forEach(item => {
            const date = item.date;
            if (!groupedByDate[date]) {
                groupedByDate[date] = { pass: 0, fail: 0, total: 0 };
            }
            
            if (item.result === 'pass') {
                groupedByDate[date].pass++;
            } else if (item.result === 'fail') {
                groupedByDate[date].fail++;
            }
            groupedByDate[date].total++;
        });

        const dates = Object.keys(groupedByDate).sort();
        const passRates = [];
        const failRates = [];

        dates.forEach(date => {
            const data = groupedByDate[date];
            const passRate = data.total > 0 ? (data.pass / data.total) * 100 : 0;
            const failRate = data.total > 0 ? (data.fail / data.total) * 100 : 0;
            
            passRates.push(passRate);
            failRates.push(failRate);
        });

        this.data.qualityTrend = {
            labels: dates,
            passRates,
            failRates
        };
    }

    processEquipmentEfficiency(data) {
        this.data.efficiency = data.efficiency?.oee ? 
            Math.round(data.efficiency.oee * 100) : 0;
    }

    processWorkOrders(data) {
        const workOrders = data.workOrders || [];
        const activeOrders = workOrders.filter(order => 
            order.status === 'in_progress' || order.status === 'planned'
        ).length;
        
        const completedOrders = workOrders.filter(order => 
            order.status === 'completed'
        );
        
        const totalPlanned = workOrders.reduce((sum, order) => 
            sum + (order.plannedQuantity || 0), 0);
        const totalActual = completedOrders.reduce((sum, order) => 
            sum + (order.actualQuantity || 0), 0);
        
        this.data.activeOrders = activeOrders;
        this.data.productionTrend = totalPlanned > 0 ? 
            Math.round((totalActual / totalPlanned) * 100) : 0;
    }

    processManufacturingLines(data) {
        const lines = data.lines || [];
        const statusCounts = {
            active: 0,
            maintenance: 0,
            idle: 0,
            error: 0
        };

        // 실제로는 각 라인의 상태를 조회해야 하지만, 여기서는 예시
        lines.forEach(line => {
            // 기본적으로 모든 라인을 active로 설정
            statusCounts.active++;
        });

        this.data.equipmentStatus = statusCounts;
    }

    updateCharts() {
        // 품질 트렌드 차트 업데이트
        if (this.charts.quality && this.data.qualityTrend) {
            this.charts.quality.data.labels = this.data.qualityTrend.labels;
            this.charts.quality.data.datasets[0].data = this.data.qualityTrend.passRates;
            this.charts.quality.data.datasets[1].data = this.data.qualityTrend.failRates;
            this.charts.quality.update();
        }

        // 설비 상태 차트 업데이트
        if (this.charts.equipment && this.data.equipmentStatus) {
            this.charts.equipment.data.datasets[0].data = [
                this.data.equipmentStatus.active,
                this.data.equipmentStatus.maintenance,
                this.data.equipmentStatus.idle,
                this.data.equipmentStatus.error
            ];
            this.charts.equipment.update();
        }
    }

    updateAlpineState() {
        if (window.Alpine && window.Alpine.store) {
            const store = window.Alpine.store('app');
            if (store) {
                store.dashboardData = {
                    efficiency: this.data.efficiency + '%',
                    qualityRate: this.calculateQualityRate() + '%',
                    activeOrders: this.data.activeOrders,
                    productionTrend: this.data.productionTrend + '%'
                };
            }
        }
    }

    calculateQualityRate() {
        if (!this.data.qualityTrend || this.data.qualityTrend.passRates.length === 0) {
            return 0;
        }
        
        const totalPass = this.data.qualityTrend.passRates.reduce((sum, rate) => sum + rate, 0);
        const averagePassRate = totalPass / this.data.qualityTrend.passRates.length;
        
        return Math.round(averagePassRate);
    }

    setupAutoRefresh() {
        // 자동 새로고침 설정
        this.refreshInterval = setInterval(() => {
            if (this.autoRefresh) {
                this.loadDashboardData();
            }
        }, this.refreshIntervalMs);
    }

    toggleAutoRefresh() {
        this.autoRefresh = !this.autoRefresh;
        
        if (window.showToast) {
            window.showToast({
                type: 'info',
                message: `Auto-refresh ${this.autoRefresh ? 'enabled' : 'disabled'}`,
                icon: this.autoRefresh ? 'lucide-play' : 'lucide-pause'
            });
        }
    }

    refreshDashboard() {
        this.loadDashboardData();
        
        if (window.showToast) {
            window.showToast({
                type: 'success',
                message: 'Dashboard refreshed',
                icon: 'lucide-refresh-cw'
            });
        }
    }

    exportDashboard(format = 'png') {
        if (format === 'png') {
            // 차트들을 이미지로 내보내기
            Object.keys(this.charts).forEach(chartName => {
                const chart = this.charts[chartName];
                if (chart) {
                    const url = chart.toBase64Image();
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `dashboard-${chartName}.png`;
                    link.click();
                }
            });
        } else if (format === 'json') {
            // 대시보드 데이터를 JSON으로 내보내기
            const dataStr = JSON.stringify(this.data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'dashboard-data.json';
            link.click();
            URL.revokeObjectURL(url);
        }
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }

        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        
        this.charts = {};
    }
}

// 대시보드 매니저 인스턴스
let dashboardManager = null;

// 대시보드 초기화 함수
function initDashboard() {
    if (dashboardManager) {
        dashboardManager.destroy();
    }
    
    dashboardManager = new DashboardManager();
    return dashboardManager;
}

// 전역 함수들
window.dashboardManager = {
    init: initDashboard,
    getInstance: () => dashboardManager,
    
    // 편의 함수들
    loadData: () => dashboardManager?.loadDashboardData(),
    refresh: () => dashboardManager?.refreshDashboard(),
    toggleAutoRefresh: () => dashboardManager?.toggleAutoRefresh(),
    exportDashboard: (format) => dashboardManager?.exportDashboard(format)
};
