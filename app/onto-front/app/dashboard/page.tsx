'use client';

import { useState } from 'react';
import { Activity, CheckCircle, Clock, TrendingUp, RefreshCw, Play, Pause } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import KPICard from '@/components/dashboard/KPICard';
import QualityChart from '@/components/dashboard/QualityChart';
import EquipmentChart from '@/components/dashboard/EquipmentChart';
import OntologyRelationsCard from '@/components/dashboard/OntologyRelationsCard';
import Loading from '@/components/common/Loading';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import Button from '@/components/common/Button';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { useAutoRefresh } from '@/lib/hooks/useAutoRefresh';
import { AUTO_REFRESH_INTERVAL } from '@/lib/utils/constants';

export default function DashboardPage() {
  const {
    ontologyRelations,
    dashboardData,
    qualityTrendData,
    equipmentStatusData,
    isLoading,
    error,
    refetch,
  } = useDashboard();
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

  // 자동 새로고침 설정
  useAutoRefresh({
    enabled: autoRefreshEnabled,
    interval: AUTO_REFRESH_INTERVAL,
    onRefresh: () => refetch(),
  });

  return (
    <MainLayout>
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Manufacturing Dashboard</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                  variant={autoRefreshEnabled ? 'success' : 'secondary'}
                  size="sm"
                >
                  {autoRefreshEnabled ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Pause Auto-refresh</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Enable Auto-refresh</span>
                    </>
                  )}
                </Button>
                <Button onClick={() => refetch()} variant="primary" size="sm">
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6">
            {isLoading ? (
              <Loading fullScreen message="Loading dashboard data..." />
            ) : error ? (
              <ErrorDisplay error={error} onRetry={() => refetch()} title="Failed to load dashboard data" />
            ) : (
              <>
                {/* 온톨로지 관계 정보 섹션 */}
                <div className="mb-8">
                  <OntologyRelationsCard
                    totalRelations={ontologyRelations.totalRelations}
                    predicateStats={ontologyRelations.predicateStats}
                    triples={ontologyRelations.triples}
                  />
                </div>

                {/* KPI Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
                    <KPICard
                      icon={Activity}
                      title="Equipment Efficiency"
                      value={dashboardData.efficiency}
                    />
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <KPICard
                      icon={CheckCircle}
                      title="Quality Rate"
                      value={dashboardData.qualityRate}
                    />
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <KPICard
                      icon={Clock}
                      title="Active Orders"
                      value={dashboardData.activeOrders}
                    />
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <KPICard
                      icon={TrendingUp}
                      title="Production Trend"
                      value={dashboardData.productionTrend}
                    />
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Quality Trend</h3>
                    <QualityChart data={qualityTrendData} />
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Equipment Status</h3>
                    <EquipmentChart data={equipmentStatusData} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

