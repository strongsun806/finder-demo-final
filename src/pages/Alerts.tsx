// src/pages/Alerts.tsx
import React from "react";
import {
  useMainStore,
  PendingUser,
  AlertItem,
  ChatThread,
} from "../store/mainstore";

type AlertSectionKey = "requests" | "realtime" | "messages";

type AlertsProps = {
  initialSection?: AlertSectionKey;
  onClearSection?: () => void;
  onOpenMessageThread?: (workerName: string) => void;
};

export default function Alerts({
  initialSection,
  onClearSection,
  onOpenMessageThread,
}: AlertsProps) {
  const pendingUsers = useMainStore((s) => s.pendingUsers);
  const approveUser = useMainStore((s) => s.approveUser);
  const rejectUser = useMainStore((s) => s.rejectUser);

  const alerts = useMainStore((s) => s.alerts);
  const threads = useMainStore((s) => s.threads);

  const [tab, setTab] = React.useState<AlertSectionKey>("realtime");

  // Dashboard → Alerts 이동 시 특정 탭으로 포커스
  React.useEffect(() => {
    if (initialSection) {
      setTab(initialSection);
      onClearSection?.();
    }
  }, [initialSection, onClearSection]);

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6">
      {/* 타이틀 */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">알림</h1>
        <p className="text-xs text-slate-500 mt-1">
          가입 승인 요청, 야드 사고/이상 알림, 시스템/업무 알림을 한 곳에서
          확인합니다.
        </p>
      </div>

      {/* 상단 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="승인 대기 계정"
          value={`${pendingUsers.length} 건`}
          description="가입 요청 후 관리자의 승인을 기다리는 계정"
        />
        <SummaryCard
          label="전체 알림"
          value={`${alerts.length} 건`}
          description={`읽지 않은 알림 ${unreadCount}건`}
          highlight="text-sky-600"
        />
        <SummaryCard
          label="메시지 스레드"
          value={`${threads.length} 개`}
          description="현장 근무자와의 대화 채널 수"
        />
      </div>

      {/* 탭 */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="h-10 flex items-center border-b border-slate-200 text-[13px]">
          <TabButton
            active={tab === "requests"}
            onClick={() => setTab("requests")}
          >
            가입 승인 요청
          </TabButton>
          <TabButton
            active={tab === "realtime"}
            onClick={() => setTab("realtime")}
          >
            실시간 알림 (사고 / 시스템)
          </TabButton>
          <TabButton
            active={tab === "messages"}
            onClick={() => setTab("messages")}
          >
            메시지 / 커뮤니케이션
          </TabButton>
        </div>

        <div className="p-4">
          {tab === "requests" && (
            <RequestsSection
              pendingUsers={pendingUsers}
              onApprove={approveUser}
              onReject={rejectUser}
            />
          )}

          {tab === "realtime" && <RealtimeSection alerts={alerts} />}

          {tab === "messages" && (
            <MessagesSection
              alerts={alerts}
              threads={threads}
              onOpenMessageThread={onOpenMessageThread}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────── 서브 컴포넌트들 ───────── */

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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-full px-4 flex items-center border-r border-slate-200",
        active
          ? "bg-white text-slate-900 font-semibold"
          : "bg-slate-50 text-slate-500 hover:bg-slate-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ─── 1) 가입 승인 요청 섹션 ─── */

function RequestsSection({
  pendingUsers,
  onApprove,
  onReject,
}: {
  pendingUsers: PendingUser[];
  onApprove: (u: PendingUser) => void;
  onReject: (id: number) => void;
}) {
  if (pendingUsers.length === 0) {
    return (
      <div className="text-[11px] text-slate-400">
        승인 대기 중인 계정이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-2 text-xs">
      {pendingUsers.map((u) => (
        <div
          key={u.id}
          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/60"
        >
          <div>
            <div className="text-[12px] font-semibold text-slate-800">
              {u.name} ({u.username})
            </div>
            <div className="text-[11px] text-slate-500">
              {u.email} · 요청 시각: {u.requestedAt}
            </div>
          </div>
          <div className="flex gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => onReject(u.id)}
              className="px-3 py-1 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              거절
            </button>
            <button
              type="button"
              onClick={() => onApprove(u)}
              className="px-3 py-1 rounded-full bg-sky-600 text-white hover:bg-sky-700"
            >
              승인
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── 2) 실시간 알림 섹션 (사고/시스템 등) ─── */

function RealtimeSection({ alerts }: { alerts: AlertItem[] }) {
  if (alerts.length === 0) {
    return (
      <div className="text-[11px] text-slate-400">
        등록된 알림이 없습니다. (사고를 등록하거나, 회원가입 요청이 들어오면
        이곳에 표시됩니다.)
      </div>
    );
  }

  return (
    <div className="space-y-2 text-xs max-h-[420px] overflow-y-auto">
      {alerts.map((a) => (
        <div
          key={a.id}
          className="p-3 rounded-lg border border-slate-200 bg-white"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <CategoryBadge category={a.category} />
              <div className="font-semibold text-[12px] text-slate-900">
                {a.title}
              </div>
            </div>
            <div className="text-[10px] text-slate-400">
              {a.createdAt}
            </div>
          </div>
          <div className="text-[11px] text-slate-700 whitespace-pre-wrap">
            {a.message}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── 3) 메시지 / 커뮤니케이션 섹션 ─── */

function MessagesSection({
  alerts,
  threads,
  onOpenMessageThread,
}: {
  alerts: AlertItem[];
  threads: ChatThread[];
  onOpenMessageThread?: (workerName: string) => void;
}) {
  const messageRelatedAlerts = alerts.filter(
    (a) => a.category === "task" || a.category === "system"
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1.2fr] gap-4 text-xs">
      {/* 알림 쪽 */}
      <div>
        <div className="text-[11px] text-slate-500 mb-2">
          업무/시스템 관련 알림
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {messageRelatedAlerts.length === 0 && (
            <div className="text-[11px] text-slate-400">
              업무/시스템 관련 알림이 없습니다.
            </div>
          )}
          {messageRelatedAlerts.map((a) => (
            <div
              key={a.id}
              className="p-3 rounded-lg border border-slate-200 bg-white"
            >
              <div className="flex items-center justify-between mb-1">
                <CategoryBadge category={a.category} />
                <div className="text-[10px] text-slate-400">
                  {a.createdAt}
                </div>
              </div>
              <div className="font-semibold text-[12px] text-slate-900 mb-0.5">
                {a.title}
              </div>
              <div className="text-[11px] text-slate-700 whitespace-pre-wrap">
                {a.message}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 메시지 스레드 요약 */}
      <div>
        <div className="text-[11px] text-slate-500 mb-2">
          근무자 메시지 스레드
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {threads.length === 0 && (
            <div className="text-[11px] text-slate-400">
              등록된 메시지 스레드가 없습니다.
            </div>
          )}
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                onOpenMessageThread?.(t.workerName)
              }
              className="w-full text-left p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-[12px] text-slate-900">
                  {t.workerName}
                </div>
                <div className="text-[10px] text-slate-400">
                  {t.lastUpdated}
                </div>
              </div>
              <div className="text-[11px] text-slate-600 truncate">
                {t.messages[t.messages.length - 1]?.text ??
                  ""}
              </div>
              <div className="mt-1 text-[10px] text-sky-600">
                클릭 시 메시지 페이지에서 해당 대화로 이동
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 카테고리 뱃지 ─── */

function CategoryBadge({
  category,
}: {
  category: AlertItem["category"];
}) {
  const base =
    "inline-flex items-center rounded-full px-2 py-[2px] text-[10px] border";

  switch (category) {
    case "safety":
      return (
        <span
          className={`${base} bg-rose-50 text-rose-600 border-rose-200`}
        >
          안전
        </span>
      );
    case "equipment":
      return (
        <span
          className={`${base} bg-amber-50 text-amber-600 border-amber-200`}
        >
          장비
        </span>
      );
    case "task":
      return (
        <span
          className={`${base} bg-sky-50 text-sky-700 border-sky-200`}
        >
          업무
        </span>
      );
    case "system":
      return (
        <span
          className={`${base} bg-slate-50 text-slate-700 border-slate-200`}
        >
          시스템
        </span>
      );
  }
}