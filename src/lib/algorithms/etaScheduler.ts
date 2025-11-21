// src/lib/algorithms/etaScheduler.ts
// ETA 기반 작업 최적화 알고리즘
// - 외부 트럭/야드 트랙터의 도착 ETA, 작업 소요 시간, 우선순위를 반영해 장비(크레인/트랙터 등)에 작업을 동적으로 배정한다.
//
// 1) 각 작업 j 에 대해 (earliestStart = max(ETA(resource-side), ETA(job-ready)))
// 2) 비용함수 C = w_wait * 대기시간 + w_move * 장비이동거리 + w_rehandle * 재작업위험
// 3) Hungarian 대신 빠른 근사: (자원 x 작업) 후보를 스코어링하고 우선순위큐로 배정
// 4) 새 ETA/이벤트 발생 시 event-driven 재스케줄 (soft lock 으로 이미 시작한 작업은 유지)
//
// 타입 정의
export type ETAInput = {
  now: number; // epoch ms
  resources: Array<{
    id: string;
    type: "QC" | "YC" | "TT"; // QC: Quay Crane, YC: Yard Crane, TT: Tractor
    pos: [number, number]; // yard 좌표
    availableAt?: number; // 장비가 비는 시각 (ms)
  }>;
  jobs: Array<{
    id: string;
    kind: "LOAD" | "DISCH" | "SHIFT" | "REMOVAL";
    from?: [number, number]; // 시작 위치(야드/선석)
    to?: [number, number];   // 목적 위치
    readyAt: number;         // 화물 준비 시각(ETA)
    duration: number;        // 처리시간 추정(초)
    priority?: number;       // 1(낮음)~5(높음) 기본 3
    rehandleRisk?: number;   // 0~1
    requires?: ("QC"|"YC"|"TT")[]; // 필요장비 유형
  }>;
  weights?: { wait?: number; move?: number; rehandle?: number; priority?: number };
};

export type Assignment = {
  resourceId: string;
  jobId: string;
  start: number;
  end: number;
  cost: number;
};

function distance(a:[number,number], b:[number,number]){
  const dx=a[0]-b[0], dy=a[1]-b[1];
  return Math.hypot(dx,dy);
}

/** ETA 기반 스케줄링 (단발 실행) */
export function scheduleByETA(input: ETAInput){
  const W = { wait: 1, move: 0.2, rehandle: 5, priority: -2, ...(input.weights||{}) };
  const now = input.now;
  const resState = new Map(input.resources.map(r => [r.id, { ...r, availableAt: r.availableAt ?? now }]));

  // 작업 정렬: (priority desc, readyAt asc)
  const jobs = [...input.jobs].sort((a,b)=> (b.priority??3)-(a.priority??3) || a.readyAt-b.readyAt);
  const assigns: Assignment[] = [];

  for (const j of jobs){
    const needs = j.requires ?? ["YC"];
    let best: Assignment|undefined;

    for (const r of resState.values()){
      if (!needs.includes(r.type)) continue;
      const rFree = Math.max(r.availableAt!, now);
      const from = j.from ?? r.pos;
      const moveTime = distance(r.pos, from) * 2; // 단순화된 초 단위 이동시간 (스케일링 상수=2)
      const estStart = Math.max(rFree, j.readyAt*1000) + moveTime*1000;
      const end = estStart + j.duration*1000;
      const waitSec = Math.max(0, (estStart - now)/1000);
      const moveCost = moveTime;
      const rehandle = j.rehandleRisk??0;
      const priority = j.priority??3;

      const cost = W.wait*waitSec + W.move*moveCost + W.rehandle*rehandle + W.priority*priority;
      const candidate: Assignment = { resourceId: r.id, jobId: j.id, start: estStart, end, cost };
      if (!best || candidate.cost < best.cost) best = candidate;
    }

    if (best){
      assigns.push(best);
      // 상태 갱신
      const r = resState.get(best.resourceId)!;
      r.availableAt = best.end;
      // 리소스 위치를 작업 목적지로 이동했다고 가정
      if (j.to) r.pos = j.to;
    }
  }

  return { assignments: assigns.sort((a,b)=>a.start-b.start) };
}

/** 실시간 이벤트를 반영하여 일부만 재스케줄 */
export function rescheduleIncremental(prev: Assignment[], input: ETAInput, lockMs=60_000){
  const locked = new Set<string>();
  const now = input.now;
  const keep: Assignment[] = [];
  for (const a of prev){
    if (a.start <= now && a.end >= now) { // 진행중은 잠금
      keep.push(a);
      locked.add(a.jobId);
    } else if (a.start - now < lockMs){   // 임박 작업도 잠금
      keep.push(a);
      locked.add(a.jobId);
    }
  }
  const remainingJobs = input.jobs.filter(j=>!locked.has(j.id));
  const remainingRes = input.resources;
  const next = scheduleByETA({ ...input, jobs: remainingJobs, resources: remainingRes }).assignments;
  return { assignments: [...keep, ...next].sort((a,b)=>a.start-b.start) };
}
