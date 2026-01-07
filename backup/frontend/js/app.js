// App.js - 메인 애플리케이션 로직

// Alpine.js 앱 함수
function app() {
    return {
        // 현재 페이지
        currentPage: 'graph',
        
        // 사이드바 상태
        sidebarCollapsed: false,
        
        // 로딩 상태
        loading: false,
        
        // 검색
        searchQuery: '',
        
        // 필터
        selectedTypes: [],
        selectedRelationships: [],
        
        // 통계
        nodeCount: 0,
        edgeCount: 0,
        nodeTypes: [],
        relationshipTypes: [],
        
        // 선택된 노드
        selectedNode: null,
        
        // 대시보드 데이터
        dashboardData: {
            efficiency: 'N/A',
            qualityRate: 'N/A',
            activeOrders: 'N/A',
            productionTrend: 'N/A'
        },
        
        // 관계 편집기
        relationships: [],
        newTriple: {
            subject: '',
            predicate: '',
            object: ''
        },
        showAddForm: false,
        
        // 파일 업로드
        uploadProgress: 0,
        uploadHistory: [],
        isDragOver: false,
        
        // 토스트 알림
        toasts: [],
        
        // 초기화
        init() {
            this.loadInitialData();
            this.setupEventListeners();
            this.loadUserPreferences();
        },
        
        // 초기 데이터 로드
        async loadInitialData() {
            try {
                this.loading = true;
                
                // 그래프 초기화
                if (window.graphManager) {
                    await window.graphManager.init('cy');
                    await window.graphManager.loadGraph(100);
                }
                
                // 대시보드 초기화
                if (window.dashboardManager) {
                    await window.dashboardManager.init();
                }
                
                // 관계 매니저 초기화
                if (window.relationshipManager) {
                    await window.relationshipManager.init();
                }
                
            } catch (error) {
                console.error('Failed to load initial data:', error);
                this.showToast({
                    type: 'error',
                    message: 'Failed to load application data',
                    icon: 'lucide-alert-circle'
                });
            } finally {
                this.loading = false;
            }
        },
        
        // 이벤트 리스너 설정
        setupEventListeners() {
            // 키보드 단축키
            document.addEventListener('keydown', (event) => {
                // Ctrl+1-4: 페이지 전환
                if (event.ctrlKey) {
                    switch (event.key) {
                        case '1':
                            event.preventDefault();
                            this.currentPage = 'graph';
                            break;
                        case '2':
                            event.preventDefault();
                            this.currentPage = 'dashboard';
                            break;
                        case '3':
                            event.preventDefault();
                            this.currentPage = 'data-manager';
                            break;
                        case '4':
                            event.preventDefault();
                            this.currentPage = 'relationship-editor';
                            break;
                    }
                }
            });
            
            // 윈도우 리사이즈
            window.addEventListener('resize', this.debounce(() => {
                this.handleResize();
            }, 250));
        },
        
        // 사용자 설정 로드
        loadUserPreferences() {
            const preferences = window.utils?.storage?.get('userPreferences', {});
            
            if (preferences.sidebarCollapsed !== undefined) {
                this.sidebarCollapsed = preferences.sidebarCollapsed;
            }
            
            if (preferences.currentPage) {
                this.currentPage = preferences.currentPage;
            }
        },
        
        // 사용자 설정 저장
        saveUserPreferences() {
            const preferences = {
                sidebarCollapsed: this.sidebarCollapsed,
                currentPage: this.currentPage
            };
            
            window.utils?.storage?.set('userPreferences', preferences);
        },
        
        // 페이지 변경
        changePage(page) {
            this.currentPage = page;
            this.saveUserPreferences();
            
            // 페이지별 초기화
            this.$nextTick(() => {
                switch (page) {
                    case 'graph':
                        this.initGraphPage();
                        break;
                    case 'dashboard':
                        this.initDashboardPage();
                        break;
                    case 'data-manager':
                        this.initDataManagerPage();
                        break;
                    case 'relationship-editor':
                        this.initRelationshipEditorPage();
                        break;
                }
            });
        },
        
        // 그래프 페이지 초기화
        initGraphPage() {
            if (window.graphManager) {
                const graph = window.graphManager.getInstance();
                if (graph) {
                    graph.fit();
                }
            }
        },
        
        // 대시보드 페이지 초기화
        initDashboardPage() {
            if (window.dashboardManager) {
                const dashboard = window.dashboardManager.getInstance();
                if (dashboard) {
                    dashboard.refreshDashboard();
                }
            }
        },
        
        // 데이터 관리자 페이지 초기화
        initDataManagerPage() {
            // 파일 업로드 히스토리 로드
            this.loadUploadHistory();
        },
        
        // 관계 편집기 페이지 초기화
        initRelationshipEditorPage() {
            if (window.relationshipManager) {
                const relationshipManager = window.relationshipManager.getInstance();
                if (relationshipManager) {
                    relationshipManager.loadRelationships();
                }
            }
        },
        
        // 노드 검색
        searchNodes() {
            if (window.graphManager) {
                const graph = window.graphManager.getInstance();
                if (graph) {
                    graph.searchNodes(this.searchQuery);
                }
            }
        },
        
        // 필터 적용
        applyFilters() {
            if (window.graphManager) {
                const graph = window.graphManager.getInstance();
                if (graph) {
                    graph.filterByTypes(this.selectedTypes, this.selectedRelationships);
                }
            }
        },
        
        // 그래프 새로고침
        async loadGraph() {
            if (window.graphManager) {
                const graph = window.graphManager.getInstance();
                if (graph) {
                    await graph.loadGraph(this.graphLimit || 100);
                }
            }
        },
        
        // 레이아웃 변경
        changeLayout() {
            if (window.graphManager) {
                const graph = window.graphManager.getInstance();
                if (graph) {
                    graph.changeLayout(this.selectedLayout);
                }
            }
        },
        
        // 대시보드 새로고침
        refreshDashboard() {
            if (window.dashboardManager) {
                const dashboard = window.dashboardManager.getInstance();
                if (dashboard) {
                    dashboard.refreshDashboard();
                }
            }
        },
        
        // 파일 드래그 오버
        handleDragOver(event) {
            event.preventDefault();
            this.isDragOver = true;
        },
        
        // 파일 드래그 리브
        handleDragLeave(event) {
            event.preventDefault();
            this.isDragOver = false;
        },
        
        // 파일 드롭
        async handleFileDrop(event) {
            event.preventDefault();
            this.isDragOver = false;
            
            const files = Array.from(event.dataTransfer.files);
            await this.processFiles(files);
        },
        
        // 파일 선택
        async handleFileSelect(event) {
            const files = Array.from(event.target.files);
            await this.processFiles(files);
        },
        
        // 파일 처리
        async processFiles(files) {
            for (const file of files) {
                if (file.name.endsWith('.ttl') || file.name.endsWith('.owl') || file.name.endsWith('.rdf')) {
                    await this.uploadFile(file);
                } else {
                    this.showToast({
                        type: 'warning',
                        message: `Unsupported file type: ${file.name}`,
                        icon: 'lucide-alert-triangle'
                    });
                }
            }
        },
        
        // 파일 업로드
        async uploadFile(file) {
            try {
                this.uploadProgress = 0;
                
                // 프로그레스 시뮬레이션
                const progressInterval = setInterval(() => {
                    this.uploadProgress += Math.random() * 20;
                    if (this.uploadProgress >= 100) {
                        this.uploadProgress = 100;
                        clearInterval(progressInterval);
                    }
                }, 200);
                
                // 실제 업로드 (shapes.ttl은 기본 파일 사용)
                const shapesFile = new File([''], 'shapes.ttl', { type: 'text/turtle' });
                const response = await window.api.ontology.validateAndImport(file, shapesFile);
                
                clearInterval(progressInterval);
                this.uploadProgress = 100;
                
                // 업로드 히스토리에 추가
                this.uploadHistory.unshift({
                    id: window.utils?.generateUUID(),
                    name: file.name,
                    status: response.validationConforms ? 'success' : 'error',
                    triplesLoaded: response.triplesLoaded,
                    timestamp: window.utils?.formatDate(new Date())
                });
                
                // 히스토리 저장
                this.saveUploadHistory();
                
                this.showToast({
                    type: response.validationConforms ? 'success' : 'error',
                    message: response.validationConforms ? 
                        `${response.triplesLoaded} triples loaded successfully` : 
                        'Validation failed',
                    icon: response.validationConforms ? 'lucide-check-circle' : 'lucide-alert-circle'
                });
                
                // 그래프 새로고침
                setTimeout(() => {
                    this.loadGraph();
                }, 1000);
                
            } catch (error) {
                console.error('Upload failed:', error);
                this.showToast({
                    type: 'error',
                    message: 'Upload failed',
                    icon: 'lucide-alert-circle'
                });
            } finally {
                setTimeout(() => {
                    this.uploadProgress = 0;
                }, 2000);
            }
        },
        
        // 업로드 히스토리 로드
        loadUploadHistory() {
            this.uploadHistory = window.utils?.storage?.get('uploadHistory', []);
        },
        
        // 업로드 히스토리 저장
        saveUploadHistory() {
            window.utils?.storage?.set('uploadHistory', this.uploadHistory.slice(0, 50)); // 최대 50개
        },
        
        // 관계 추가
        async addTriple() {
            if (window.relationshipManager) {
                const relationshipManager = window.relationshipManager.getInstance();
                if (relationshipManager) {
                    await relationshipManager.addTriple();
                }
            }
        },
        
        // 관계 삭제
        async deleteTriple(triple) {
            if (window.relationshipManager) {
                const relationshipManager = window.relationshipManager.getInstance();
                if (relationshipManager) {
                    await relationshipManager.deleteTriple(triple);
                }
            }
        },
        
        // 토스트 표시
        showToast(toast) {
            const id = window.utils?.generateUUID();
            const newToast = {
                id,
                ...toast,
                show: true
            };
            
            this.toasts.push(newToast);
            
            // 자동 제거
            setTimeout(() => {
                this.removeToast(id);
            }, 5000);
        },
        
        // 토스트 제거
        removeToast(id) {
            const index = this.toasts.findIndex(toast => toast.id === id);
            if (index !== -1) {
                this.toasts[index].show = false;
                setTimeout(() => {
                    this.toasts.splice(index, 1);
                }, 300);
            }
        },
        
        // 윈도우 리사이즈 처리
        handleResize() {
            // 그래프 리사이즈
            if (window.graphManager) {
                const graph = window.graphManager.getInstance();
                if (graph && graph.cy) {
                    graph.cy.resize();
                }
            }
            
            // 차트 리사이즈
            if (window.dashboardManager) {
                const dashboard = window.dashboardManager.getInstance();
                if (dashboard) {
                    Object.values(dashboard.charts).forEach(chart => {
                        if (chart) {
                            chart.resize();
                        }
                    });
                }
            }
        },
        
        // 디바운스 함수
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // 앱 종료
        destroy() {
            // 그래프 정리
            if (window.graphManager) {
                const graph = window.graphManager.getInstance();
                if (graph) {
                    graph.destroy();
                }
            }
            
            // 대시보드 정리
            if (window.dashboardManager) {
                const dashboard = window.dashboardManager.getInstance();
                if (dashboard) {
                    dashboard.destroy();
                }
            }
            
            // 관계 매니저 정리
            if (window.relationshipManager) {
                const relationshipManager = window.relationshipManager.getInstance();
                if (relationshipManager) {
                    relationshipManager.destroy();
                }
            }
            
            // 사용자 설정 저장
            this.saveUserPreferences();
        }
    };
}

// 전역 함수들
window.showToast = function(toast) {
    if (window.Alpine && window.Alpine.store) {
        const store = window.Alpine.store('app');
        if (store) {
            store.showToast(toast);
        }
    }
};

window.showContextMenu = function(target, position) {
    // 컨텍스트 메뉴 표시 로직
    console.log('Context menu for:', target, 'at:', position);
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // Alpine.js 앱 등록
    if (window.Alpine) {
        window.Alpine.data('app', app);
    }
    
    // 전역 에러 핸들러
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        if (window.showToast) {
            window.showToast({
                type: 'error',
                message: 'An unexpected error occurred',
                icon: 'lucide-alert-circle'
            });
        }
    });
    
    // 전역 Promise rejection 핸들러
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        if (window.showToast) {
            window.showToast({
                type: 'error',
                message: 'An unexpected error occurred',
                icon: 'lucide-alert-circle'
            });
        }
    });
});

// 내보내기 (전역 app 함수 충돌 방지를 위해 App 네임스페이스 사용)
window.App = {
    init: app,
    showToast: window.showToast,
    showContextMenu: window.showContextMenu
};
