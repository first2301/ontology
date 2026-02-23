'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsAPI, manufacturingAPI, ontologyAPI } from '@/lib/api';
import type { DashboardData, QualityTrendData, EquipmentStatusData } from '@/types/manufacturing';
import type { TripleResponse } from '@/types/api';

export function useDashboard() {
  // 온톨로지 관계 정보
  const triplesQuery = useQuery({
    queryKey: ['triples'],
    queryFn: () => ontologyAPI.getTriples(),
    retry: false,
  });

  // 품질 트렌드
  const qualityTrendQuery = useQuery({
    queryKey: ['quality-trend', '7d'],
    queryFn: () => analyticsAPI.getQualityTrend('7d'),
  });

  // 작업지시서
  const workOrdersQuery = useQuery({
    queryKey: ['work-orders'],
    queryFn: () => manufacturingAPI.getWorkOrders(),
  });

  // 제조 라인
  const manufacturingLinesQuery = useQuery({
    queryKey: ['manufacturing-lines'],
    queryFn: () => manufacturingAPI.getManufacturingLines(),
  });

  // 데이터 처리
  const processQualityTrend = (): QualityTrendData => {
    const trend = qualityTrendQuery.data?.trend || [];
    const groupedByDate: Record<string, { pass: number; fail: number; total: number }> = {};

    trend.forEach((item) => {
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
    const passRates: number[] = [];
    const failRates: number[] = [];

    dates.forEach((date) => {
      const data = groupedByDate[date];
      const passRate = data.total > 0 ? (data.pass / data.total) * 100 : 0;
      const failRate = data.total > 0 ? (data.fail / data.total) * 100 : 0;

      passRates.push(passRate);
      failRates.push(failRate);
    });

    return {
      labels: dates,
      passRates,
      failRates,
    };
  };

  const processEquipmentStatus = (): EquipmentStatusData => {
    const lines = manufacturingLinesQuery.data?.lines || [];
    return {
      active: lines.length,
      maintenance: 0,
      idle: 0,
      error: 0,
    };
  };

  const processDashboardData = (): DashboardData => {
    const workOrders = workOrdersQuery.data?.workOrders || [];
    const activeOrders = workOrders.filter(
      (order) => order.status === 'in_progress' || order.status === 'planned'
    ).length;

    const completedOrders = workOrders.filter((order) => order.status === 'completed');
    const totalPlanned = workOrders.reduce((sum, order) => sum + (order.plannedQuantity || 0), 0);
    const totalActual = completedOrders.reduce(
      (sum, order) => sum + (order.actualQuantity || 0),
      0
    );

    const qualityTrend = processQualityTrend();
    const qualityRate =
      qualityTrend.passRates.length > 0
        ? Math.round(
            qualityTrend.passRates.reduce((sum, rate) => sum + rate, 0) /
              qualityTrend.passRates.length
          )
        : 0;

    return {
      efficiency: 'N/A',
      qualityRate: `${qualityRate}%`,
      activeOrders,
      productionTrend: totalPlanned > 0 ? `${Math.round((totalActual / totalPlanned) * 100)}%` : '0%',
    };
  };

  /**
   * 온톨로지 관계 정보 통계 계산
   */
  const processOntologyRelations = () => {
    const triples = triplesQuery.data?.triples || [];
    const totalRelations = triples.length;

    // 관계 타입별 개수 계산
    const predicateCounts: Record<string, number> = {};
    triples.forEach((triple) => {
      const predicate = triple.predicate;
      predicateCounts[predicate] = (predicateCounts[predicate] || 0) + 1;
    });

    // 관계 타입별 개수를 배열로 변환하고 정렬
    const predicateStats = Object.entries(predicateCounts)
      .map(([predicate, count]) => ({ predicate, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // 상위 5개만

    return {
      totalRelations,
      predicateStats,
      triples: triples as TripleResponse[],
    };
  };

  const isLoading =
    triplesQuery.isLoading ||
    qualityTrendQuery.isLoading ||
    workOrdersQuery.isLoading ||
    manufacturingLinesQuery.isLoading;

  const error =
    triplesQuery.error ||
    qualityTrendQuery.error ||
    workOrdersQuery.error ||
    manufacturingLinesQuery.error;

  return {
    ontologyRelations: processOntologyRelations(),
    dashboardData: processDashboardData(),
    qualityTrendData: processQualityTrend(),
    equipmentStatusData: processEquipmentStatus(),
    isLoading,
    error,
    refetch: () => {
      triplesQuery.refetch();
      qualityTrendQuery.refetch();
      workOrdersQuery.refetch();
      manufacturingLinesQuery.refetch();
    },
  };
}

