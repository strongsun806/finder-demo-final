// src/lib/algorithms/rehandlePattern.ts
// 컨테이너 배치 재작업(리핸들) 최소화를 위한 패턴 분석
// - 과거 이동 로그와 현재 적치 상태를 분석하여 bay/row/tier별 재작업 위험 점수(0~1)를 추정
// - 신규 입고 컨테이너에 대해 '권장 적치 슬롯'을 추천
//
// 입력 데이터 예시:
// yardSlots: { id:'B12-R03-T04', bay:12, row:3, tier:4, size:'40', reefer:false, weight: t, occupied?:boolean, dwell?:number }
// moves: [{time, fromSlot?, toSlot?, reason:'LOAD'|'DISCH'|'SHIFT', rehandle:boolean }]
//
// 방법 요약:
// 1) 슬롯별 rehandle ratio = rehandle_moves / total_moves (시간감가 가중치 적용; 최근일수록 가중)
// 2) 혼잡도(인접 슬롯 점유율), 같은 행의 dwell-time 분산, 출고 패턴 분리 등을 반영
// 3) 점수 = sigmoid( α*ratio + β*혼잡 + γ*분산 ) 로 0~1 정규화
// 4) 신규 컨테이너 features(사이즈/중량/예상체류일/냉동 등) 제약을 만족하는 후보 중 위험 점수 최소 + 운영 규칙 충족하는 슬롯 추천
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

export type RiskScore = { slotId:string; score:number; factors: { ratio:number; crowd:number; dwellVar:number } };

function sigmoid(x:number){ return 1/(1+Math.exp(-x)); }

export function computeRehandleRisk(slots: YardSlot[], moves: MoveLog[], now: number){
  const slotIdx = new Map(slots.map(s=>[s.id, s]));
  const stats = new Map<string, {total:number; reh:number}>();
  const decayHalfLife = 14*24*3600*1000; // 14일 반감기

  for (const m of moves){
    if (!m.toSlot && !m.fromSlot) continue;
    const hit = m.toSlot || m.fromSlot!;
    const age = Math.max(1, (now - m.time));
    const w = Math.pow(0.5, age/decayHalfLife);
    const st = stats.get(hit) || {total:0, reh:0};
    st.total += w;
    if (m.rehandle) st.reh += w;
    stats.set(hit, st);
  }

  // 혼잡도: 같은 bay/row 인접 슬롯 점유율
  const occupiedSet = new Set(slots.filter(s=>s.occupied).map(s=>s.id));
  const groupKey = (s: YardSlot) => `${s.bay}-${s.row}`;
  const groups = new Map<string, YardSlot[]>();
  for (const s of slots){
    const k = groupKey(s);
    (groups.get(k) || groups.set(k, []).get(k)!).push(s);
  }

  const scores: RiskScore[] = [];
  for (const s of slots){
    const st = stats.get(s.id) || {total:0, reh:0};
    const ratio = st.total>0 ? (st.reh/st.total) : 0;
    const neigh = groups.get(groupKey(s)) || [];
    const crowd = neigh.length>0 ? (neigh.filter(n=>n.occupied).length / neigh.length) : 0;
    // dwell 분산(같은 row 내): 체류일 다양성이 크면 혼선↑
    const dwellVals = neigh.map(n=>n.dwell||0);
    const mean = dwellVals.reduce((a,b)=>a+b,0)/(dwellVals.length||1);
    const varr = dwellVals.reduce((a,b)=>a+(b-mean)*(b-mean),0)/(Math.max(1,dwellVals.length-1));
    const dwellVar = Math.min(1, varr/25); // 대략 표준편차 5일 기준 정규화

    const α=3, β=1.5, γ=1;
    const score = sigmoid( α*ratio + β*crowd + γ*dwellVar );
    scores.push({ slotId: s.id, score, factors:{ratio, crowd, dwellVar} });
  }

  return scores.sort((a,b)=>b.score-a.score);
}

export function recommendSlot(slots: YardSlot[], scores: RiskScore[], cargo: NewContainer){
  const ok = slots.filter(s=> !s.occupied
    && s.size === cargo.size
    && (!cargo.reefer || s.reefer)
    && (cargo.weight==null || s.maxWeight==null || s.maxWeight>=cargo.weight)
  );
  // 위험 점수 낮고, 같은 row의 평균 dwell이 cargo의 estDwellDays와 유사한 곳 선호
  const byId = new Map(scores.map(s=>[s.slotId, s.score]));
  let best = null as null | {slot: YardSlot; score:number; dwellGap:number};
  for (const s of ok){
    const sc = byId.get(s.id) ?? 0.5;
    const dwellGap = Math.abs((s.dwell||3) - (cargo.estDwellDays||3));
    const total = sc + 0.05*dwellGap; // dwell 유사성 약간 가중
    if (!best || total < best.score) best = {slot:s, score:total, dwellGap};
  }
  return best?.slot || null;
}
