import { useMemo, useState } from "react";
import { adv } from "../lib/api-advanced";

type Assignment = ReturnType<typeof adv.optimizeByETA>["assignments"][number];

export default function TasksPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  // 데모용 입력 (실운영에서는 서버/상태에서 값 주입)
  const demoInput = useMemo(() => {
    const now = Date.now();
    return {
      now,
      resources: [
        { id: "QC-1", type: "QC" as const, pos: [0, 0] as [number, number] },
        { id: "YC-11", type: "YC" as const, pos: [100, 10] as [number, number] },
        { id: "TT-7", type: "TT" as const, pos: [60, 40] as [number, number] },
      ],
      jobs: [
        { id: "J1", kind: "DISCH" as const, from: [0, 0] as [number, number], to: [100, 10] as [number, number], readyAt: Math.floor(now / 1000) + 300, duration: 600, priority: 5, requires: ["QC" as const] },
        { id: "J2", kind: "SHIFT" as const, from: [100, 10] as [number, number], to: [120, 20] as [number, number], readyAt: Math.floor(now / 1000) + 100, duration: 300, priority: 3, requires: ["YC" as const] },
        { id: "J3", kind: "REMOVAL" as const, from: [80, 40] as [number, number], to: [20, 10] as [number, number], readyAt: Math.floor(now / 1000) + 30, duration: 420, priority: 4, requires: ["TT" as const], rehandleRisk: 0.3 },
      ],
      weights: { wait: 1, move: 0.2, rehandle: 5, priority: -2 },
    };
  }, []);

  const runETA = async () => {
    setLoading(true);
    try {
      const { assignments } = adv.optimizeByETA(demoInput);
      setAssignments(assignments);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>ETA 기반 작업 최적화</h2>
      <p style={{ color: "#667" }}>버튼을 누르면 데모 입력값으로 최적화한 배정 결과를 보여줍니다.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={runETA} disabled={loading} style={btnStyle}>{loading ? "최적화 중..." : "ETA 최적화 실행"}</button>
        <button onClick={() => setAssignments([])} style={btnGhost}>초기화</button>
      </div>

      {assignments.length > 0 && (
        <>
          <h3>결과 테이블</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Job</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
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

          <h3 style={{ marginTop: 16 }}>간단 타임라인</h3>
          <Timeline assignments={assignments} />
        </>
      )}
    </div>
  );
}

function Timeline({ assignments }: { assignments: Assignment[] }) {
  // 같은 리소스끼리 줄 분리
  const rows = new Map<string, Assignment[]>();
  assignments.forEach((a) => {
    const arr = rows.get(a.resourceId) ?? [];
    arr.push(a);
    rows.set(a.resourceId, arr);
  });
  const minStart = Math.min(...assignments.map((a) => a.start));
  const maxEnd = Math.max(...assignments.map((a) => a.end));
  const total = maxEnd - minStart || 1;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {Array.from(rows.entries()).map(([rid, arr]) => (
        <div key={rid}>
          <div style={{ fontSize: 12, marginBottom: 4, color: "#667" }}>{rid}</div>
          <div style={{ position: "relative", height: 28, background: "#f6f8fb", borderRadius: 8 }}>
            {arr.map((a) => {
              const left = ((a.start - minStart) / total) * 100;
              const width = ((a.end - a.start) / total) * 100;
              return (
                <div
                  key={`${a.jobId}-${a.start}`}
                  title={`${a.jobId} (${new Date(a.start).toLocaleTimeString()} ~ ${new Date(a.end).toLocaleTimeString()})`}
                  style={{
                    position: "absolute",
                    left: `${left}%`,
                    width: `${width}%`,
                    top: 2,
                    bottom: 2,
                    background: "#3b82f6",
                    color: "#fff",
                    borderRadius: 6,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
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

const btnStyle: React.CSSProperties = { background: "#3b82f6", color: "#fff", border: 0, padding: "8px 12px", borderRadius: 8, cursor: "pointer" };
const btnGhost: React.CSSProperties = { background: "transparent", color: "#3b82f6", border: "1px solid #3b82f6", padding: "8px 12px", borderRadius: 8, cursor: "pointer" };
const tableStyle: React.CSSProperties = { borderCollapse: "collapse", width: "100%" };
