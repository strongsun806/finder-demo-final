// src/lib/algorithms/congestionRouter.ts
// AI 혼잡도 예측 + 실시간 경로 추천
// - 시간대별/이벤트 기반으로 edge 통행시간을 EWMA로 학습하여 예측
// - 예측 가중을 A* (휴리스틱: 유클리드 거리) 비용에 반영하여 경로 도출
export type Node = { id:string; x:number; y:number };
export type Edge = { id:string; from:string; to:string; baseCost:number; };
export type Telemetry = { time:number; edgeId:string; travelSec:number };

type Model = {
  ewma: Map<string, number>; // edgeId -> 예측 통행시간(초)
  alpha: number; // 0~1 (최근치 반영률)
};

export function createModel(alpha=0.25): Model{
  return { ewma: new Map(), alpha };
}

export function updateModel(model: Model, samples: Telemetry[]){
  const a = model.alpha;
  for (const s of samples){
    const prev = model.ewma.get(s.edgeId) ?? s.travelSec;
    const next = a * s.travelSec + (1-a) * prev;
    model.ewma.set(s.edgeId, next);
  }
}

function h(a:Node,b:Node){ return Math.hypot(a.x-b.x, a.y-b.y); }

export function bestRoute(nodes: Node[], edges: Edge[], model: Model, startId:string, goalId:string){
  const byId = new Map(nodes.map(n=>[n.id,n]));
  const adj = new Map<string, Edge[]>();
  for (const e of edges){
    (adj.get(e.from) || adj.set(e.from, []).get(e.from)!).push(e);
    // 양방향 가정
    (adj.get(e.to) || adj.set(e.to, []).get(e.to)!).push({ ...e, from:e.to, to:e.from, id: e.id+":rev" });
  }

  const open = new Set<string>([startId]);
  const came = new Map<string,string>();
  const g = new Map<string, number>([[startId, 0]]);
  const f = new Map<string, number>([[startId, h(byId.get(startId)!, byId.get(goalId)!)]]);

  function lowestF(){
    let m=null, mv=Infinity;
    for (const v of open){
      const fv = f.get(v) ?? Infinity;
      if (fv<mv){ mv=fv; m=v; }
    }
    return m;
  }

  while (open.size){
    const cur = lowestF()!;
    if (cur===goalId){
      // reconstruct
      const path=[cur];
      while (came.has(path[path.length-1])){
        path.push(came.get(path[path.length-1])!);
      }
      path.reverse();
      // edge 리스트 구성
      const edgePath:string[]=[]
      for (let i=0;i<path.length-1;i++){
        const u=path[i], v=path[i+1];
        const es = adj.get(u) || [];
        const e = es.find(E=>E.to===v)!;
        edgePath.push(e.id.replace(":rev",""));
      }
      return { nodes:path, edges: Array.from(new Set(edgePath)) };
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
  return { nodes:[], edges:[] };
}
