// 상수 정의

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '/api';
export const API_FULL_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const GRAPH_LAYOUTS = {
  cose: 'Force-directed',
  grid: 'Grid',
  hierarchical: 'Hierarchical',
  circle: 'Circle',
} as const;

export const NODE_COLORS: Record<string, string> = {
  Equipment: '#667eea',
  Sensor: '#28a745',
  Variable: '#17a2b8',
  Unit: '#6c757d',
  Process: '#fd7e14',
  Operation: '#e83e8c',
  Material: '#20c997',
  Product: '#6f42c1',
  Area: '#ffc107',
  WorkOrder: '#dc3545',
  QualityControl: '#28a745',
  Maintenance: '#fd7e14',
  Batch: '#6f42c1',
  Defect: '#dc3545',
};

export const RELATIONSHIP_TYPES = [
  'partOf',
  'measures',
  'locatedIn',
  'executedBy',
  'hasQuality',
  'hasMaintenance',
  'precedes',
] as const;

export const TOAST_DURATION = 5000; // 5초

export const AUTO_REFRESH_INTERVAL = 30000; // 30초

