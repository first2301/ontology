// API 응답 타입 정의

export interface ImportResult {
  triplesLoaded: number;
  validationConforms: boolean;
  report?: string;
}

export interface Triple {
  subject: string;
  predicate: string;
  object: string;
}

export interface TripleResponse extends Triple {
  subject_label?: string;
  object_label?: string;
}

export interface BulkTripleOperation {
  add: Triple[];
  delete: Triple[];
}

export interface WorkOrder {
  workOrderNumber: string;
  plannedQuantity: number;
  actualQuantity?: number;
  status: string;
  equipment_id?: string;
}

export interface QualityControl {
  product_id: string;
  qualityResult: string;
  timestamp: string;
}

export interface EquipmentStatus {
  equipment_id: string;
  status: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
}

export interface ManufacturingLine {
  id: string;
  name: string;
  types: string[];
}

export interface GraphElement {
  data: {
    id: string;
    label: string;
    types?: string[];
    source?: string;
    target?: string;
    type?: string;
  };
}

export interface GraphElementsResponse {
  elements: GraphElement[];
}

export interface TriplesResponse {
  triples: TripleResponse[];
}

export interface ManufacturingLinesResponse {
  lines: ManufacturingLine[];
}

export interface WorkOrdersResponse {
  workOrders: WorkOrder[];
}

export interface QualityDataResponse {
  qualityData: QualityControl[];
}

export interface EquipmentStatusResponse {
  equipment: EquipmentStatus;
}

export interface MaintenanceHistoryResponse {
  maintenanceHistory: Array<{
    id: string;
    maintenanceType: string;
    timestamp: string;
  }>;
}

export interface ProcessFlowResponse {
  processFlow: Array<{
    operationId: string;
    operationName: string;
    nextOperation?: string;
  }>;
}

export interface EquipmentHierarchyResponse {
  hierarchy: Array<{
    parentId: string;
    parentName: string;
    childId: string;
    childName: string;
  }>;
}

export interface QualityTrendResponse {
  trend: Array<{
    date: string;
    result: string;
    count: number;
  }>;
}

export interface EquipmentEfficiencyResponse {
  efficiency: {
    totalOrders: number;
    plannedQuantity: number;
    actualQuantity: number;
    availability: number;
    performance: number;
    quality: number;
    oee: number;
  } | null;
}

