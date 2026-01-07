// 제조 데이터 관리 API

import { apiClient } from './client';
import type {
  ManufacturingLinesResponse,
  ManufacturingLine,
  WorkOrdersResponse,
  WorkOrder,
  QualityDataResponse,
  QualityControl,
  EquipmentStatusResponse,
  MaintenanceHistoryResponse,
} from '@/types/api';

export const manufacturingAPI = {
  /**
   * 제조 라인 목록 조회
   */
  async getManufacturingLines(): Promise<ManufacturingLinesResponse> {
    return apiClient.get<ManufacturingLinesResponse>('/manufacturing/lines');
  },

  /**
   * 특정 제조 라인 상세 조회
   */
  async getManufacturingLine(lineId: string): Promise<{ line: ManufacturingLine }> {
    return apiClient.get(`/manufacturing/lines/${lineId}`);
  },

  /**
   * 작업지시서 목록 조회
   */
  async getWorkOrders(): Promise<WorkOrdersResponse> {
    return apiClient.get<WorkOrdersResponse>('/manufacturing/work-orders');
  },

  /**
   * 작업지시서 생성
   */
  async createWorkOrder(workOrder: WorkOrder): Promise<{ id: string; message: string }> {
    return apiClient.post('/manufacturing/work-orders', workOrder);
  },

  /**
   * 제품 품질 데이터 조회
   */
  async getQualityData(productId: string): Promise<QualityDataResponse> {
    return apiClient.get<QualityDataResponse>(`/manufacturing/quality/${productId}`);
  },

  /**
   * 품질 데이터 생성
   */
  async createQualityData(quality: QualityControl): Promise<{ id: string; message: string }> {
    return apiClient.post('/manufacturing/quality', quality);
  },

  /**
   * 설비 상태 조회
   */
  async getEquipmentStatus(equipmentId: string): Promise<EquipmentStatusResponse> {
    return apiClient.get<EquipmentStatusResponse>(
      `/manufacturing/equipment/${equipmentId}/status`
    );
  },

  /**
   * 설비 유지보수 이력 조회
   */
  async getMaintenanceHistory(equipmentId: string): Promise<MaintenanceHistoryResponse> {
    return apiClient.get<MaintenanceHistoryResponse>(
      `/manufacturing/equipment/${equipmentId}/maintenance-history`
    );
  },
};

