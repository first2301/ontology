
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

export interface RecommendationReport {
  timestamp: string;
  industry: IndustryType;
  matches: MatchingResult[];
  summary: string;
}
