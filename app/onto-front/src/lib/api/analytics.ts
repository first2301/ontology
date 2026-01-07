// 고급 쿼리 및 분석 API

import { apiClient } from './client';
import type {
  ProcessFlowResponse,
  EquipmentHierarchyResponse,
  QualityTrendResponse,
  EquipmentEfficiencyResponse,
} from '@/types/api';

export const analyticsAPI = {
  /**
   * 프로세스 플로우 조회
   */
  async getProcessFlow(processId: string): Promise<ProcessFlowResponse> {
    return apiClient.get<ProcessFlowResponse>(`/graph/process-flow/${processId}`);
  },

  /**
   * 설비 계층구조 조회
   */
  async getEquipmentHierarchy(): Promise<EquipmentHierarchyResponse> {
    return apiClient.get<EquipmentHierarchyResponse>('/graph/equipment-hierarchy');
  },

  /**
   * 품질 트렌드 분석
   */
  async getQualityTrend(period: string = '7d'): Promise<QualityTrendResponse> {
    return apiClient.get<QualityTrendResponse>('/analytics/quality-trend', { period });
  },

  /**
   * 설비 효율성 (OEE) 계산
   */
  async getEquipmentEfficiency(
    equipmentId: string
  ): Promise<EquipmentEfficiencyResponse> {
    return apiClient.get<EquipmentEfficiencyResponse>(
      `/analytics/equipment-efficiency/${equipmentId}`
    );
  },
};

