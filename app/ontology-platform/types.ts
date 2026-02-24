
export enum IndustryType {
  AUTOMOTIVE = 'Automotive',
  ELECTRONICS = 'Electronics',
  SEMICONDUCTOR = 'Semiconductor',
  PHARMACEUTICAL = 'Pharmaceutical',
  FOOD_BEVERAGE = 'Food & Beverage'
}

export interface DataProfile {
  features: string[];
  recordsCount: number;
  noiseLevel: number;
  seasonality: boolean;
  missingValues: number;
  dataTypes: Record<string, string>;
}

export interface AutoMLResult {
  bestModel: string;
  accuracy: number;
  parameters: Record<string, any>;
  trainingTime: string;
}

export interface MESFunction {
  id: string;
  category: 'Production' | 'Quality' | 'Maintenance' | 'Inventory' | 'Tracking';
  name: string;
  description: string;
  /** 한글 설명 (UI 표시용, 없으면 description 사용) */
  descriptionKo?: string;
  standard: string; // e.g., ISA-95
}

export interface MatchingResult {
  functionId: string;
  score: number;
  rationale: string;
  priority: number; // 1-5
}

/** 결과 탭 하나를 나타내는 템플릿. L3 계층 노드 및 추천 L2 기능 연결용 */
export interface ResultTemplate {
  id: string;
  name: string;
  /** 매칭된 L2 기능 ID 목록 (Template → Function 엣지에 사용) */
  recommendedFunctionIds: string[];
  /** L3 패널용 결과 탭 요약 문구 (선택) */
  summary?: string;
}

/** 온톨로지 그래프에서 선택된 노드. 오른쪽 패널 메타정보 표시용 */
export type OntologySelectedNode =
  | { type: 'root'; data: { label: string } }
  | { type: 'domain'; data: { category: string; label: string; functionIds: string[] } }
  | { type: 'function'; data: { fn: MESFunction } }
  | { type: 'template'; data: { template: ResultTemplate } };

export interface RecommendationReport {
  timestamp: string;
  industry: IndustryType;
  matches: MatchingResult[];
  summary: string;
}
