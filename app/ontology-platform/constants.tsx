import React from 'react';
import { MESFunction, ResultTemplate } from './types';

/**
 * Standard MES Ontology: ISA-95, ISO 9001, GS1을 참고해 설계한 MES 기능 목록.
 * 표준 조항 검증·인증 로직은 포함하지 않으며, 기능별 출처 표시용입니다.
 */
export const MES_ONTOLOGY: MESFunction[] = [
  {
    id: 'F001',
    category: 'Tracking',
    name: 'Real-time Work-in-Progress (WIP) Tracking',
    description: 'Monitors the flow of materials and products through the production line in real-time.',
    descriptionKo: '생산 라인에서 자재·제품의 흐름을 실시간으로 모니터링합니다.',
    standard: 'ISA-95'
  },
  {
    id: 'F002',
    category: 'Quality',
    name: 'Statistical Process Control (SPC)',
    description: 'Uses statistical methods to monitor and control a process to ensure it operates at its full potential.',
    descriptionKo: '통계적 방법으로 공정을 모니터링·관리하여 품질을 유지합니다.',
    standard: 'ISO 9001'
  },
  {
    id: 'F003',
    category: 'Maintenance',
    name: 'Predictive Maintenance (PdM)',
    description: 'Predicts when equipment failure might occur so maintenance can be performed just-in-time.',
    descriptionKo: '설비 고장 시점을 예측하여 적시에 보전할 수 있도록 합니다.',
    standard: 'ISA-95'
  },
  {
    id: 'F004',
    category: 'Production',
    name: 'Dynamic Scheduling',
    description: 'Automatically adjusts production schedules based on current machine availability and order priorities.',
    descriptionKo: '설비 가동률·수주 우선순위에 따라 생산 일정을 자동 조정합니다.',
    standard: 'ISA-95'
  },
  {
    id: 'F005',
    category: 'Inventory',
    name: 'Automated Traceability',
    description: 'Ensures end-to-end traceability of components from supplier to finished goods.',
    descriptionKo: '부품부터 완제품까지 전 구간 이력 추적을 보장합니다.',
    standard: 'GS1'
  },
  {
    id: 'F006',
    category: 'Quality',
    name: 'Non-Conformance Management',
    description: 'Systematically handles defects and deviations in the manufacturing process.',
    descriptionKo: '불량·편차를 체계적으로 관리하고 이력화합니다.',
    standard: 'ISO 9001'
  }
];

export const PIPELINE_STEPS = [
  'Data Profiling',
  'AutoML Modeling',
  'Ontology Matching',
  'Strategy Recommendation'
];

/** 파이프라인 단계별 한글 맥락 설명 (기술개발 흐름 반영) */
export const PIPELINE_STEPS_KO = [
  '산업데이터 프로파일링 및 필요 기능 추출',
  'AutoML로 적합 모델 도출',
  '필요기능 모델과 표준 온톨로지 매칭',
  '매칭 결과 기반 MES 기능 우선순위 제안'
];

/** Configuration 섹션 한 줄 설명 */
export const CONFIG_SECTION_DESCRIPTION_KO =
  '산업데이터 입력 후 AutoML로 모델 도출·필요 기능 추출 → 표준 MES 온톨로지와 매칭하여 우선순위를 제안합니다.';

/** Priority Recommendation 섹션 한 줄 설명 */
export const PRIORITY_RECOMMENDATION_DESCRIPTION_KO =
  '매칭 결과를 바탕으로 제조기업에 필요한 MES 기능 제안 (Rule based 우선순위)';

/** Insights(증강분석) 섹션 한 줄 설명 */
export const INSIGHTS_SECTION_DESCRIPTION_KO =
  '산업데이터 증강분석 플랫폼 활용 제안: 필요기능·표준기능 매칭 품질 향상을 위한 보완 방향';

/** Standard MES Ontology 섹션 한 줄 설명 */
export const ONTOLOGY_SECTION_DESCRIPTION_KO =
  '다양한 산업데이터 모델링 결과를 반영한 국제 표준 MES 기능 모델 온톨로지';

/**
 * 참조용 더미 템플릿. 온톨로지 그래프에 항상 함께 노출되어 사용자에게 참고할 분석 유형을 제시합니다.
 * dataUsageSummary는 실제 활용을 가정한 더미 현황이며, 추후 API/DB 연동 시 교체 가능하도록 상수로 분리했습니다.
 */
export const REFERENCE_TEMPLATES: ResultTemplate[] = [
  {
    id: 'ref-wip',
    name: '참조: WIP 추적 분석',
    recommendedFunctionIds: ['F001'],
    summary: '실시간 재공 재고 추적 데이터 기반 흐름 분석 템플릿입니다.',
    modelName: 'RandomForest',
    preprocessingMethods: ['StandardScaler', '결측치 보간', '이상치 제거'],
    visualizationMethods: ['시계열 흐름 차트', '산점도', '실제 vs 예측'],
    dataUsageSummary: '생산 이력 12,450건 (2024.01~2024.06), 8개 공정 변수(라인ID·작업장·Lot·수량·시작/종료 시각 등). 샘플링률 100%, 학습/검증 8:2 분할 적용.',
  },
  {
    id: 'ref-spc',
    name: '참조: SPC 품질 분석',
    recommendedFunctionIds: ['F002'],
    summary: '통계적 공정 관리(SPC)를 위한 품질 지표 분석 템플릿입니다.',
    modelName: 'LogisticRegression',
    preprocessingMethods: ['StandardScaler', '클래스 균형', '차원 축소'],
    visualizationMethods: ['혼동 행렬', '클래스 분포', '히트맵'],
    dataUsageSummary: '품질 검사 데이터 8,200건, 5개 품질 지표(치수·경도·불량 유형 등). 배치 단위 420개, 불량/정상 이진 분류. 시계열 순서 유지하여 검증셋 구성.',
  },
  {
    id: 'ref-pdm',
    name: '참조: 예지 보전 분석',
    recommendedFunctionIds: ['F003'],
    summary: '설비 센서 데이터 기반 고장 예측 및 예지 보전 템플릿입니다.',
    modelName: 'GradientBoosting',
    preprocessingMethods: ['StandardScaler', '결측치 보간', '이상치 제거', '시계열 윈도우'],
    visualizationMethods: ['특성 추세', '잔차 플롯', '실제 vs 예측'],
    dataUsageSummary: '설비 센서 데이터 45,000건 (15개 채널, 1분 간격, 약 2일치). 진동·온도·전류 등 12개 특징 사용. 고장 라벨 320건 포함, 24시간 전 예측 타깃으로 활용.',
  },
];
