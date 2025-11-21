// src/pages/Dashboard.tsx
import React from "react";

type DashboardProps = {
  onOpenAlerts?: (
    section: "requests" | "realtime" | "messages"
  ) => void;
};

const Dashboard: React.FC<DashboardProps> = ({ onOpenAlerts }) => {
  // 숫자나 값들은 그냥 데모용 하드코딩
  return (
    <div className="space-y-8">
      {/* 상단 3개 카드: 현재 근무자 수 / 진행 업무 / 완료 업무 */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-8 py-6">
          <div className="text-xs text-slate-500 mb-2">
            현재 근무자 수
          </div>
          <div className="text-3xl font-bold text-slate-900">
            1004{" "}
            <span className="text-base font-medium text-slate-500">
              명
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-8 py-6">
          <div className="text-xs text-slate-500 mb-2">
            진행 업무 건
          </div>
          <div className="text-3xl font-bold text-indigo-600">
            210{" "}
            <span className="text-base font-medium text-slate-500">
              건
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-8 py-6">
          <div className="text-xs text-slate-500 mb-2">
            현재 완료업무
          </div>
          <div className="text-3xl font-bold text-orange-500">
            1010{" "}
            <span className="text-base font-medium text-slate-500">
              건
            </span>
          </div>
        </div>
      </div>

      {/* 가운데 큰 야드 이미지 자리 (지금은 회색 박스) */}
{/* 가운데 대시보드 이미지 영역 */}
<div className="w-full h-full flex items-center justify-center">
  <img
    src="/images/main.png"
    alt="main"
    className="max-w-full max-h-full object-contain opacity-90"
  />
</div>


      {/* 하단 3개 알림 카드: 회원가입/정보변경, 실시간 보고, 메시지 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 1. 회원가입 / 정보변경 요청 */}
        <button
          type="button"
          onClick={() => onOpenAlerts?.("requests")}
          className="group bg-white rounded-xl border border-slate-200 shadow-sm px-8 py-6 text-left hover:border-red-400 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-slate-800">
              회원가입 / 정보변경 요청
            </div>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-[10px] font-bold text-white">
              N
            </span>
          </div>
          <div className="text-xs text-slate-500">
            신규 근무자 가입 및 정보 변경 요청을 확인할 수 있습니다.
          </div>
        </button>

        {/* 2. 실시간 보고 */}
        <button
          type="button"
          onClick={() => onOpenAlerts?.("realtime")}
          className="group bg-white rounded-xl border border-slate-200 shadow-sm px-8 py-6 text-left hover:border-sky-400 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-slate-800">
              실시간 보고
            </div>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-[10px] font-bold text-white">
              N
            </span>
          </div>
          <div className="text-xs text-slate-500">
            현장 근무자의 긴급/일반 보고 내역을 확인할 수 있습니다.
          </div>
        </button>

        {/* 3. 메시지 */}
        <button
          type="button"
          onClick={() => onOpenAlerts?.("messages")}
          className="group bg-white rounded-xl border border-slate-200 shadow-sm px-8 py-6 text-left hover:border-sky-400 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-slate-800">
              메시지
            </div>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-[10px] font-bold text-white">
              N
            </span>
          </div>
          <div className="text-xs text-slate-500">
            시스템에서 발송된 알림 메시지 내역을 확인할 수 있습니다.
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
