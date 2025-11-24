// src/lib/algorithms.ts
// ======================
//  알고리즘 모음 파일
//  - 야드 위험도 분석
//  - 컨테이너 ETA(예상 처리 완료 시간)
// ======================

import {
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from "../store/mainstore";

// 알고리즘이 계산한 위험도 레벨
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

// 야드 구역(예: A, B, C...)별 위험도 결과
export type AreaRisk = {
  areaKey: string; // 예: "A", "B"
  score: number;   // 0~100 사이 점수
  level: RiskLevel;
};

/* -----------------------------
 *  심각도 / 상태 / 시간 가중치
 * ----------------------------- */

// 심각도별 가중치
function severityWeight(severity: IncidentSeverity): number {
  switch (severity) {
    case "중대":
      return 3;
    case "보통":
      return 2;
    case "경미":
    default:
      return 1;
  }
}

// 상태별 가중치
function statusFactor(status: IncidentStatus): number {
  switch (status) {
    case "진행중":
      return 1.2;
    case "조치완료":
      return 0.7;
    default:
      return 1;
  }
}

// "발생 시간" 문자열 → Date 변환 시도
function parseIncidentTime(timeStr: string): Date | null {
  if (!timeStr) return null;

  // 예: "2025-10-31 (13:45)" → "2025-10-31 13:45"
  const cleaned = timeStr.replace("(", " ").replace(")", "");
  const d = new Date(cleaned);
  if (isNaN(d.getTime())) {
    return null;
  }
  return d;
}

// 최근일수록 더 높은 가중치
function recencyFactor(timeStr: string, now: Date): number {
  const t = parseIncidentTime(timeStr);
  if (!t) return 1; // 파싱 실패 시 기본값

  const diffMs = now.getTime() - t.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= 2) return 1.3;   // 2시간 이내
  if (diffHours <= 24) return 1.0;  // 24시간 이내
  return 0.6;                       // 그 이상은 위험도 감소
}

/* ===========================================
 * 1. 야드 구역별 위험도 계산 알고리즘
 *    - Incident 목록을 입력으로 받아
 *      "A구역, B구역..." 별 위험도 점수/등급을 계산
 * =========================================== */

export function calcAreaRisk(incidents: Incident[]): AreaRisk[] {
  const now = new Date();
  const scoreByArea = new Map<string, number>();

  incidents.forEach((incident) => {
    // 위치 문자열에서 첫 글자(A, B...)를 구역 키로 사용
    const loc = (incident.location || "").trim();
    const areaKey = loc[0] || "기타";

    const base =
      severityWeight(incident.severity) *
      statusFactor(incident.status) *
      recencyFactor(incident.time, now);

    scoreByArea.set(areaKey, (scoreByArea.get(areaKey) || 0) + base);
  });

  // 0~100 스케일로 정규화
  let maxScore = 0;
  scoreByArea.forEach((v) => {
    if (v > maxScore) maxScore = v;
  });

  const result: AreaRisk[] = [];
  scoreByArea.forEach((rawScore, areaKey) => {
    const score =
      maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

    let level: RiskLevel = "LOW";
    if (score >= 60) level = "HIGH";
    else if (score >= 30) level = "MEDIUM";

    result.push({ areaKey, score, level });
  });

  // 점수 높은 순으로 정렬
  result.sort((a, b) => b.score - a.score);

  return result;
}

/* ===========================================
 * 2. 컨테이너 ETA(예상 처리 완료 시간) 계산
 *    - 컨테이너의 구역(area) + 해당 구역 위험도
 *      를 이용해서 처리 소요 시간을 단순 계산
 * =========================================== */

export type EtaInfo = {
  etaText: string;     // "13:40 (예상)" 형태
  delayMinutes: number; // 위험도로 인해 추가된 지연(분)
  totalMinutes: number; // 총 소요 시간(분)
  riskLevel: RiskLevel; // 사용된 위험도 레벨
};

export function calcEtaForContainer(
  container: { area: string; departDate?: string },
  areaRisks: AreaRisk[],
  now: Date = new Date()
): EtaInfo {
  const areaKey = (container.area || "").trim()[0] || "기타";

  const risk = areaRisks.find((r) => r.areaKey === areaKey)?.level ?? "LOW";

  // 기본 처리 시간 (분)
  const baseMinutes = 40;

  // 위험도에 따라 지연 시간 추가
  let riskDelay = 0;
  if (risk === "HIGH") riskDelay = 20;
  else if (risk === "MEDIUM") riskDelay = 10;

  const totalMinutes = baseMinutes + riskDelay;

  const etaDate = new Date(now.getTime() + totalMinutes * 60 * 1000);
  const hh = etaDate.getHours().toString().padStart(2, "0");
  const mm = etaDate.getMinutes().toString().padStart(2, "0");

  return {
    etaText: `${hh}:${mm} (예상)`,
    delayMinutes: riskDelay,
    totalMinutes,
    riskLevel: risk,
  };
}