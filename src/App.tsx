// src/App.tsx
import React from "react";
import Shell from "./components/layout/Shell";


import { api } from "./lib/api";
import { useMainStore } from "./store/mainstore"; // 🔹 추가

// 페이지들
import Dashboard from "./pages/Dashboard";
import Containers from "./pages/Containers";
import Tasks from "./pages/Tasks";
import Yard from "./pages/Yard";
import Workers from "./pages/Workers";
import Notices from "./pages/Notices";
import Company from "./pages/Company";
import Alerts from "./pages/Alerts";
import RealtimePage from "./pages/RealtimePage";
import Messages from "./pages/Messages";
import Login from "./pages/Login";

export type RouteKey =
  | "login"
  | "dashboard"
  | "containers"
  | "tasks"
  | "yard"
  | "workers"
  | "notices"
  | "company"
  | "alerts"
  | "realtime"
  | "messages";

export type UserInfo = {
  name: string;
  company: string;
  role: "admin" | "staff";
};

type AlertSectionKey = "requests" | "realtime" | "messages" | null;

const CURRENT_USER_KEY = "finder-current-user";

const App: React.FC = () => {
  // 현재 로그인 사용자
  const [user, setUser] = React.useState<UserInfo | null>(() => {
    // 새로고침해도 유지되게 localStorage에서 복구
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as UserInfo;
    } catch {
      return null;
    }
  });

  // 라우트 (기본: 로그인)
  const [route, setRoute] = React.useState<RouteKey>(() =>
    user ? "dashboard" : "login"
  );

  // 메인 요약 화면 → 알림 페이지로 넘어갈 때 어떤 섹션으로 점프할지
  const [alertSection, setAlertSection] =
    React.useState<AlertSectionKey>(null);

  // 메시지(채팅) 페이지에서 어느 근무자 스레드를 보고 있는지
  const [activeMessageWorker, setActiveMessageWorker] =
    React.useState<string | null>(null);

  /* ---------- 로그인 성공 / 로그아웃 ---------- */

  const handleLoginSuccess = (loggedInUser: UserInfo) => {
    // Login.tsx 에서 넘겨주는 UserInfo 사용
    setUser(loggedInUser);
    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(loggedInUser)
    );
    setRoute("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    setRoute("login");
  };

  /* ---------- 로그인 여부에 따른 분기 ---------- */

  // user 없거나 route가 login이면 무조건 로그인 화면
  if (!user || route === "login") {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  /* ---------- 라우트에 따른 컨텐츠 선택 ---------- */

  let content: React.ReactNode = null;

  switch (route) {
    case "dashboard":
      content = (
        <Dashboard
          onOpenAlerts={(section) => {
            // 메인 하단 카드 → 알림 페이지 특정 섹션으로
            setAlertSection(section);
            setRoute("alerts");
          }}
        />
      );
      break;

    case "containers":
      content = <Containers />;
      break;

    case "tasks":
      content = <Tasks />;
      break;

    case "yard":
      content = <Yard />;
      break;

    case "workers":
      content = <Workers />;
      break;

    case "notices":
      content = <Notices />;
      break;

    case "company":
      content = <Company />;
      break;

    case "alerts":
      content = (
        <Alerts
          initialSection={alertSection ?? undefined}
          onClearSection={() => setAlertSection(null)}
          onOpenMessageThread={(workerName) => {
            // 알림 → 특정 근무자 메시지로 점프
            setActiveMessageWorker(workerName);
            setRoute("messages");
          }}
        />
      );
      break;

    case "realtime":
      content = <RealtimePage />;
      break;

    case "messages":
      content = (
        <Messages
          activeWorker={activeMessageWorker}
          setActiveWorker={setActiveMessageWorker}
        />
      );
      break;

    default:
      content = <Dashboard />;
      break;
  }

  /* ---------- 공통 레이아웃 Shell ---------- */

  return (
    <Shell
      user={user}
      onLogout={handleLogout}
      setRoute={(r) => setRoute(r as RouteKey)}
      currentRoute={route}
    >
      {content}
    </Shell>
  );
};

export default App;