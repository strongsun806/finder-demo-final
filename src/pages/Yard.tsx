// src/pages/Yard.tsx
import React, { useState } from "react";
import {
  useMainStore,
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from "../store/mainstore";
import Yardmap from "../components/Yardmap";

export default function Yard() {
  const incidents = useMainStore((s) => s.incidents);
  const addIncident = useMainStore((s) => s.addIncident);
  const updateIncidentStatus = useMainStore((s) => s.updateIncidentStatus);
  const deleteIncident = useMainStore((s) => s.deleteIncident);

  const [selectedIncident, setSelectedIncident] =
    useState<Incident | null>(null);

  // 상세 팝업 on/off
  const [openDetailModal, setOpenDetailModal] = useState(false);

  // 사고 등록 모달
  const [openModal, setOpenModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formSeverity, setFormSeverity] =
    useState<IncidentSeverity>("보통");
  const [formDescription, setFormDescription] = useState("");

  const resetForm = () => {
    setFormTitle("");
    setFormLocation("");
    setFormSeverity("보통");
    setFormDescription("");
  };

  const handleAddIncident = () => {
    if (!formTitle.trim() || !formLocation.trim()) {
      alert("사고 제목과 위치를 입력해 주세요.");
      return;
    }

    addIncident({
      title: formTitle.trim(),
      location: formLocation.trim(),
      severity: formSeverity,
      description: formDescription.trim(),
    });

    setOpenModal(false);
    resetForm();
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("해당 사고 기록을 삭제할까요?")) return;
    deleteIncident(id);

    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident(null);
      setOpenDetailModal(false);
    }
  };

  // 리스트/지도에서 사고 선택 시 공통 동작
  const selectAndOpenDetail = (incident: Incident) => {
    setSelectedIncident(incident);
    setOpenDetailModal(true); // 팝업 열기
  };

  return (
    <div className="space-y-6">
      {/* 타이틀 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            야드관리
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            야드 내 사고/이상 징후를 등록하고, 지도 기반으로 위치를
            확인합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="px-4 py-2 rounded-full bg-sky-600 text-white text-[13px] font-semibold hover:bg-sky-700"
        >
          사고 등록
        </button>
      </div>

      {/* 상단: 리스트 + 지도 */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(360px,420px)_1fr] gap-4">
        {/* 좌측: 사고 리스트 */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="h-10 px-4 flex items-center justify-between border-b border-slate-200 bg-slate-50 text-[13px]">
            <span className="font-semibold text-slate-800">
              사고 / 이상 징후 목록
            </span>
            <span className="text-[11px] text-slate-500">
              총 {incidents.length}건
            </span>
          </div>

          <div className="flex-1 overflow-y-auto text-[12px]">
            {incidents.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-[11px]">
                등록된 사고가 없습니다. 상단 &quot;사고 등록&quot; 버튼으로
                새로운 사고를 입력하세요.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[11px] text-slate-500">
                    <th className="py-2 px-3 text-left w-16">심각도</th>
                    <th className="py-2 px-3 text-left">제목</th>
                    <th className="py-2 px-3 text-center w-16">위치</th>
                    <th className="py-2 px-3 text-center w-24">상태</th>
                    <th className="py-2 px-3 text-center w-16">삭제</th>
                  </tr>
                </thead>
                <tbody className="text-[12px] text-slate-700">
                  {incidents.map((i, idx) => (
                    <tr
                      key={i.id}
                      className={
                        idx % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50/60"
                      }
                    >
                      <td className="py-2 px-3">
                        <SeverityBadge severity={i.severity} />
                      </td>
                      <td className="py-2 px-3">
                        <button
                          type="button"
                          className="text-sky-600 hover:underline text-left"
                          onClick={() => selectAndOpenDetail(i)}
                        >
                          {i.title}
                        </button>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {i.time}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {i.location}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <select
                          value={i.status}
                          onChange={(e) =>
                            updateIncidentStatus(
                              i.id,
                              e.target.value as IncidentStatus
                            )
                          }
                          className="border border-slate-300 rounded-full px-2 py-0.5 text-[11px]"
                        >
                          <option value="진행중">진행중</option>
                          <option value="조치완료">조치완료</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(i.id)}
                          className="text-[11px] text-rose-500 hover:text-rose-600"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 우측: 실제 지도 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-800">
              실시간 야드 지도
            </h2>
            <div className="text-[11px] text-slate-500">
              * 마커 클릭 시 사고 상세 팝업과 하단 상세가 함께 표시됩니다.
            </div>
          </div>

          <div className="h-[360px] rounded-xl overflow-hidden border border-slate-200">
            <Yardmap
              incidents={incidents}
              onSelectIncident={(incident) =>
                selectAndOpenDetail(incident)
              }
            />
          </div>
        </div>
      </div>

      {/* 하단: 사고 상세 패널 */}
      {selectedIncident && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-slate-800">
              사고 상세
            </h2>
            <button
              onClick={() => setSelectedIncident(null)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              닫기
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <SeverityBadge severity={selectedIncident.severity} />
            <div className="text-sm font-semibold text-slate-900">
              {selectedIncident.title}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mb-3">
            위치: {selectedIncident.location} · 발생 시간:{" "}
            {selectedIncident.time} · 상태: {selectedIncident.status}
          </div>
          <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {selectedIncident.description ||
              "상세 내용이 입력되지 않았습니다."}
          </div>
        </div>
      )}

      {/* 사고 상세 팝업 모달 */}
      {openDetailModal && selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setOpenDetailModal(false)}
        />
      )}

      {/* 사고 등록 모달 */}
      {openModal && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">
                사고 / 이상 징후 등록
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpenModal(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                닫기
              </button>
            </div>

            <div className="space-y-3 text-[12px]">
              <div>
                <div className="text-slate-500 mb-1">제목</div>
                <input
                  value={formTitle}
                  onChange={(e) =>
                    setFormTitle(e.target.value)
                  }
                  className="w-full h-8 rounded-md border border-slate-300 px-2 text-[12px]"
                  placeholder="예: A-03 구역 지게차 접촉"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="text-slate-500 mb-1">
                    위치 (예: A-03)
                  </div>
                  <input
                    value={formLocation}
                    onChange={(e) =>
                      setFormLocation(e.target.value)
                    }
                    className="w-full h-8 rounded-md border border-slate-300 px-2 text-[12px]"
                  />
                </div>
                <div className="w-28">
                  <div className="text-slate-500 mb-1">
                    심각도
                  </div>
                  <select
                    value={formSeverity}
                    onChange={(e) =>
                      setFormSeverity(
                        e.target.value as IncidentSeverity
                      )
                    }
                    className="w-full h-8 rounded-md border border-slate-300 px-2 text-[12px]"
                  >
                    <option value="경미">경미</option>
                    <option value="보통">보통</option>
                    <option value="중대">중대</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="text-slate-500 mb-1">
                  상세 내용
                </div>
                <textarea
                  value={formDescription}
                  onChange={(e) =>
                    setFormDescription(e.target.value)
                  }
                  className="w-full h-32 rounded-md border border-slate-300 px-2 py-2 resize-none text-[12px]"
                  placeholder="발생 경위, 인명 피해 여부, 장비/구역 조치 내용 등을 입력해 주세요."
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2 text-[12px]">
              <button
                type="button"
                onClick={() => {
                  setOpenModal(false);
                  resetForm();
                }}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleAddIncident}
                className="px-5 py-1.5 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 심각도 뱃지 ─── */

function SeverityBadge({
  severity,
}: {
  severity: IncidentSeverity;
}) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px]";

  if (severity === "중대") {
    return (
      <span className={`${base} bg-rose-50 text-rose-600 border-rose-200`}>
        중대
      </span>
    );
  }
  if (severity === "보통") {
    return (
      <span
        className={`${base} bg-amber-50 text-amber-600 border-amber-200`}
      >
        보통
      </span>
    );
  }
  return (
    <span
      className={`${base} bg-emerald-50 text-emerald-600 border-emerald-200`}
    >
      경미
    </span>
  );
}

/* ─── 사고 상세 팝업 모달 ─── */

function IncidentDetailModal({
  incident,
  onClose,
}: {
  incident: Incident;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/45">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl p-5 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm"
        >
          닫기
        </button>

        <div className="space-y-3 text-[13px] text-slate-700">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={incident.severity} />
            <h2 className="text-sm font-semibold">
              {incident.title}
            </h2>
          </div>

          <div className="grid grid-cols-[80px_1fr] gap-y-1.5 gap-x-4 text-[12px]">
            <div className="text-slate-500">위치</div>
            <div>{incident.location}</div>

            <div className="text-slate-500">발생 시간</div>
            <div>{incident.time}</div>

            <div className="text-slate-500">상태</div>
            <div>{incident.status}</div>
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="text-slate-500 text-[12px] mb-1">
              상세 내용
            </div>
            <div className="text-[13px] whitespace-pre-wrap leading-relaxed">
              {incident.description ||
                "상세 내용이 입력되지 않았습니다."}
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="button"
              className="px-5 py-1.5 bg-sky-600 text-white rounded-md text-[12px] hover:bg-sky-700"
              onClick={onClose}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}