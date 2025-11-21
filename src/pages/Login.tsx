// src/pages/Login.tsx
import React from "react";
import { useMainStore } from "../store/mainstore";

type UserInfo = {
  name: string;
  company: string;
  role: "admin" | "staff";
};

type LoginProps = {
  onSuccess: (user: UserInfo) => void;
};

export default function Login({ onSuccess }: LoginProps) {
  const approvedUsers = useMainStore((s) => s.approvedUsers);
  const addPendingUser = useMainStore((s) => s.addPendingUser);

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [openReg, setOpenReg] = React.useState(false);
  const [regUser, setRegUser] = React.useState("");
  const [regPass, setRegPass] = React.useState("");
  const [regName, setRegName] = React.useState("");
  const [regEmail, setRegEmail] = React.useState("");
  const [regDone, setRegDone] = React.useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;

    setErr(null);
    setLoading(true);

    try {
      const found = approvedUsers.find(
        (u) =>
          u.username === username.trim() &&
          u.password === password.trim()
      );

      if (!found) {
        setErr(
          "아이디 또는 비밀번호가 올바르지 않거나, 관리자 승인이 완료되지 않았습니다."
        );
        return;
      }

      const userInfo: UserInfo = {
        name: found.name,
        company: "FINDER DEMO",
        role: found.role,
      };

      onSuccess(userInfo);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (type: "admin" | "staff") => {
    if (type === "admin") {
      setUsername("admin");
      setPassword("admin123");
    } else {
      setUsername("staff");
      setPassword("staff123");
    }
    setErr(null);
  };

  const register = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;

    if (
      !regUser.trim() ||
      !regPass.trim() ||
      !regName.trim() ||
      !regEmail.trim()
    ) {
      alert("아이디, 비밀번호, 이름, 이메일을 모두 입력하세요.");
      return;
    }

    addPendingUser({
      username: regUser.trim(),
      password: regPass.trim(),
      name: regName.trim(),
      email: regEmail.trim(),
    });

    setRegDone(true);
    setTimeout(() => {
      setOpenReg(false);
      setRegDone(false);
      setRegUser("");
      setRegPass("");
      setRegName("");
      setRegEmail("");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#003388] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5">

        {/* 로고 영역 */}
        <div className="text-center mb-2">
          <img
            src="/images/logo-finder-main.png"
            alt="FINDER"
            className="mx-auto h-30 w-auto object-contain"
          />
          <div className="mt-1 text-[11px] text-slate-500">
            항만·물류 업무 플랫폼 Admin
          </div>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={submit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <div className="text-slate-500">아이디</div>
            <input
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div className="space-y-1">
            <div className="text-slate-500">비밀번호</div>
            <input
              type="password"
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {err && (
            <div className="text-[11px] text-red-500 whitespace-pre-line">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 rounded-full bg-[#003388] hover:bg-[#002266] text-white text-[13px] font-semibold transition disabled:opacity-60"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 데모 계정 바로 입력 */}
        <div className="text-[11px] text-center text-slate-500 space-y-2 pt-2">
          <div className="font-semibold mb-1">데모 계정 바로입력</div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill("admin")}
              className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-[11px] hover:bg-slate-200"
            >
              관리자 (admin / admin123)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("staff")}
              className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-[11px] hover:bg-slate-200"
            >
              스태프 (staff / staff123)
            </button>
          </div>
        </div>

        {/* 회원가입 버튼 */}
        <div className="pt-2 text-center">
          <button
            className="text-[11px] text-slate-500 hover:text-slate-700 underline"
            onClick={() => setOpenReg(true)}
          >
            회원가입
          </button>
        </div>

        {/* 회원가입 모달 */}
        {openReg && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-xl border border-slate-200 p-5 w-full max-w-sm space-y-4 shadow-xl text-xs">
              <div className="text-sm font-semibold">
                회원가입 요청
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-slate-500 mb-1">아이디</div>
                  <input
                    value={regUser}
                    onChange={(e) => setRegUser(e.target.value)}
                    className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px]"
                  />
                </div>
                <div>
                  <div className="text-slate-500 mb-1">비밀번호</div>
                  <input
                    type="password"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px]"
                  />
                </div>
                <div>
                  <div className="text-slate-500 mb-1">이름</div>
                  <input
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px]"
                  />
                </div>
                <div>
                  <div className="text-slate-500 mb-1">이메일</div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full h-8 rounded-lg border border-slate-300 px-3 text-[12px]"
                  />
                </div>
              </div>

              {regDone && (
                <div className="text-[11px] text-emerald-600 font-medium">
                  요청이 등록되었습니다. 관리자가 승인하면 로그인할 수 있습니다.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setOpenReg(false)}
                  className="px-4 py-1.5 text-slate-600 hover:text-slate-800"
                  disabled={regDone}
                >
                  닫기
                </button>
                <button
                  onClick={register}
                  className="px-4 py-1.5 bg-[#003388] text-white rounded-lg hover:bg-[#002266]"
                  disabled={regDone}
                >
                  요청 등록
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}