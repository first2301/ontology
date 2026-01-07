// 제조 데이터 관련 타입 정의

export interface DashboardData {
  efficiency: string | number;
  qualityRate: string | number;
  activeOrders: string | number;
  productionTrend: string | number;
}

export interface QualityTrendData {
  labels: string[];
  passRates: number[];
  failRates: number[];
}

export interface EquipmentStatusData {
  active: number;
  maintenance: number;
  idle: number;
  error: number;
}

export interface UploadHistoryItem {
  id: string;
  name: string;
  status: 'success' | 'error' | 'pending';
  triplesLoaded: number;
  timestamp: string;
}

