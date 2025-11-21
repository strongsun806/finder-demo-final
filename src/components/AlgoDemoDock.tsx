import React from "react";
import { adv } from "../lib/api-advanced";

type Props = { route: string }; // "tasks" | "yard" | "realtime" 등

export default function AlgoDemoDock({ route }: Props) {
  const [open, setOpen] = React.useState(false);
  const title =
    route === "tasks" ? "ETA 최적화(데모)"
    : route === "yard" ? "재작업 위험 분석(데모)"
    : route === "realtime" ? "혼잡 예측 경로(데모)"
    : null;

  if (!title) return null;

  return (
    <>
      {/* 고정 버튼 */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", right: 16, bottom: 16, zIndex: 2000,
          padding: "10px 14px", borderRadius: 999,
          background: "#111827", color: "#e5e7eb",
          border: "1px solid #334155", cursor: "pointer",
          boxShadow: "0 6px 16px rgba(0,0,0,.24)"
        }}
        title={`${title} 열기`}
      >
        알고리즘 데모
      </button>

      {/* 모달 */}
      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 2100,
            background: "rgba(2,6,23,.55)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(960px, 92vw)",
              maxHeight: "86vh",
              overflow: "auto",
              background: "#0e1530",
              color: "#e6ecff",
              border: "1px solid #1f2a44",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 20px 40px rgba(0,0,0,.35)"
            }}
          >
            <div style={{display:"flex", alignItems:"center", marginBottom:8}}>
              <h3 style={{margin:0, fontSize:18}}>{title}</h3>
              <div style={{flex:1}} />
              <button onClick={()=>setOpen(false)} style={btnGhost}>닫기</button>
            </div>

            {route === "tasks" && <EtaPanel />}
            {route === "yard" && <RehandlePanel />}
            {route === "realtime" && <RoutePanel />}
          </div>
        </div>
      )}
    </>
  );
}

function EtaPanel() {
  const [assignments, setAssignments] = React.useState<
    ReturnType<typeof adv.optimizeByETA>["assignments"]
  >([]);
  const [loading, setLoading] = React.useState(false);

  const run = () => {
    setLoading(true);
    const now = Date.now();
    const input = {
      now,
      resources: [
        { id: "QC-1", type: "QC" as const, pos: [0, 0] as [number, number] },
        { id: "YC-11", type: "YC" as const, pos: [100, 10] as [number, number] },
        { id: "TT-7", type: "TT" as const, pos: [60, 40] as [number, number] },
      ],
      jobs: [
        { id:"J1", kind:"DISCH" as const, from:[0,0] as [number,number], to:[100,10] as [number,number], readyAt:Math.floor(now/1000)+300, duration:600, priority:5, requires:["QC" as const] },
        { id:"J2", kind:"SHIFT" as const, from:[100,10] as [number,number], to:[120,20] as [number,number], readyAt:Math.floor(now/1000)+100, duration:300, priority:3, requires:["YC" as const] },
        { id:"J3", kind:"REMOVAL" as const, from:[80,40] as [number,number], to:[20,10] as [number,number], readyAt:Math.floor(now/1000)+30, duration:420, priority:4, requires:["TT" as const], rehandleRisk:0.3 },
      ],
      weights: { wait: 1, move: 0.2, rehandle: 5, priority: -2 },
    };
    const { assignments } = adv.optimizeByETA(input);
    setAssignments(assignments);
    setLoading(false);
  };

  return (
    <section>
      <div style={{display:"flex", gap:8, marginBottom:8}}>
        <button onClick={run} disabled={loading} style={btnPrimary}>
          {loading ? "최적화 중..." : "실행"}
        </button>
        <button onClick={()=>setAssignments([])} style={btnGhost}>초기화</button>
      </div>

      {assignments.length>0 && (
        <>
          <div style={{ overflowX:"auto" }}>
            <table style={table}>
              <thead>
                <tr>
                  <th>Resource</th><th>Job</th><th>Start</th><th>End</th><th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(a=>(
                  <tr key={`${a.resourceId}-${a.jobId}-${a.start}`}>
                    <td>{a.resourceId}</td>
                    <td>{a.jobId}</td>
                    <td>{new Date(a.start).toLocaleString()}</td>
                    <td>{new Date(a.end).toLocaleString()}</td>
                    <td>{a.cost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h4 style={{margin:"12px 0 6px"}}>간단 타임라인</h4>
          <Timeline assignments={assignments}/>
        </>
      )}
    </section>
  );
}

function RehandlePanel(){
  const [scores, setScores] = React.useState<ReturnType<typeof adv.rehandleRisk>>([]);
  const [recommend, setRecommend] = React.useState<any>(null);
  const now = Date.now();
  const slots = [
    { id:"B1-R1-T1", bay:1,row:1,tier:1,size:"40" as const,occupied:false,dwell:3 },
    { id:"B1-R1-T2", bay:1,row:1,tier:2,size:"40" as const,occupied:true,dwell:7 },
    { id:"B1-R2-T1", bay:1,row:2,tier:1,size:"40" as const,occupied:false,dwell:5, reefer:true },
    { id:"B2-R1-T1", bay:2,row:1,tier:1,size:"20" as const,occupied:false,dwell:2 },
  ];
  const moves = [
    { time: now-2*3600*1000, toSlot:"B1-R1-T2", reason:"DISCH" as const, rehandle:false },
    { time: now-1*3600*1000, fromSlot:"B1-R1-T2", toSlot:"B1-R2-T1", reason:"SHIFT" as const, rehandle:true },
  ];
  const cargo = { size:"40" as const, estDwellDays:3 };

  const analyze = () => setScores(adv.rehandleRisk(slots, moves, Date.now()));
  const recommendSlot = () => {
    if (!scores.length) analyze();
    setRecommend(adv.recommendSlot(slots, scores, cargo));
  };

  return (
    <section>
      <div style={{display:"flex", gap:8, marginBottom:8}}>
        <button onClick={analyze} style={btnPrimaryGreen}>위험 분석</button>
        <button onClick={recommendSlot} style={btnGhostGreen}>권장 슬롯</button>
        <button onClick={()=>{ setScores([]); setRecommend(null); }} style={btnGhost}>초기화</button>
      </div>

      {scores.length>0 && (
        <div style={{ overflowX:"auto" }}>
          <table style={table}>
            <thead><tr><th>Slot</th><th>Score</th><th>ratio</th><th>crowd</th><th>dwellVar</th></tr></thead>
            <tbody>
              {scores.map(s=>(
                <tr
                  key={s.slotId}
                  style={{
                    background: heat(s.score),
                    color: "#111"
                  }}
                >
                  <td>{s.slotId}</td>
                  <td>{s.score.toFixed(3)}</td>
                  <td>{s.factors.ratio.toFixed(3)}</td>
                  <td>{s.factors.crowd.toFixed(3)}</td>
                  <td>{s.factors.dwellVar.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {recommend && (
        <div style={{ marginTop:10, padding:10, border:"1px solid #334155", borderRadius:8, background:"#f9fafb", color:"#111" }}>
          <b>권장 슬롯:</b> {recommend.id} (bay {recommend.bay}, row {recommend.row}, tier {recommend.tier})
        </div>
      )}
    </section>
  );

  function heat(score:number){
    const hue = (1 - score) * 220; // 낮음=파랑, 높음=빨강
    return `hsl(${hue}, 85%, 92%)`;
  }
}

function RoutePanel(){
  const [learned, setLearned] = React.useState<Record<string, number>>({});
  const [path, setPath] = React.useState<{nodes:string[]; edges:string[]} | null>(null);
  const now = Date.now();
  const nodes = [{id:"A",x:0,y:0},{id:"B",x:50,y:0},{id:"C",x:50,y:50},{id:"D",x:0,y:50}];
  const edges = [
    {id:"AB",from:"A",to:"B",baseCost:60},
    {id:"BC",from:"B",to:"C",baseCost:60},
    {id:"CD",from:"C",to:"D",baseCost:60},
    {id:"DA",from:"D",to:"A",baseCost:60},
    {id:"AC",from:"A",to:"C",baseCost:100},
  ];
  const tel = [
    { time: now-300000, edgeId:"AB" as const, travelSec:120 },
    { time: now-120000, edgeId:"BC" as const, travelSec:90  },
    { time: now- 60000, edgeId:"AC" as const, travelSec:300 },
  ];

  const run = () => {
    const { model, path } = adv.route(nodes as any, edges as any, tel as any, "A", "D");
    setPath(path);
    // @ts-ignore
    setLearned(Object.fromEntries(model.ewma.entries()));
  };

  return (
    <section>
      <div style={{display:"flex", gap:8, marginBottom:8}}>
        <button onClick={run} style={btnPrimaryIndigo}>경로 추천</button>
        <button onClick={()=>{ setPath(null); setLearned({}); }} style={btnGhost}>초기화</button>
      </div>

      {Object.keys(learned).length>0 && (
        <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:8}}>
          {Object.entries(learned).map(([k,v])=>(
            <div key={k} style={{padding:"6px 10px", borderRadius:8, background:"#eef2ff", color:"#111827"}}>
              <b>{k}</b>: {v.toFixed(1)} s
            </div>
          ))}
        </div>
      )}
      {path && (
        <div style={{ padding: 10, border: "1px solid #334155", borderRadius: 8 }}>
          <div><b>노드:</b> {path.nodes.join(" → ")}</div>
          <div><b>엣지:</b> {path.edges.join(", ")}</div>
        </div>
      )}
    </section>
  );
}

/* ====== 공통 UI ====== */
function Timeline({ assignments }:{ assignments: ReturnType<typeof adv.optimizeByETA>["assignments"] }) {
  const rows = new Map<string, typeof assignments>();
  assignments.forEach(a => {
    const arr = rows.get(a.resourceId) ?? [];
    arr.push(a);
    rows.set(a.resourceId, arr);
  });
  const minStart = Math.min(...assignments.map(a=>a.start));
  const maxEnd = Math.max(...assignments.map(a=>a.end));
  const total = maxEnd - minStart || 1;

  return (
    <div style={{ display:"grid", gap:8 }}>
      {Array.from(rows.entries()).map(([rid, arr]) => (
        <div key={rid}>
          <div style={{ fontSize:12, marginBottom:4, color:"#9db0ff" }}>{rid}</div>
          <div style={{ position:"relative", height:28, background:"#0b1220", borderRadius:8, border:"1px solid #1f2a44" }}>
            {arr.map(a=>{
              const left = ((a.start - minStart) / total) * 100;
              const width = ((a.end - a.start) / total) * 100;
              return (
                <div
                  key={`${a.jobId}-${a.start}`}
                  title={`${a.jobId} (${new Date(a.start).toLocaleTimeString()} ~ ${new Date(a.end).toLocaleTimeString()})`}
                  style={{
                    position:"absolute", left:`${left}%`, width:`${width}%`,
                    top:2, bottom:2, background:"#3b82f6", color:"#fff",
                    borderRadius:6, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center",
                    overflow:"hidden", whiteSpace:"nowrap"
                  }}
                >
                  {a.jobId}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

const table: React.CSSProperties = { borderCollapse:"collapse", width:"100%" };
const btnGhost: React.CSSProperties = { background:"transparent", color:"#9db0ff", border:"1px solid #334155", padding:"6px 10px", borderRadius:8, cursor:"pointer" };
const btnPrimary: React.CSSProperties = { background:"#3b82f6", color:"#fff", border:"1px solid #3b82f6", padding:"6px 10px", borderRadius:8, cursor:"pointer" };
const btnPrimaryGreen: React.CSSProperties = { background:"#10b981", color:"#fff", border:"1px solid #10b981", padding:"6px 10px", borderRadius:8, cursor:"pointer" };
const btnGhostGreen: React.CSSProperties = { background:"transparent", color:"#10b981", border:"1px solid #10b981", padding:"6px 10px", borderRadius:8, cursor:"pointer" };
const btnPrimaryIndigo: React.CSSProperties = { background:"#6366f1", color:"#fff", border:"1px solid #6366f1", padding:"6px 10px", borderRadius:8, cursor:"pointer" };
