// src/pages/YardPage.tsx
import React, { useState } from "react";
import {
  useMainStore,
  Incident,
  IncidentStatus,
  IncidentSeverity,
} from "../store/mainstore";
import YardMap from "../components/Yardmap";


export default function YardPage() {
  const [showAccidentModal, setShowAccidentModal] = useState(false);

  // 🔹 전역 store에서 야드 사고 데이터 가져오기
  const { incidents } = useMainStore();

  // 🔹 가장 최근 사고 (incidents는 최신이 맨 앞이라고 가정)
  const latestIncident: Incident | null = incidents[0] ?? null;

  // 🔹 요약 카드용 숫자들 (지금은 근무자/업무는 더미, 위험요소는 실제 데이터 기반)
  const workerCount = 1004;
  const taskCount = 1010;

  // "위험요소" = 진행중이거나 중대 사고
  const riskCount = incidents.filter(
    (i) => i.status === "진행중" || i.severity === "중대"
  ).length;

  // 사고 말풍선에 표시할 텍스트
  const accidentLabel =
    latestIncident != null
      ? `${latestIncident.time} ${latestIncident.location}에서 사고발생`
      : "현재 등록된 사고 없음";

  // 모달 닫기 핸들러
  const closeModal = () => {
    setShowAccidentModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 타이틀 영역 */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">야드관리</h1>
        <p className="text-xs text-slate-500 mt-1">
          실시간 야드 현황과 위험요소, 근무자/업무 상황을 지도 기반으로 확인합니다.
        </p>
      </div>

      {/* 실시간 야드 현황 카드 */}
      <div className="bg-white rounded-xl shadow-sm border border-table-border overflow-hidden">
        <div className="h-10 px-4 flex items-center justify-between border-b border-table-border bg-slate-50">
          <span className="text-sm font-semibold text-slate-800">
            실시간 야드 현황
          </span>
          <span className="text-[11px] text-slate-500">
            ※ 사고 아이콘을 클릭하면 상세 정보를 확인할 수 있습니다.
          </span>
        </div>

        <div className="p-6 bg-[#F5F7FB]">
          {/* ===== 메인 도면 영역 ===== */}
          <div className="relative w-full max-w-5xl mx-auto aspect-[16/5] rounded-xl border border-[#CAD4F4] bg-[#E7EEFF] overflow-hidden">
            {/* 바깥 프레임 */}
            <div className="absolute inset-4 rounded-lg border-2 border-[#B2C5FF]" />

            {/* ----- 상단 구역 라벨 (A~G) : grid-cols-7 로 칸 정중앙 ----- */}
            <div className="absolute left-10 right-10 top-4 grid grid-cols-7 text-[10px] gap-x-1">
              {["A구역", "B구역", "C구역", "D구역", "E구역", "F구역", "G구역"].map(
                (label) => (
                  <div
                    key={label}
                    className="flex justify-center items-center"
                  >
                    <div className="px-2 py-[2px] rounded-full bg-[#DDE6FF] text-[#3156D8] font-medium">
                      {label}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* ----- 아래 슬롯(컨테이너 블록) 영역 : 같은 grid-cols-7 사용 ----- */}
            <div className="absolute left-10 right-10 top-10 bottom-10 grid grid-cols-7 gap-x-1">
              {Array.from({ length: 7 }).map((_, colIdx) => (
                <div
                  key={colIdx}
                  className="relative rounded-md border border-[#CFD8FF] bg-[#EDF2FF] flex flex-col justify-between py-3 px-1"
                >
                  {/* 각 구역 안의 가로 줄 (슬롯 느낌) */}
                  {Array.from({ length: 4 }).map((__, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="h-[1px] w-full bg-[#CFD8FF]/70"
                      style={{
                        opacity:
                          rowIdx === 0
                            ? 0.7
                            : rowIdx === 3
                            ? 0.4
                            : 0.5,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* ----- 핀/말풍선을 위한 오버레이 grid : 줄과 정확히 맞게 grid-rows-3 ----- */}
            <div className="absolute left-10 right-10 top-10 bottom-10 grid grid-cols-7 grid-rows-3 pointer-events-none">
              {/* 작업중 (주황 핀) : C/D 사이 중간쯤, 가운데 줄 */}
              <div className="col-start-4 row-start-2 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#FFA940]" />
                  <span className="text-[10px] text-[#666C8B] bg-white/70 rounded px-1">
                    작업중
                  </span>
                </div>
              </div>

              {/* 대기 (파랑 핀) : F구역, 아래쪽 줄 */}
              <div className="col-start-6 row-start-3 flex items-start justify-center pointer-events-none">
                <div className="flex flex-col items-center gap-1 translate-y-[-4px]">
                  <div className="w-2 h-2 rounded-full bg-[#1890FF]" />
                  <span className="text-[10px] text-[#666C8B] bg-white/70 rounded px-1">
                    대기
                  </span>
                </div>
              </div>

              {/* 사고 말풍선 : E구역, 가운데 줄 → store에 데이터가 있을 때만 활성 */}
              {latestIncident && (
                <div className="col-start-5 row-start-2 flex items-center justify-center pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => setShowAccidentModal(true)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="rounded-full bg-[#FF4D4F] text-white px-4 py-1 text-[11px] shadow-md flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <span>{accidentLabel}</span>
                    </div>
                    <div className="w-[1px] h-5 bg-[#FF4D4F]/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF4D4F] border border-white shadow" />
                  </button>
                </div>
              )}
            </div>

            {/* 오른쪽 상단 요약 박스 */}
            {latestIncident && (
              <div className="absolute right-6 top-6 rounded-xl bg-white shadow-sm border border-[#F5CBD0] px-3 py-2 text-[11px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center rounded-full bg-[#FF4D4F] text-white px-2 py-[1px] text-[10px]">
                    긴급
                  </span>
                  <span className="text-[#FF4D4F] font-semibold">
                    사고 {riskCount > 0 ? `${riskCount}건` : "0건"} 발생
                  </span>
                </div>
                <div className="text-[#666C8B]">
                  {latestIncident.location} 위치 {latestIncident.title}
                </div>
              </div>
            )}
          </div>

          {/* 지도 하단 레전드 */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-slate-600 justify-between">
            <div className="flex items-center gap-3">
              <LegendDot colorClass="bg-[#52C41A]" label="원활" />
              <LegendDot colorClass="bg-[#FAAD14]" label="보통" />
              <LegendDot colorClass="bg-[#FF4D4F]" label="위험/사고" />
            </div>
            <div className="text-slate-500">
              * 핀을 클릭하면 해당 위치의 근무자/상세정보를 확인할 수 있습니다.
            </div>
          </div>
        </div>
      </div>

      {/* 하단 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="근무자 수"
          value={`${workerCount.toLocaleString()} 명`}
          description="현재 야드에 배치된 근무자 수"
        />
        <SummaryCard
          label="위험요소"
          value={`${riskCount} 건`}
          highlight={riskCount > 0 ? "text-[#FF4D4F]" : undefined}
          description="실시간 사고/주의 요망 건수"
        />
        <SummaryCard
          label="진행업무"
          value={`${taskCount.toLocaleString()} 건`}
          description="야드 및 현장에서 진행 중인 업무 수"
        />
      </div>

      {/* 사고 상세 모달 */}
      {showAccidentModal && latestIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-table-border overflow-hidden">
            <div className="px-4 py-3 border-b border-table-border bg-[#FFF1F0] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center rounded-full bg-[#FF4D4F] text-white px-2 py-[1px] text-[10px]">
                  긴급
                </span>
                <span className="font-semibold text-[#CF1322]">
                  {latestIncident.time} {latestIncident.location} 위치에서 사고발생
                </span>
              </div>
              <button
                className="text-[11px] text-slate-500 hover:text-slate-700"
                onClick={closeModal}
              >
                닫기
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              {/* 모달 안 미니 야드 도면 : 동일하게 grid로 맞춤 */}
              <div className="rounded-xl border border-[#D6E0FF] bg-[#F5F7FF] p-3">
                <div className="relative aspect-[16/7] rounded-lg bg-[#E7EEFF] overflow-hidden border border-[#CAD4F4]">
                  {/* 슬롯 박스들 */}
                  <div className="absolute inset-3 grid grid-cols-7 gap-x-1">
                    {Array.from({ length: 7 }).map((_, colIdx) => (
                      <div
                        key={colIdx}
                        className="relative rounded-md border border-[#CFD8FF] bg-[#EDF2FF] flex flex-col justify-between py-2 px-1"
                      >
                        {Array.from({ length: 3 }).map((__, rowIdx) => (
                          <div
                            key={rowIdx}
                            className="h-[1px] w-full bg-[#CFD8FF]/70"
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* 사고/근무자 핀 오버레이 (위치는 데모용, 텍스트는 실제 사고 정보) */}
                  <div className="absolute inset-3 grid grid-cols-7 grid-rows-3 pointer-events-none">
                    <div className="col-start-5 row-start-2 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-[#FF4D4F] border border-white shadow" />
                        <span className="text-[9px] bg-white/80 rounded px-1 text-[#CF1322]">
                          사고 위치
                        </span>
                      </div>
                    </div>
                    <div className="col-start-4 row-start-3 flex items-start justify-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-[#52C41A] border border-white shadow" />
                        <span className="text-[9px] bg-white/80 rounded px-1 text-[#237804]">
                          근무자
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 사고 요약 */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500">사고 요약</div>
                <div className="text-xs text-slate-800">
                  {latestIncident.description ||
                    `${latestIncident.location} 위치에서 "${latestIncident.title}" 사고가 발생했습니다.`}
                </div>
              </div>

              {/* 현장 사진 자리 */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500">현장 사진</div>
                <div className="rounded-xl border border-table-border bg-slate-100 h-40 flex items-center justify-center text-[11px] text-slate-500">
                  현장 사진 이미지 영역 (예: /images/yard-accident-photo.png)
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  className="px-10 py-2.5 rounded-full bg-sidebar-bg hover:bg-sidebar-hover text-white text-xs font-semibold"
                  onClick={closeModal}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 서브 컴포넌트 ─── */

function LegendDot({
  colorClass,
  label,
}: {
  colorClass: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className={`w-3 h-3 rounded-full ${colorClass}`} />
      <span>{label}</span>
    </div>
  );
}

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
    <div className="bg-white rounded-xl shadow-sm border border-table-border px-5 py-4">
      <div className="text-[11px] text-slate-500 mb-1">{label}</div>
      <div
        className={[
          "text-xl font-semibold text-slate-900",
          highlight ?? "",
        ].join(" ")}
      >
        {value}
      </div>
      <div className="mt-2 text-[11px] text-slate-500">{description}</div>
    </div>
  );
}
