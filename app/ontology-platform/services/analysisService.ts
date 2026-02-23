import { DataProfile, IndustryType, MESFunction, MatchingResult } from '../types';

/**
 * 프로파일 키워드와 MES 함수 ID 매핑 (규칙 기반 매칭용)
 */
const FEATURE_TO_FUNCTION_HINTS: Record<string, string[]> = {
  Temperature: ['F003', 'F002'],
  Pressure: ['F003', 'F002'],
  Vibration: ['F003', 'F002'],
  Spindle_Speed: ['F004', 'F001'],
  Torque: ['F003', 'F004'],
  Sensor: ['F003', 'F001', 'F002'],
  State: ['F001', 'F004', 'F006'],
};

/**
 * 데이터 프로파일과 MES 온톨로지를 규칙 기반으로 분석하여
 * 매칭 결과(matches), 요약(summary), 증강 제안(augmentationSuggestions)을 반환합니다.
 * (구글 API 제거 후 로컬 전용 서비스)
 */
export async function analyzeDataAndMatch(
  industry: IndustryType,
  profile: DataProfile,
  ontology: MESFunction[]
): Promise<{
  matches: MatchingResult[];
  summary: string;
  augmentationSuggestions: string[];
} | null> {
  const matches: MatchingResult[] = [];
  const featureCount = profile.features.length;
  const signalStrength = 1 - profile.noiseLevel;
  const completeness = Math.max(0, 100 - profile.missingValues) / 100;

  for (const fn of ontology) {
    let score = 0.5;
    const reasons: string[] = [];

    for (const feat of profile.features) {
      const hinted = FEATURE_TO_FUNCTION_HINTS[feat];
      if (hinted?.includes(fn.id)) {
        score += 0.12;
        reasons.push(`${feat}`);
      }
    }
    if (profile.dataTypes['Sensor'] === 'Continuous' && ['F001', 'F002', 'F003'].includes(fn.id)) {
      score += 0.08;
      reasons.push('Continuous sensor data');
    }
    score = Math.min(1, score * signalStrength * (0.9 + completeness * 0.1));

    const rationale =
      reasons.length > 0
        ? `Data profile (${reasons.slice(0, 3).join(', ')}) aligns with ${fn.name}.`
        : `General fit for ${industry} and current data scale (${profile.recordsCount} records).`;

    matches.push({
      functionId: fn.id,
      score: Math.round(score * 100) / 100,
      rationale,
      priority: score >= 0.7 ? 1 : score >= 0.5 ? 2 : 3,
    });
  }

  matches.sort((a, b) => b.score - a.score);
  const priorityOrder = [1, 2, 3];
  let p = 0;
  for (const m of matches) {
    m.priority = priorityOrder[Math.min(p++, priorityOrder.length - 1)];
  }

  const summary = `산업데이터 ${featureCount}개 피처, ${profile.recordsCount}건 기준 필요기능–표준기능 매칭 결과입니다. 신호 강도 ${(signalStrength * 100).toFixed(0)}%, 완전도 ${(completeness * 100).toFixed(0)}%이며, ${industry} 도메인에 맞는 MES 기능 우선순위를 제안합니다.`;
  const augmentationSuggestions = [
    '시계열 집계 추가로 계절성 반영 (증강분석 활용)',
    '주요 센서 채널 SPC 한계값 검토',
    '보전 이력 데이터 보강으로 PdM 정확도 향상',
  ];

  return { matches, summary, augmentationSuggestions };
}

export const analysisService = {
  analyzeDataAndMatch,
};
