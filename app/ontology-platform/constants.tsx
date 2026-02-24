import React from 'react';
import { MESFunction } from './types';

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
