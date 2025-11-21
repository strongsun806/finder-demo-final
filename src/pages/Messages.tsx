// src/pages/Messages.tsx
import React from "react";
import { useMainStore, ChatThread } from "../store/mainstore";

type MessagesProps = {
  activeWorker: string | null;
  setActiveWorker: (name: string | null) => void;
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const Messages: React.FC<MessagesProps> = ({
  activeWorker,
  setActiveWorker,
}) => {
  const threads = useMainStore((s) => s.threads);
  const addThread = useMainStore((s) => s.addThread);
  const sendMessage = useMainStore((s) => s.sendMessage);

  const [input, setInput] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [newWorker, setNewWorker] = React.useState("");
  const [newFirstMsg, setNewFirstMsg] = React.useState("");
  const [newAvatarFile, setNewAvatarFile] =
    React.useState<File | null>(null);

  // 현재 활성 스레드
  const currentThread: ChatThread | null =
    threads.find((t) => t.workerName === activeWorker) ||
    threads[0] ||
    null;

  // activeWorker가 비어있으면 자동 선택
  React.useEffect(() => {
    if (!activeWorker && currentThread) {
      setActiveWorker(currentThread.workerName);
    }
  }, [activeWorker, currentThread, setActiveWorker]);

  const handleSend = () => {
    if (!currentThread || !input.trim()) return;
    sendMessage(currentThread.id, "admin", input);
    setInput("");
  };

  const handleCreateThread = async () => {
    if (!newWorker.trim() || !newFirstMsg.trim()) {
      alert("근무자명과 첫 메시지를 입력하세요.");
      return;
    }

    let avatarUrl: string | undefined;
    if (newAvatarFile) {
      try {
        avatarUrl = await readFileAsDataUrl(newAvatarFile);
      } catch (e) {
        console.error("avatar 파일 읽기 오류", e);
      }
    }

    addThread(newWorker.trim(), newFirstMsg.trim(),);

    setActiveWorker(newWorker.trim());
    setNewWorker("");
    setNewFirstMsg("");
    setNewAvatarFile(null);
    setCreating(false);
  };

  return (
    <div className="flex h-[580px] bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* 왼쪽: 스레드 리스트 */}
      <aside className="w-64 border-r border-slate-200 flex flex-col">
        <div className="h-12 px-4 flex items-center justify-between border-b border-slate-200 bg-slate-50">
          <div className="text-xs font-semibold text-slate-700">
            메시지 목록
          </div>
          <button
            type="button"
            className="text-[11px] px-2 py-1 rounded-md bg-sky-600 text-white hover:bg-sky-700"
            onClick={() => setCreating(true)}
          >
            새 메시지
          </button>
        </div>
        <div className="flex-1 overflow-y-auto text-xs">
          {threads.map((t) => {
            const isActive = currentThread?.id === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveWorker(t.workerName)}
                className={`w-full text-left px-3 py-3 border-b border-slate-100 hover:bg-slate-50 ${
                  isActive ? "bg-slate-100" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-300 overflow-hidden flex-shrink-0">
                    {t.avatarUrl ? (
                      <img
                        src={t.avatarUrl}
                        alt={t.workerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-600">
                        {t.workerName[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 mb-0.5 text-[12px] truncate">
                      {t.workerName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {t.messages[t.messages.length - 1]?.text ?? ""}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {t.lastUpdated}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          {threads.length === 0 && (
            <div className="h-full flex items-center justify-center text-[11px] text-slate-400">
              메시지가 없습니다.
            </div>
          )}
        </div>
      </aside>

      {/* 오른쪽: 채팅 영역 */}
      <section className="flex-1 flex flex-col">
        <div className="h-12 px-4 flex items-center border-b border-slate-200 bg-slate-50">
          <div className="text-xs font-semibold text-slate-800">
            {currentThread
              ? `${currentThread.workerName} 근무자와의 대화`
              : "대화 선택"}
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
          {currentThread ? (
            <div className="space-y-3">
              {currentThread.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.sender === "admin"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${
                      m.sender === "admin"
                        ? "bg-sky-600 text-white rounded-br-sm"
                        : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                    }`}
                  >
                    <div>{m.text}</div>
                    <div
                      className={`mt-1 text-[10px] ${
                        m.sender === "admin"
                          ? "text-sky-100"
                          : "text-slate-400"
                      }`}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              왼쪽에서 대화를 선택하거나 새 메시지를 생성하세요.
            </div>
          )}
        </div>

        <div className="h-16 border-t border-slate-200 flex items-center px-4 gap-2 bg-white">
          <input
            className="flex-1 h-9 rounded-full border border-slate-300 px-3 text-[13px] outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="메시지를 입력하세요."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            className="h-9 px-4 rounded-full bg-sky-600 text-white text-[13px] font-semibold hover:bg-sky-700"
          >
            보내기
          </button>
        </div>
      </section>

      {/* 새 메시지 생성 모달 */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm p-5">
            <div className="text-sm font-semibold mb-3">
              새 메시지 시작
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <div className="text-slate-500 mb-1">근무자명</div>
                <input
                  value={newWorker}
                  onChange={(e) => setNewWorker(e.target.value)}
                  className="w-full h-8 px-3 rounded-md border border-slate-300"
                />
              </div>
              <div>
                <div className="text-slate-500 mb-1">첫 메시지</div>
                <textarea
                  value={newFirstMsg}
                  onChange={(e) =>
                    setNewFirstMsg(e.target.value)
                  }
                  className="w-full h-20 px-3 py-2 rounded-md border border-slate-300 resize-none"
                />
              </div>
              <div>
                <div className="text-slate-500 mb-1">
                  프로필 사진 (선택)
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setNewAvatarFile(file);
                  }}
                  className="text-[11px]"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleCreateThread}
                className="px-4 py-1.5 rounded-md bg-sky-600 text-white font-semibold hover:bg-sky-700"
              >
                만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
