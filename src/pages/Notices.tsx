// src/pages/Notices.tsx
import React from "react";

type NoticeType = "공지" | "점검" | "안내";
type NoticeStatus = "게시중" | "숨김";

type Notice = {
  id: number;
  title: string;
  type: NoticeType;
  target: string;
  writer: string;
  createdAt: string;
  status: NoticeStatus;
  content: string;
};

const LS_KEY = "finder_notices";

const initialDemo: Notice[] = [
  {
    id: 1,
    title: "10월 시스템 점검 안내",
    type: "점검",
    target: "전체 근무자",
    writer: "관리자",
    createdAt: "2025-10-15 09:00",
    status: "게시중",
    content:
      "10월 20일(월) 00:00~04:00 시스템 점검이 예정되어 있습니다.\n해당 시간 동안 서비스 이용이 제한될 수 있습니다.",
  },
  {
    id: 2,
    title: "야드 안전 수칙 재공지",
    type: "공지",
    target: "야드 근무자",
    writer: "관리자",
    createdAt: "2025-10-10 14:30",
    status: "게시중",
    content:
      "야드 내 이동 시 반드시 지정된 통로를 이용해 주세요.\n안전모 및 조끼 미착용 시 출입이 제한될 수 있습니다.",
  },
];

const Notices: React.FC = () => {
  const [notices, setNotices] = React.useState<Notice[]>([]);
  const [filterType, setFilterType] =
    React.useState<NoticeType | "전체">("전체");
  const [search, setSearch] = React.useState("");
  const [detail, setDetail] = React.useState<Notice | null>(null);
  const [editTarget, setEditTarget] = React.useState<Notice | null>(null);
  const [openEditor, setOpenEditor] = React.useState(false);

  // 편집용 상태
  const [formTitle, setFormTitle] = React.useState("");
  const [formType, setFormType] = React.useState<NoticeType>("공지");
  const [formTarget, setFormTarget] =
    React.useState("전체 근무자");
  const [formContent, setFormContent] = React.useState("");
  const [formStatus, setFormStatus] =
    React.useState<NoticeStatus>("게시중");

  /* 🔹 1. 최초 진입 시 localStorage에서 공지 목록 로드 */
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Notice[];
        setNotices(parsed);
      } else {
        setNotices(initialDemo);
        localStorage.setItem(LS_KEY, JSON.stringify(initialDemo));
      }
    } catch (e) {
      console.error("공지사항 로드 오류", e);
      setNotices(initialDemo);
    }
  }, []);

  /* 🔹 공통: 배열을 업데이트하면서 동시에 localStorage에 바로 저장 */
  const updateNoticesAndSave = (
    updater: (prev: Notice[]) => Notice[]
  ) => {
    setNotices((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("공지사항 저장 오류", e);
      }
      return next;
    });
  };

  const resetForm = () => {
    setFormTitle("");
    setFormType("공지");
    setFormTarget("전체 근무자");
    setFormContent("");
    setFormStatus("게시중");
    setEditTarget(null);
  };

  const openCreate = () => {
    resetForm();
    setOpenEditor(true);
  };

  const openEdit = (n: Notice) => {
    setEditTarget(n);
    setFormTitle(n.title);
    setFormType(n.type);
    setFormTarget(n.target);
    setFormContent(n.content);
    setFormStatus(n.status);
    setOpenEditor(true);
  };

  const handleSave = () => {
    if (!formTitle.trim() || !formContent.trim()) {
      alert("제목과 내용을 입력해 주세요.");
      return;
    }

    const now = new Date();
    const createdStr = `${now.getFullYear()}-${
      String(now.getMonth() + 1).padStart(2, "0")
    }-${String(now.getDate()).padStart(2, "0")} ${String(
      now.getHours()
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    if (editTarget) {
      // 🔄 수정 + 저장
      updateNoticesAndSave((prev) =>
        prev.map((n) =>
          n.id === editTarget.id
            ? {
                ...n,
                title: formTitle.trim(),
                type: formType,
                target: formTarget.trim(),
                content: formContent.trim(),
                status: formStatus,
              }
            : n
        )
      );
    } else {
      // 🆕 새 공지 등록 + 저장
      const newNotice: Notice = {
        id: Date.now(),
        title: formTitle.trim(),
        type: formType,
        target: formTarget.trim(),
        writer: "관리자",
        createdAt: createdStr,
        status: formStatus,
        content: formContent.trim(),
      };
      updateNoticesAndSave((prev) => [newNotice, ...prev]);
    }

    setOpenEditor(false);
    resetForm();
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("해당 공지사항을 삭제하시겠습니까?")) return;
    updateNoticesAndSave((prev) => prev.filter((n) => n.id !== id));
    if (detail?.id === id) setDetail(null);
  };

  const handleToggleStatus = (id: number) => {
    updateNoticesAndSave((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              status: n.status === "게시중" ? "숨김" : "게시중",
            }
          : n
      )
    );
  };

  // 🔎 필터/검색 적용
  const filtered = notices.filter((n) => {
    if (filterType !== "전체" && n.type !== filterType) return false;
    if (!search.trim()) return true;
    const s = search.trim();
    return (
      n.title.includes(s) ||
      n.content.includes(s) ||
      n.writer.includes(s)
    );
  });

  return (
    <div className="space-y-4">
      {/* 상단 필터 바 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[13px]">
          <button
            type="button"
            onClick={() => setFilterType("전체")}
            className={`px-3 py-1.5 rounded-full border text-xs ${
              filterType === "전체"
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            전체
          </button>
          <button
            type="button"
            onClick={() => setFilterType("공지")}
            className={`px-3 py-1.5 rounded-full border text-xs ${
              filterType === "공지"
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            공지
          </button>
          <button
            type="button"
            onClick={() => setFilterType("점검")}
            className={`px-3 py-1.5 rounded-full border text-xs ${
              filterType === "점검"
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            점검
          </button>
          <button
            type="button"
            onClick={() => setFilterType("안내")}
            className={`px-3 py-1.5 rounded-full border text-xs ${
              filterType === "안내"
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            안내
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            className="h-8 w-52 rounded-full border border-slate-300 px-3 text-[12px] outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="제목/내용/작성자 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            onClick={openCreate}
            className="h-8 px-4 rounded-full bg-sky-600 text-white text-[12px] font-semibold hover:bg-sky-700"
          >
            공지사항 등록
          </button>
        </div>
      </div>

      {/* 공지사항 리스트 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-[13px] text-slate-500">
              <th className="py-2.5 px-4 text-left w-20">구분</th>
              <th className="py-2.5 px-4 text-left">제목</th>
              <th className="py-2.5 px-4 text-left w-40">대상</th>
              <th className="py-2.5 px-4 text-center w-28">
                작성자
              </th>
              <th className="py-2.5 px-4 text-center w-40">
                등록일
              </th>
              <th className="py-2.5 px-4 text-center w-24">
                상태
              </th>
              <th className="py-2.5 px-4 text-center w-24">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-slate-700">
            {filtered.map((n, idx) => (
              <tr
                key={n.id}
                className={
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                }
              >
                <td className="py-2.5 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${
                      n.type === "공지"
                        ? "bg-sky-50 text-sky-700 border-sky-200"
                        : n.type === "점검"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {n.type}
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  <button
                    type="button"
                    className="text-sky-600 hover:underline text-left"
                    onClick={() => setDetail(n)}
                  >
                    {n.title}
                  </button>
                </td>
                <td className="py-2.5 px-4">{n.target}</td>
                <td className="py-2.5 px-4 text-center">
                  {n.writer}
                </td>
                <td className="py-2.5 px-4 text-center">
                  {n.createdAt}
                </td>
                <td className="py-2.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(n.id)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] border ${
                      n.status === "게시중"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-300"
                    }`}
                  >
                    {n.status}
                  </button>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => openEdit(n)}
                    className="text-[11px] text-sky-600 hover:underline mr-2"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    className="text-[11px] text-rose-500 hover:underline"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-6 text-center text-slate-400 text-[13px]"
                >
                  조건에 맞는 공지사항이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 상세 모달 */}
      {detail && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-5 relative">
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm"
            >
              닫기
            </button>

            <div className="space-y-3 text-[13px] text-slate-700">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${
                    detail.type === "공지"
                      ? "bg-sky-50 text-sky-700 border-sky-200"
                      : detail.type === "점검"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {detail.type}
                </span>
                <h2 className="text-sm font-semibold">
                  {detail.title}
                </h2>
              </div>

              <div className="grid grid-cols-[80px_1fr] gap-y-1.5 gap-x-4 text-[12px]">
                <div className="text-slate-500">대상</div>
                <div>{detail.target}</div>

                <div className="text-slate-500">작성자</div>
                <div>{detail.writer}</div>

                <div className="text-slate-500">등록일</div>
                <div>{detail.createdAt}</div>

                <div className="text-slate-500">상태</div>
                <div>{detail.status}</div>
              </div>

              <div className="mt-3 border-t border-slate-200 pt-3">
                <div className="text-slate-500 text-[12px] mb-1">
                  내용
                </div>
                <div className="text-[13px] whitespace-pre-wrap leading-relaxed">
                  {detail.content}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-1.5 text-[12px] text-slate-500 hover:text-slate-700"
                  onClick={() => {
                    setDetail(null);
                    openEdit(detail);
                  }}
                >
                  수정
                </button>
                <button
                  type="button"
                  className="px-5 py-1.5 bg-sky-600 text-white rounded-md text-[12px] hover:bg-sky-700"
                  onClick={() => setDetail(null)}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 공지 등록/수정 모달 */}
      {openEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">
                {editTarget ? "공지사항 수정" : "공지사항 등록"}
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpenEditor(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                닫기
              </button>
            </div>

            <div className="space-y-3 text-[12px]">
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="text-slate-500 mb-1">제목</div>
                  <input
                    value={formTitle}
                    onChange={(e) =>
                      setFormTitle(e.target.value)
                    }
                    className="w-full h-8 rounded-md border border-slate-300 px-2"
                  />
                </div>
                <div className="w-28">
                  <div className="text-slate-500 mb-1">구분</div>
                  <select
                    value={formType}
                    onChange={(e) =>
                      setFormType(
                        e.target.value as NoticeType
                      )
                    }
                    className="w-full h-8 rounded-md border border-slate-300 px-2"
                  >
                    <option value="공지">공지</option>
                    <option value="점검">점검</option>
                    <option value="안내">안내</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="text-slate-500 mb-1">대상</div>
                <input
                  value={formTarget}
                  onChange={(e) =>
                    setFormTarget(e.target.value)
                  }
                  className="w-full h-8 rounded-md border border-slate-300 px-2"
                />
              </div>

              <div>
                <div className="text-slate-500 mb-1">내용</div>
                <textarea
                  value={formContent}
                  onChange={(e) =>
                    setFormContent(e.target.value)
                  }
                  className="w-full h-32 rounded-md border border-slate-300 px-2 py-2 resize-none"
                />
              </div>

              <div>
                <div className="text-slate-500 mb-1">상태</div>
                <select
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(
                      e.target.value as NoticeStatus
                    )
                  }
                  className="w-32 h-8 rounded-md border border-slate-300 px-2"
                >
                  <option value="게시중">게시중</option>
                  <option value="숨김">숨김</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2 text-[12px]">
              <button
                type="button"
                onClick={() => {
                  setOpenEditor(false);
                  resetForm();
                }}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-1.5 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700"
              >
                {editTarget ? "수정 완료" : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;