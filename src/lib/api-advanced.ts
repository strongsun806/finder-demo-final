// src/lib/api-advanced.ts
// 고급 알고리즘 모음: ETA 스케줄링 / 재작업 위험 분석 / 혼잡 예측 경로
// 외부 의존성 없이 단일 파일로 동작하도록 구현되었습니다.

/////////////////////////////
// 1) ETA 기반 작업 최적화 //
/////////////////////////////

export type ResourceType = "QC" | "YC" | "TT";

export type ETAInput = {
  now: number; // epoch ms
  resources: Array<{
    id: string;
    type: ResourceType;
    pos: [number, number]; // yard 좌표
    availableAt?: number;  // 비는 시각(ms)
  }>;
  jobs: Array<{
    id: string;
    kind: "LOAD" | "DISCH" | "SHIFT" | "REMOVAL";
    from?: [number, number];
    to?: [number, number];
    readyAt: number;        // 초 단위 (서버 델타 고려)
    duration: number;       // 초 단위
    priority?: number;      // 1~5 (기본 3)
    rehandleRisk?: number;  // 0~1
    requires?: ResourceType[];
  }>;
  weights?: { wait?: number; move?: number; rehandle?: number; priority?: number };
};

export type Assignment = {
  resourceId: string;
  jobId: string;
  start: number; // ms
  end: number;   // ms
  cost: number;
};

function dist(a: [number, number], b: [number, number]) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.hypot(dx, dy);
}

export function scheduleByETA(input: ETAInput) {
  const W = { wait: 1, move: 0.2, rehandle: 5, priority: -2, ...(input.weights || {}) };
  const now = input.now;
  const resState = new Map(
    input.resources.map(r => [r.id, { ...r, availableAt: r.availableAt ?? now }])
  );

  // 우선순위 높은 작업 먼저
  const jobs = [...input.jobs].sort(
    (a, b) => (b.priority ?? 3) - (a.priority ?? 3) || a.readyAt - b.readyAt
  );

  const assigns: Assignment[] = [];

  for (const j of jobs) {
    const needs = j.requires ?? ["YC"];
    let best: Assignment | undefined;

    for (const r of resState.values()) {
      if (!needs.includes(r.type)) continue;

      const rFree = Math.max(r.availableAt!, now);
      const from = j.from ?? r.pos;
      const moveTimeSec = dist(r.pos, from) * 2; // 단순 스케일을 2로
      const estStart = Math.max(rFree, j.readyAt * 1000) + moveTimeSec * 1000;
      const end = estStart + j.duration * 1000;

      const waitSec = Math.max(0, (estStart - now) / 1000);
      const moveCost = moveTimeSec;
      const rehandle = j.rehandleRisk ?? 0;
      const priority = j.priority ?? 3;

      const cost =
        W.wait * waitSec + W.move * moveCost + W.rehandle * rehandle + W.priority * priority;

      const cand: Assignment = { resourceId: r.id, jobId: j.id, start: estStart, end, cost };
      if (!best || cand.cost < best.cost) best = cand;
    }

    if (best) {
      assigns.push(best);
      const r = resState.get(best.resourceId)!;
      r.availableAt = best.end;
      const job = input.jobs.find(x => x.id === best.jobId);
      if (job?.to) r.pos = job.to;
    }
  }

  return { assignments: assigns.sort((a, b) => a.start - b.start) };
}

export function rescheduleIncremental(prev: Assignment[], input: ETAInput, lockMs = 60_000) {
  const locked = new Set<string>();
  const now = input.now;
  const keep: Assignment[] = [];
  for (const a of prev) {
    if (a.start <= now && a.end >= now) {
      keep.push(a); locked.add(a.jobId);
    } else if (a.start - now < lockMs) {
      keep.push(a); locked.add(a.jobId);
    }
  }
  const remainingJobs = input.jobs.filter(j => !locked.has(j.id));
  const remainingRes = input.resources;
  const next = scheduleByETA({ ...input, jobs: remainingJobs, resources: remainingRes }).assignments;
  return { assignments: [...keep, ...next].sort((a, b) => a.start - b.start) };
}

/////////////////////////////////////////////
// 2) 재작업(리핸들) 최소화 패턴 분석/추천 //
/////////////////////////////////////////////

export type YardSlot = {
  id: string;
  bay: number; row: number; tier: number;
  size: "20" | "40";
  reefer?: boolean;
  maxWeight?: number;
  occupied?: boolean;
  dwell?: number; // 평균 체류일
};

export type MoveLog = {
  time: number; // epoch ms
  fromSlot?: string;
  toSlot?: string;
  reason: "LOAD"|"DISCH"|"SHIFT"|"REMOVAL";
  rehandle: boolean;
};

export type NewContainer = {
  size: "20"|"40";
  weight?: number;
  reefer?: boolean;
  estDwellDays?: number;
};

export type RiskScore = { slotId:string; score:number; factors:{ratio:number; crowd:number; dwellVar:number} };

function sigmoid(x:number){ return 1/(1+Math.exp(-x)); }

export function computeRehandleRisk(slots: YardSlot[], moves: MoveLog[], now: number) {
  const stats = new Map<string, { total: number; reh: number }>();
  const half = 14 * 24 * 3600 * 1000; // 14일 반감기

  for (const m of moves) {
    const hit = m.toSlot || m.fromSlot;
    if (!hit) continue;
    const age = Math.max(1, now - m.time);
    const w = Math.pow(0.5, age / half);
    const st = stats.get(hit) || { total: 0, reh: 0 };
    st.total += w;
    if (m.rehandle) st.reh += w;
    stats.set(hit, st);
  }

  const key = (s: YardSlot) => `${s.bay}-${s.row}`;
  const groups = new Map<string, YardSlot[]>();
  for (const s of slots) {
    const k = key(s);
    (groups.get(k) || groups.set(k, []).get(k)!).push(s);
  }

  const out: RiskScore[] = [];
  for (const s of slots) {
    const st = stats.get(s.id) || { total: 0, reh: 0 };
    const ratio = st.total > 0 ? st.reh / st.total : 0;
    const neigh = groups.get(key(s)) || [];
    const crowd = neigh.length ? neigh.filter(n => n.occupied).length / neigh.length : 0;

    const dwellVals = neigh.map(n => n.dwell || 0);
    const mean = dwellVals.reduce((a,b)=>a+b,0) / (dwellVals.length || 1);
    const v = dwellVals.reduce((a,b)=>a+(b-mean)*(b-mean),0) / Math.max(1, dwellVals.length - 1);
    const dwellVar = Math.min(1, v / 25); // 표준편차 ~5일 기준

    const α=3, β=1.5, γ=1;
    const score = sigmoid(α*ratio + β*crowd + γ*dwellVar);
    out.push({ slotId: s.id, score, factors: { ratio, crowd, dwellVar } });
  }

  return out.sort((a,b)=>b.score-a.score);
}

export function recommendSlot(slots: YardSlot[], scores: RiskScore[], cargo: NewContainer) {
  const ok = slots.filter(s =>
    !s.occupied &&
    s.size === cargo.size &&
    (!cargo.reefer || s.reefer) &&
    (cargo.weight == null || s.maxWeight == null || s.maxWeight >= cargo.weight)
  );
  const byId = new Map(scores.map(s => [s.slotId, s.score]));
  let best: {slot: YardSlot; total: number} | null = null;
  for (const s of ok) {
    const sc = byId.get(s.id) ?? 0.5;
    const dwellGap = Math.abs((s.dwell || 3) - (cargo.estDwellDays || 3));
    const total = sc + 0.05 * dwellGap;
    if (!best || total < best.total) best = { slot: s, total };
  }
  return best?.slot || null;
}

////////////////////////////////////////////
// 3) 혼잡도 예측(EWMA) + 경로 추천(A*)  //
////////////////////////////////////////////

export type Node = { id:string; x:number; y:number };
export type Edge = { id:string; from:string; to:string; baseCost:number };
export type Telemetry = { time:number; edgeId:string; travelSec:number };

type Model = { ewma: Map<string, number>; alpha: number };

export function createModel(alpha=0.25): Model {
  return { ewma: new Map(), alpha };
}

export function updateModel(model: Model, samples: Telemetry[]) {
  const a = model.alpha;
  for (const s of samples) {
    const prev = model.ewma.get(s.edgeId) ?? s.travelSec;
    const next = a * s.travelSec + (1 - a) * prev;
    model.ewma.set(s.edgeId, next);
  }
}

function h(a:Node,b:Node){ return Math.hypot(a.x-b.x, a.y-b.y); }

export function bestRoute(nodes: Node[], edges: Edge[], model: Model, startId: string, goalId: string){
  const byId = new Map(nodes.map(n=>[n.id,n]));
  const adj = new Map<string, Edge[]>();
  for (const e of edges){
    (adj.get(e.from) || adj.set(e.from, []).get(e.from)!).push(e);
    // 양방향 가정
    (adj.get(e.to) || adj.set(e.to, []).get(e.to)!).push({ ...e, from: e.to, to: e.from, id: e.id + ":rev" });
  }

  const open = new Set<string>([startId]);
  const came = new Map<string,string>();
  const g = new Map<string, number>([[startId, 0]]);
  const f = new Map<string, number>([[startId, h(byId.get(startId)!, byId.get(goalId)!)]]);

  function lowest(){
    let m: string | null = null, mv = Infinity;
    for (const v of open){
      const fv = f.get(v) ?? Infinity;
      if (fv < mv){ mv = fv; m = v; }
    }
    return m;
  }

  while (open.size){
    const cur = lowest()!;
    if (cur === goalId){
      const path=[cur];
      while (came.has(path[path.length-1])){
        path.push(came.get(path[path.length-1])!);
      }
      path.reverse();
      const epath: string[] = [];
      for (let i=0;i<path.length-1;i++){
        const u=path[i], v=path[i+1];
        const es = adj.get(u) || [];
        const e = es.find(E=>E.to===v)!;
        epath.push(e.id.replace(":rev",""));
      }
      return { nodes: path, edges: Array.from(new Set(epath)) };
    }
    open.delete(cur);
    const curG = g.get(cur) ?? Infinity;
    for (const e of adj.get(cur) || []){
      const pred = model.ewma.get(e.id.replace(":rev","")) ?? e.baseCost;
      const w = Math.max(1, pred);
      const ng = curG + w;
      if (ng < (g.get(e.to) ?? Infinity)){
        came.set(e.to, cur);
        g.set(e.to, ng);
        f.set(e.to, ng + h(byId.get(e.to)!, byId.get(goalId)!));
        open.add(e.to);
      }
    }
  }
  return { nodes: [], edges: [] };
}

/////////////////////////////
// Export: 고수준 래퍼 API //
/////////////////////////////

export const adv = {
  // 1) ETA
  optimizeByETA(input: ETAInput) {
    return scheduleByETA(input);
  },
  reschedule(prev: Assignment[], input: ETAInput, lockMs?: number) {
    return rescheduleIncremental(prev, input, lockMs);
  },

  // 2) 재작업 위험/추천
  rehandleRisk(slots: YardSlot[], moves: MoveLog[], now: number) {
    return computeRehandleRisk(slots, moves, now);
  },
  recommendSlot(slots: YardSlot[], scores: RiskScore[], cargo: NewContainer) {
    return recommendSlot(slots, scores, cargo);
  },

  // 3) 경로 추천
  route(nodes: Node[], edges: Edge[], telemetry: Telemetry[], startId: string, goalId: string) {
    const model = createModel();
    updateModel(model, telemetry);
    const path = bestRoute(nodes, edges, model, startId, goalId);
    return { model, path };
  }
};
