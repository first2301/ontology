import type { DataProfile } from '../types';

/** CSV 파싱 결과: AutoML용 features/target + 매칭용 DataProfile */
export interface ParsedCsvResult {
  features: number[][];
  target: number[];
  profile: DataProfile;
}

const MAX_ROWS = 5000;

/**
 * CSV 파일을 읽어 AutoML용 features(2D), target(1D)과 DataProfile을 반환합니다.
 * 첫 줄은 헤더, 마지막 컬럼은 target, 나머지는 feature 컬럼으로 간주합니다.
 * 숫자로 변환 불가 행은 건너뛰며, 최대 MAX_ROWS행만 사용합니다.
 */
export async function parseCsvForAutoml(file: File): Promise<ParsedCsvResult | null> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return null;

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim());
  if (headers.length < 2) return null;

  const featureNames = headers.slice(0, -1);
  const targetName = headers[headers.length - 1];
  const rows: number[][] = [];
  let missingCount = 0;

  for (let i = 1; i < lines.length && rows.length < MAX_ROWS; i++) {
    const cells = lines[i].split(delimiter).map((c) => c.trim());
    if (cells.length !== headers.length) continue;

    const row: number[] = [];
    let valid = true;
    for (let c = 0; c < cells.length; c++) {
      const num = Number(cells[c]);
      if (Number.isNaN(num)) {
        missingCount++;
        valid = false;
        break;
      }
      row.push(num);
    }
    if (valid && row.length) rows.push(row);
  }

  if (rows.length < 2) return null;

  const features = rows.map((row) => row.slice(0, -1));
  const target = rows.map((row) => row[row.length - 1]);

  const profile: DataProfile = {
    features: featureNames,
    recordsCount: rows.length,
    noiseLevel: 0.15,
    seasonality: true,
    missingValues: Math.min(100, missingCount),
    dataTypes: Object.fromEntries(featureNames.map((f) => [f, 'Continuous'])),
  };

  return { features, target, profile };
}
