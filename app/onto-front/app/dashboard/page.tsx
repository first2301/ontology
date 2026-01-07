'use client';

import { useState } from 'react';
import { Activity, CheckCircle, Clock, TrendingUp, RefreshCw, Play, Pause } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import KPICard from '@/components/dashboard/KPICard';
import QualityChart from '@/components/dashboard/QualityChart';
import EquipmentChart from '@/components/dashboard/EquipmentChart';
import Loading from '@/components/common/Loading';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import Button from '@/components/common/Button';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { useAutoRefresh } from '@/lib/hooks/useAutoRefresh';
import { AUTO_REFRESH_INTERVAL } from '@/lib/utils/constants';

export default function DashboardPage() {
  const { dashboardData, qualityTrendData, equipmentStatusData, isLoading, error, refetch } =
    useDashboard();
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
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Manufacturing Dashboard</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                variant={autoRefreshEnabled ? 'success' : 'secondary'}
                size="sm"
              >
                {autoRefreshEnabled ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Auto-refresh
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Enable Auto-refresh
                  </>
                )}
              </Button>
              <Button onClick={() => refetch()} variant="primary" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <Loading fullScreen message="Loading dashboard data..." />
          ) : error ? (
            <ErrorDisplay error={error} onRetry={() => refetch()} title="Failed to load dashboard data" />
          ) : (
            <>
              {/* KPI Cards */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                  icon={Activity}
                  title="Equipment Efficiency"
                  value={dashboardData.efficiency}
                />
                <KPICard
                  icon={CheckCircle}
                  title="Quality Rate"
                  value={dashboardData.qualityRate}
                />
                <KPICard
                  icon={Clock}
                  title="Active Orders"
                  value={dashboardData.activeOrders}
                />
                <KPICard
                  icon={TrendingUp}
                  title="Production Trend"
                  value={dashboardData.productionTrend}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Quality Trend</h3>
                  <QualityChart data={qualityTrendData} />
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Equipment Status</h3>
                  <EquipmentChart data={equipmentStatusData} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

