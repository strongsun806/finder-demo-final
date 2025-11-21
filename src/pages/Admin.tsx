// src/pages/Admin.tsx
import React from "react";
import {
  useMainStore,
  PendingUser,
} from "../store/mainstore";

const Admin: React.FC = () => {
  const {
    pendingUsers,
    approvedUsers,
    incidents,
    alerts,
    approveUser,
    rejectUser,
  } = useMainStore();

  const handleApprove = (user: PendingUser) => {
    approveUser(user);
    // 사용자 입장에서 확실히 느껴지도록
    alert(`"${user.username}" 계정을 승인했습니다.\n이제 해당 아이디로 로그인할 수 있어요.`);
  };

  const handleReject = (id: number) => {
    const target = pendingUsers.find((u) => u.id === id);
    if (!target) return;

    if (window.confirm(`"${target.username}" 회원가입 요청을 거절할까요?`)) {
      rejectUser(id);
      alert(`"${target.username}"의 회원가입 요청을 거절했습니다.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 타이틀 */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          관리자 페이지
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          회원가입 승인 / 계정 현황 / 주요 알림을 한 곳에서 관리합니다.
        </p>
      </div>

      {/* 상단 요약 카드 3개 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="승인 대기 계정"
          value={`${pendingUsers.length} 건`}
          description="새로 가입 요청된 계정 수"
        />
        <SummaryCard
          label="등록된 계정(관리자/스태프)"
          value={`${approvedUsers.length} 개`}
          description="현재 로그인 가능 계정 수"
        />
        <SummaryCard
          label="최근 사고 / 알림"
          value={`${incidents.length} / ${alerts.length}`}
          description="야드 사고 건수 / 시스템 알림 수"
        />
      </div>

      {/* 1. 회원가입 / 정보변경 요청 테이블 */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <header className="h-11 px-5 flex items-center justify-between border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="text-sm font-semibold text-slate-800">
              회원가입 / 정보변경 요청
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            새 가입 요청이 들어오면 여기에서 승인 또는 거절하세요.
          </span>
        </header>

        <div className="min-h-[140px] text-xs">
          {pendingUsers.length === 0 ? (
            <div className="h-[120px] flex items-center justify-center text-[12px] text-slate-400">
              승인 대기 중인 요청이 없습니다.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500">
                <tr>
                  <th className="py-2 px-4 text-left w-32">아이디</th>
                  <th className="py-2 px-4 text-left w-32">이름</th>
                  <th className="py-2 px-4 text-left">이메일</th>
                  <th className="py-2 px-4 text-center w-40">요청 시각</th>
                  <th className="py-2 px-4 text-center w-40">승인 / 거절</th>
                </tr>
              </thead>
              <tbody className="text-[12px] text-slate-700">
                {pendingUsers.map((u, idx) => (
                  <tr
                    key={u.id}
                    className={
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    }
                  >
                    <td className="py-2 px-4">{u.username}</td>
                    <td className="py-2 px-4">{u.name}</td>
                    <td className="py-2 px-4">{u.email}</td>
                    <td className="py-2 px-4 text-center">
                      {u.requestedAt}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(u)}
                          className="px-3 py-1 rounded-full bg-sky-600 text-white text-[11px] hover:bg-sky-700"
                        >
                          승인
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(u.id)}
                          className="px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] hover:bg-rose-600"
                        >
                          거절
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 2. 등록된 계정 목록 (읽기 전용) */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <header className="h-11 px-5 flex items-center justify-between border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-slate-800">
              등록된 계정 목록
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            승인 완료된 계정만 로그인에 사용할 수 있습니다.
          </span>
        </header>

        <div className="text-xs">
          {approvedUsers.length === 0 ? (
            <div className="h-[120px] flex items-center justify-center text-[12px] text-slate-400">
              등록된 계정이 없습니다.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500">
                <tr>
                  <th className="py-2 px-4 text-left w-32">아이디</th>
                  <th className="py-2 px-4 text-left w-40">이름</th>
                  <th className="py-2 px-4 text-left w-24">권한</th>
                </tr>
              </thead>
              <tbody className="text-[12px] text-slate-700">
                {approvedUsers.map((u, idx) => (
                  <tr
                    key={u.id}
                    className={
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    }
                  >
                    <td className="py-2 px-4">{u.username}</td>
                    <td className="py-2 px-4">{u.name}</td>
                    <td className="py-2 px-4">
                      {u.role === "admin" ? "관리자" : "스태프"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default Admin;

/* ─── 재사용 카드 ─── */

function SummaryCard(props: {
  label: string;
  value: string;
  description: string;
}) {
  const { label, value, description } = props;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
      <div className="text-[11px] text-slate-500 mb-1">{label}</div>
      <div className="text-xl font-semibold text-slate-900">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-slate-500">
        {description}
      </div>
    </div>
  );
}