// src/pages/Dashboard.tsx
import React from "react";
import { useMainStore } from "../store/mainstore";

type AlertSectionKey = "requests" | "realtime" | "messages";

type DashboardProps = {
  onOpenAlerts: (section: AlertSectionKey) => void;
};

const Dashboard: React.FC<DashboardProps> = ({ onOpenAlerts }) => {
  const incidents = useMainStore((s) => s.incidents);
  const containers = useMainStore((s) => s.containers ?? []);
  const alerts = useMainStore((s) => s.alerts ?? []);
  const threads = useMainStore((s) => s.threads ?? []);
  const pendingUsers = useMainStore((s) => s.pendingUsers ?? []);

  // ── 사고 요약 ──
  const totalIncidents = incidents.length;
  const severeIncidents = incidents.filter((i) => i.severity === "중대").length;
  const normalIncidents = incidents.filter((i) => i.severity === "보통").length;
  const minorIncidents = incidents.filter((i) => i.severity === "경미").length;

  // ── 컨테이너 요약 ──
  const totalContainers = containers.length;
  const inCount = containers.filter((c) => c.status === "입고").length;
  const waitCount = containers.filter((c) => c.status === "반출대기").length;
  const doneCount = containers.filter((c) => c.status === "반출완료").length;

  // ── 알림/요청/메시지 요약 ──
  const unreadAlerts = alerts.filter((a) => !a.read).length;
  const joinRequests = pendingUsers.length;
  const messageThreads = threads.length;

  return (
    <div className="space-y-6">
      {/* 상단 타이틀 */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          요약 화면
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          사고 현황, 컨테이너 현황, 알림/메시지 상태를 한 번에 확인하는 관리자용 대시보드입니다.
        </p>
      </div>

      {/* 1줄 요약 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 사고 카드 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="text-[11px] text-slate-500 mb-1">사고 / 이상 징후</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {totalIncidents}건
              </div>
              <div className="mt-1 text-[11px] text-slate-500 space-x-2">
                <span>중대 {severeIncidents}</span>
                <span>보통 {normalIncidents}</span>
                <span>경미 {minorIncidents}</span>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-rose-50 text-rose-600 text-[11px] border border-rose-100">
              실시간 야드관리
            </span>
          </div>
        </div>

        {/* 컨테이너 카드 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="text-[11px] text-slate-500 mb-1">컨테이너 현황</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {totalContainers}개
              </div>
              <div className="mt-1 text-[11px] text-slate-500 space-x-2">
                <span>입고 {inCount}</span>
                <span>반출대기 {waitCount}</span>
                <span>반출완료 {doneCount}</span>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] border border-sky-100">
              컨테이너 관리
            </span>
          </div>
        </div>

        {/* 가입 요청 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="text-[11px] text-slate-500 mb-1">가입 승인 요청</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {joinRequests}건
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                승인 대기 중인 신규 계정
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenAlerts("requests")}
              className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] hover:bg-black/80"
            >
              알림 페이지로
            </button>
          </div>
        </div>

        {/* 알림/메시지 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="text-[11px] text-slate-500 mb-1">
            알림 / 메시지
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-semibold text-slate-900">
                  알림 {unreadAlerts}건
                </span>
                <span className="text-[11px] text-slate-400">
                  (읽지 않음 기준)
                </span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                메시지 스레드 {messageThreads}개
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => onOpenAlerts("realtime")}
                className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] border border-amber-100 hover:bg-amber-100"
              >
                실시간 알림 보기
              </button>
              <button
                type="button"
                onClick={() => onOpenAlerts("messages")}
                className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] border border-sky-100 hover:bg-sky-100"
              >
                메시지 알림 보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 중간: 이미지 기반 사고 / 컨테이너 현황 (PDF 시안 그대로) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 사고 현황 이미지 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                사고 현황 (시안 이미지)
              </div>
              <div className="text-[11px] text-slate-500">
                PDF 시안 레이아웃을 그대로 사용한 정적 화면입니다.
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenAlerts("realtime")}
              className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[11px] hover:bg-rose-100"
            >
              사고 알림 바로가기
            </button>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            {/* 🔹 public/images/accident.png 필요 */}
            <img
              src="/images/accident.png"
              alt="사고 현황"
              className="w-full object-contain"
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            실제 시스템 기준 현재 사고 {totalIncidents}건
            {totalIncidents > 0 && (
              <>
                {" · "}중대 {severeIncidents} / 보통 {normalIncidents} / 경미{" "}
                {minorIncidents}
              </>
            )}
          </div>
        </div>

        {/* 컨테이너 현황 이미지 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                컨테이너 현황 (시안 이미지)
              </div>
              <div className="text-[11px] text-slate-500">
                시안 레이아웃 그대로, 아래에는 실제 데이터 요약을 함께 제공합니다.
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenAlerts("requests")}
              className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] hover:bg-black/80"
            >
              승인/요청 알림
            </button>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            {/* 🔹 public/images/containers.png 이미지를 사용 */}
            <img
              src="/images/containers.png"
              alt="컨테이너 현황"
              className="w-full object-contain"
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            실제 시스템 기준 현재 컨테이너 {totalContainers}개
            {totalContainers > 0 && (
              <>
                {" · "}입고 {inCount} / 반출대기 {waitCount} / 반출완료{" "}
                {doneCount}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 하단: 빠른 이동 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickNavCard
          title="가입 승인 요청 / 시스템 알림"
          description="신규 계정 요청, 시스템 안내/점검 공지를 한 곳에서 확인합니다."
          badge={joinRequests > 0 ? `${joinRequests}건 대기` : "대기 없음"}
          onClick={() => onOpenAlerts("requests")}
        />
        <QuickNavCard
          title="실시간 사고 / 야드 알림"
          description="야드 내 사고, 이상 징후와 연동된 알림을 확인합니다."
          badge={unreadAlerts > 0 ? `미확인 ${unreadAlerts}건` : "미확인 알림 없음"}
          onClick={() => onOpenAlerts("realtime")}
        />
        <QuickNavCard
          title="근무자 메시지 / 문의"
          description="근무자와의 1:1 메시지, 요청/문의 내역을 확인합니다."
          badge={messageThreads > 0 ? `스레드 ${messageThreads}개` : "대화 없음"}
          onClick={() => onOpenAlerts("messages")}
        />
      </div>
    </div>
  );
};

function QuickNavCard(props: {
  title: string;
  description: string;
  badge: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="text-left bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-sky-300 hover:shadow-md transition"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-slate-900">
          {props.title}
        </div>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px]">
          {props.badge}
        </span>
      </div>
      <div className="text-[12px] text-slate-500 leading-relaxed">
        {props.description}
      </div>
    </button>
  );
}

export default Dashboard;