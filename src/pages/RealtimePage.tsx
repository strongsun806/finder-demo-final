// src/pages/RealtimePage.tsx
import React from "react";
import Yardmap from "../components/Yardmap";
import { useMainStore } from "../store/mainstore";

export default function RealtimePage() {
  // 사고 / 알림 / 메시지 스레드 상태를 전역 스토어에서 가져옴
  const incidents = useMainStore((s) => s.incidents);
  const alerts = useMainStore((s) => s.alerts);
  const threads = useMainStore((s) => s.threads);

  const [selectedIncident, setSelectedIncident] =
    React.useState<typeof incidents[0] | null>(null);

  const totalIncidents = incidents.length;
  const ongoingIncidents = incidents.filter(
    (i) => i.status === "진행중"
  ).length;
  const criticalIncidents = incidents.filter(
    (i) => i.severity === "중대"
  ).length;

  const unreadAlerts = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6">
      {/* 제목 영역 */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          실시간 현황
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          야드 지도, 사고/이상 징후, 알림과 메시지 현황을 한 화면에서
          모니터링합니다.
        </p>
      </div>

      {/* 상단 요약 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          label="오늘 사고 / 이상 징후"
          value={`${totalIncidents} 건`}
          description="등록된 야드 사고 / 이상 징후 건수"
        />
        <SummaryCard
          label="진행중 사고"
          value={`${ongoingIncidents} 건`}
          description="조치 대기 / 진행중 상태"
          highlight="text-amber-600"
        />
        <SummaryCard
          label="중대 사고"
          value={`${criticalIncidents} 건`}
          description="즉시 대응이 필요한 사고"
          highlight="text-rose-600"
        />
        <SummaryCard
          label="읽지 않은 알림"
          value={`${unreadAlerts} 건`}
          description="안전 / 장비 / 시스템 알림"
          highlight="text-sky-600"
        />
      </div>

      {/* 가운데: 좌측 지도 + 우측 리스트 */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-4">
        {/* 실시간 지도 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-slate-800">
              실시간 야드 지도
            </div>
            <div className="text-[11px] text-slate-500">
              * 마커를 클릭하면 해당 사고 상세를 오른쪽에서 확인할 수 있습니다.
            </div>
          </div>

          <div className="flex-1 min-h-[320px]">
            {/* 🔹 Yardmap: incidents + 클릭 시 setSelectedIncident 연결 */}
            <Yardmap
              incidents={incidents}
              onSelectIncident={setSelectedIncident}
            />
          </div>
        </div>

        {/* 우측: 사고 리스트 + 알림/메시지 요약 */}
        <div className="space-y-4">
          {/* 사고 리스트 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-slate-800">
                실시간 사고 / 이상 징후
              </div>
              <div className="text-[11px] text-slate-500">
                최근 등록 순 · 최대 10건
              </div>
            </div>

            {incidents.length === 0 ? (
              <div className="text-[11px] text-slate-400">
                등록된 사고 / 이상 징후가 없습니다.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto text-xs">
                {incidents.slice(0, 10).map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => setSelectedIncident(i)}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={i.severity} />
                        <div className="font-semibold text-slate-800 text-[12px] truncate">
                          {i.title}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 ml-2">
                        {i.time}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      위치: {i.location} · 상태: {i.status}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 선택된 사고 상세 */}
          {selectedIncident && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-slate-800">
                  선택된 사고 상세
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="text-[11px] text-slate-500 hover:text-slate-700"
                >
                  닫기
                </button>
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <SeverityBadge severity={selectedIncident.severity} />
                <div className="font-semibold text-[13px] text-slate-900">
                  {selectedIncident.title}
                </div>
              </div>
              <div className="text-[11px] text-slate-500 mb-2">
                위치: {selectedIncident.location} · 시간:{" "}
                {selectedIncident.time} · 상태: {selectedIncident.status}
              </div>
              <div className="text-[12px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                {selectedIncident.description ||
                  "등록된 상세 설명이 없습니다."}
              </div>
            </div>
          )}

          {/* 알림 / 메시지 요약 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-800 mb-2">
              알림 / 메시지 요약
            </div>
            <div className="space-y-2 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>전체 알림</span>
                <span className="font-semibold">
                  {alerts.length} 건 (미확인 {unreadAlerts}건)
                </span>
              </div>
              <div className="flex justify-between">
                <span>메시지 스레드</span>
                <span className="font-semibold">
                  {threads.length} 개
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                * 자세한 내용은 상단 메뉴의 "알림" / "메시지" 탭에서 확인할 수
                있습니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 서브 컴포넌트 ─── */

function SummaryCard({
  label,
  value,
  description,
  highlight,
}: {
  label: string;
  value: string;
  description: string;
  highlight?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-5 py-4">
      <div className="text-[11px] text-slate-500 mb-1">{label}</div>
      <div
        className={[
          "text-xl font-semibold text-slate-900",
          highlight ?? "",
        ].join(" ")}
      >
        {value}
      </div>
      <div className="mt-2 text-[11px] text-slate-500">
        {description}
      </div>
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: "경미" | "보통" | "중대";
}) {
  const base =
    "inline-flex items-center rounded-full px-2 py-[2px] text-[10px] border";

  if (severity === "중대") {
    return (
      <span
        className={`${base} bg-rose-50 text-rose-600 border-rose-200`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1" />
        중대
      </span>
    );
  }
  if (severity === "보통") {
    return (
      <span
        className={`${base} bg-amber-50 text-amber-600 border-amber-200`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />
        보통
      </span>
    );
  }
  return (
    <span
      className={`${base} bg-emerald-50 text-emerald-600 border-emerald-200`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
      경미
    </span>
  );
}