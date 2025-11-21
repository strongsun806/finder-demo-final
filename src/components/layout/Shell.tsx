// src/components/layout/Shell.tsx
import React from "react";
import type { RouteKey, UserInfo } from "../../App";

type ShellProps = {
  user: UserInfo;
  onLogout: () => void | Promise<void>;
  setRoute: React.Dispatch<React.SetStateAction<RouteKey>>;
  currentRoute: RouteKey;
  children: React.ReactNode;
};

const navItems: { key: RouteKey; label: string }[] = [
  { key: "containers", label: "컨테이너 현황" },
  { key: "tasks", label: "업무 현황" },
  { key: "yard", label: "야드관리" },
  { key: "workers", label: "근무자 / 장비관리" },
  { key: "notices", label: "공지사항" },
  { key: "company", label: "기업 관리" },
  { key: "alerts", label: "알림" },
  { key: "realtime", label: "실시간 현황" },
  { key: "messages", label: "메시지" },
];

const pageTitleMap: Record<RouteKey, string> = {
  login: "로그인",
  dashboard: "요약 화면",
  containers: "컨테이너 현황",
  tasks: "업무 현황",
  yard: "야드관리",
  workers: "근무자 / 장비관리",
  notices: "공지사항",
  company: "기업 관리",
  alerts: "알림",
  realtime: "실시간 현황",
  messages: "메시지",
};

const Shell: React.FC<ShellProps> = ({
  user,
  onLogout,
  setRoute,
  currentRoute,
  children,
}) => {
  const title =
    currentRoute === "dashboard"
      ? "요약 화면"
      : pageTitleMap[currentRoute];

  const handleClickNav = (key: RouteKey) => {
    if (key === "login") return;
    setRoute(key);
  };

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* 사이드바 */}
      <aside className="w-56 bg-[#07152b] text-slate-100 flex flex-col">
        {/* 로고 영역 */}
        <div
          className="h-14 flex items-center px-5 border-b border-slate-800 cursor-pointer"
          onClick={() => setRoute("dashboard")}
        >
          {/* 로고 이미지 (배경 투명 PNG) */}
          <img
            src="/images/logo-finder-main.png"
            alt="FINDER"
            className="h-30 w-auto object-contain"
          />
          {/* 혹시 이미지 로드 실패할 때 텍스트 fallback */}
          {/* <div className="text-lg font-extrabold tracking-wide ml-2">
            FINDER
          </div> */}
        </div>

        {/* 내비게이션 */}
        <nav className="flex-1 py-4 text-[13px]">
          {navItems.map((item) => {
            const active =
              (currentRoute === "dashboard" &&
                item.key === "containers") ||
              currentRoute === item.key;

            // login은 메뉴에 표시 안 함
            if (item.key === "login") return null;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleClickNav(item.key)}
                className={`w-full text-left px-5 py-2.5 transition ${
                  active
                    ? "bg-[#102445] text-white font-semibold"
                    : "text-slate-200 hover:bg-[#0b1b35]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* 사용자 정보 + 로그아웃 */}
        <div className="px-5 py-4 border-t border-slate-800 text-[11px] text-slate-300">
          <div className="font-semibold mb-0.5">{user.name}</div>
          <div className="text-[10px] opacity-80 mb-2">
            {user.company} · {user.role === "admin" ? "관리자" : "스태프"}
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-[11px] hover:bg-slate-700"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 바 */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="text-[13px] text-slate-500">
            (주)파인드이알
          </div>
          <div className="text-[13px] text-slate-600">
            {user.name} 님
          </div>
        </header>

        {/* 콘텐츠 */}
        <main className="flex-1 px-8 py-6">
          <h1 className="text-lg font-semibold mb-4">{title}</h1>
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Shell;