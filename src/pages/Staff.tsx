// src/pages/StaffPage.tsx (또는 Workers.tsx 등, 라우트에서 쓰는 파일명/컴포넌트명에 맞게 수정)

import React, { useState, ChangeEvent } from "react";

type WorkerStatus = "근무중" | "대기" | "휴식";
type EquipStatus = "가동" | "대기" | "점검";
type EquipmentModalMode = "view" | "edit" | "create";

interface Worker {
  id: number;
  name: string;
  role: string;
  zone: string;
  phone: string;
  status: WorkerStatus;
  lastUpdate: string;
  email?: string;
  company?: string;
  hireDate?: string;
}

interface Equipment {
  id: number;
  name: string;
  type: string;
  zone: string;
  status: EquipStatus;
  lastWork: string;
  imageUrl?: string | null;
  manager?: string;
  plateNo?: string;
  memo?: string;
}

/* ───── 샘플 데이터 ───── */

const workersData: Worker[] = [
  {
    id: 1,
    name: "김길동",
    role: "셔틀 / 야드운전수",
    zone: "A구역 D-2",
    phone: "010-1234-5678",
    status: "근무중",
    lastUpdate: "14:05",
    email: "kim@finder-er.com",
    company: "(주)파인드이알",
    hireDate: "2022-03-01",
  },
  {
    id: 2,
    name: "박근수",
    role: "대리 / 현장관리자",
    zone: "B구역 B-1",
    phone: "010-2345-6789",
    status: "대기",
    lastUpdate: "13:58",
    email: "park@finder-er.com",
    company: "(주)파인드이알",
    hireDate: "2021-07-15",
  },
  {
    id: 3,
    name: "이하준",
    role: "야드운전수",
    zone: "D구역 C-3",
    phone: "010-3456-7890",
    status: "휴식",
    lastUpdate: "13:40",
    email: "lee@finder-er.com",
    company: "(주)파인드이알",
    hireDate: "2023-01-10",
  },
];

const initialEquipments: Equipment[] = [
  {
    id: 1,
    name: "지게차 01",
    type: "지게차",
    zone: "A구역 D-2",
    status: "가동",
    lastWork: "14:02 컨테이너 하차",
    imageUrl: null,
    manager: "김길동",
    plateNo: "부산 12가 1234",
    memo: "A구역 주력 장비",
  },
  {
    id: 2,
    name: "리치스태커 03",
    type: "리치스태커",
    zone: "B구역 R-1",
    status: "대기",
    lastWork: "13:30 작업 완료 후 대기",
    imageUrl: null,
    manager: "박근수",
    plateNo: "부산 34나 5678",
    memo: "",
  },
  {
    id: 3,
    name: "트럭 12",
    type: "트레일러",
    zone: "진입로",
    status: "점검",
    lastWork: "13:10 진입 중 이상 진단",
    imageUrl: null,
    manager: "외부차량",
    plateNo: "서울 56다 9012",
    memo: "브레이크 점검 필요",
  },
];

/* ───── 페이지 컴포넌트 ───── */

export default function StaffPage() {
  /* 근무자 필터 상태 */
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | "전체">(
    "전체"
  );
  const [keyword, setKeyword] = useState("");

  const filteredWorkers = workersData.filter((w) => {
    const statusOk =
      statusFilter === "전체" ? true : w.status === statusFilter;
    const kw = keyword.trim();
    const kwOk =
      kw.length === 0 ||
      w.name.includes(kw) ||
      w.role.includes(kw) ||
      w.zone.includes(kw);
    return statusOk && kwOk;
  });

  const totalWorkers = workersData.length;
  const workingCount = workersData.filter(
    (w) => w.status === "근무중"
  ).length;
  const restingCount = workersData.filter(
    (w) => w.status === "휴식"
  ).length;

  /* 근무자 정보 보기 모달 */
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  /* 장비/차량 상태 */
  const [equipmentList, setEquipmentList] =
    useState<Equipment[]>(initialEquipments);
  const runningEquip = equipmentList.filter(
    (e) => e.status === "가동"
  ).length;
  const equipRate =
    equipmentList.length === 0
      ? 0
      : Math.round((runningEquip / equipmentList.length) * 100);

  /* 장비/차량 상세 & 수정/등록 모달 상태 */
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [equipmentModalMode, setEquipmentModalMode] =
    useState<EquipmentModalMode>("view");
  const [selectedEquipment, setSelectedEquipment] =
    useState<Equipment | null>(null);
  const [equipmentDraft, setEquipmentDraft] =
    useState<Equipment | null>(null);

  /* ─── 장비 모달 열기/닫기 ─── */

  const openEquipmentView = (equip: Equipment) => {
    setSelectedEquipment(equip);
    setEquipmentDraft(equip);
    setEquipmentModalMode("view");
    setEquipmentModalOpen(true);
  };

  const openEquipmentCreate = () => {
    const blank: Equipment = {
      id: 0,
      name: "",
      type: "",
      zone: "",
      status: "가동",
      lastWork: "",
      imageUrl: null,
      manager: "",
      plateNo: "",
      memo: "",
    };
    setSelectedEquipment(null);
    setEquipmentDraft(blank);
    setEquipmentModalMode("create");
    setEquipmentModalOpen(true);
  };

  const closeEquipmentModal = () => {
    setEquipmentModalOpen(false);
    setEquipmentDraft(null);
    setSelectedEquipment(null);
    setEquipmentModalMode("view");
  };

  /* ─── 장비 폼 조작 ─── */

  const handleEquipmentFieldChange = (
    field: keyof Equipment,
    value: string
  ) => {
    setEquipmentDraft((prev) =>
      prev ? { ...prev, [field]: value } : prev
    );
  };

  const handleEquipmentImageChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setEquipmentDraft((prev) =>
      prev ? { ...prev, imageUrl: url } : prev
    );
  };

  const saveEquipment = () => {
    if (!equipmentDraft) return;
    if (!equipmentDraft.name.trim()) {
      alert("장비명을 입력해 주세요.");
      return;
    }

    if (equipmentModalMode === "create") {
      const nextId =
        equipmentList.reduce(
          (max, e) => (e.id > max ? e.id : max),
          0
        ) + 1;
      const newEquip = { ...equipmentDraft, id: nextId };
      setEquipmentList((prev) => [...prev, newEquip]);
      setSelectedEquipment(newEquip);
    } else if (
      equipmentModalMode === "edit" &&
      selectedEquipment
    ) {
      setEquipmentList((prev) =>
        prev.map((e) =>
          e.id === selectedEquipment.id
            ? { ...(equipmentDraft as Equipment), id: selectedEquipment.id }
            : e
        )
      );
      setSelectedEquipment(
        equipmentDraft ? { ...equipmentDraft } : selectedEquipment
      );
    }

    setEquipmentModalMode("view");
    setEquipmentModalOpen(false);
  };

  const cancelEquipmentEdit = () => {
    if (equipmentModalMode === "create") {
      // 새 등록 중이었으면 그냥 닫기
      closeEquipmentModal();
    } else if (equipmentModalMode === "edit") {
      // 수정 중이면 view 모드로 되돌리고, 값은 원래 선택된 장비로 롤백
      setEquipmentModalMode("view");
      setEquipmentDraft(selectedEquipment);
    } else {
      // view 모드에서 호출되면 그냥 닫기
      closeEquipmentModal();
    }
  };

  /* ───── 렌더 ───── */

  return (
    <div className="space-y-6">
      {/* 타이틀 */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          근무자 / 장비관리
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          현재 야드에 배치된 근무자와 장비의 근무상태, 위치, 가동 내역을
          관리합니다.
        </p>
      </div>

      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="전체 근무자"
          value={`${totalWorkers} 명`}
          description="야드 및 현장에 등록된 근무자 수"
        />
        <SummaryCard
          label="현재 근무중"
          value={`${workingCount} 명`}
          highlight="text-emerald-600"
          description="실시간으로 작업중인 근무자 수"
        />
        <SummaryCard
          label="장비 가동률"
          value={`${equipRate} %`}
          highlight={equipRate < 50 ? "text-amber-600" : "text-sky-600"}
          description={`등록 장비 ${equipmentList.length}대 중 ${runningEquip}대 가동`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.8fr,1.2fr] gap-4">
        {/* 좌측: 근무자 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-table-border overflow-hidden">
          <div className="h-10 px-4 flex items-center justify-between border-b border-table-border bg-slate-50">
            <span className="text-sm font-semibold text-slate-800">
              근무자 목록
            </span>
            <span className="text-[11px] text-slate-500">
              근무상태, 위치, 역할을 기준으로 근무자를 조회합니다.
            </span>
          </div>

          {/* 필터 */}
          <div className="px-4 py-3 flex flex-wrap items-center gap-3 border-b border-table-border text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">근무상태</span>
              <div className="flex rounded-full bg-slate-100 p-[2px]">
                {["전체", "근무중", "대기", "휴식"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setStatusFilter(
                        s === "전체" ? "전체" : (s as WorkerStatus)
                      )
                    }
                    className={[
                      "px-3 py-1 rounded-full transition text-[11px]",
                      statusFilter === s
                        ? "bg-white text-slate-900 shadow-sm border border-table-border"
                        : "text-slate-500",
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[180px]">
              <span className="text-slate-600">검색</span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="이름, 역할, 구역으로 검색"
                className="flex-1 h-7 rounded-full border border-table-border bg-slate-50 px-3 text-[11px] outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white"
              />
            </div>
          </div>

          {/* 근무자 테이블 */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="h-9 bg-slate-50 text-[11px] text-slate-500 border-b border-table-border">
                  <th className="px-4 text-left font-medium">이름</th>
                  <th className="px-2 text-left font-medium">역할</th>
                  <th className="px-2 text-left font-medium">근무 구역</th>
                  <th className="px-2 text-left font-medium">연락처</th>
                  <th className="px-2 text-left font-medium">근무상태</th>
                  <th className="px-2 text-left font-medium">
                    최근 위치 업데이트
                  </th>
                  <th className="px-2 text-left font-medium">정보</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-[11px] text-slate-400"
                    >
                      조건에 해당하는 근무자가 없습니다.
                    </td>
                  </tr>
                )}
                {filteredWorkers.map((w, idx) => (
                  <tr
                    key={w.id}
                    className={[
                      "h-9 border-b border-table-border/70 text-[11px]",
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                    ].join(" ")}
                  >
                    <td className="px-4 text-slate-900 font-medium">
                      {w.name}
                    </td>
                    <td className="px-2 text-slate-700">{w.role}</td>
                    <td className="px-2 text-slate-700">{w.zone}</td>
                    <td className="px-2 text-slate-600">{w.phone}</td>
                    <td className="px-2">
                      <WorkerStatusBadge status={w.status} />
                    </td>
                    <td className="px-2 text-slate-500">{w.lastUpdate}</td>
                    <td className="px-2">
                      <button
                        type="button"
                        onClick={() => setSelectedWorker(w)}
                        className="px-3 py-[5px] rounded-full text-[11px] bg-white border border-table-border text-slate-700 hover:bg-slate-50"
                      >
                        근무자 정보 보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 우측: 장비 요약 + 목록 */}
        <div className="space-y-4">
          {/* 요약 */}
          <div className="bg-white rounded-xl shadow-sm border border-table-border p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">
                장비 현황 요약
              </span>
              <span className="text-[11px] text-slate-500">
                {equipmentList.length}대 중{" "}
                <span className="text-sky-600 font-semibold">
                  {runningEquip}대 가동중
                </span>
              </span>
            </div>
            <div className="flex items-end gap-4 mt-2">
              <div className="flex-1 flex items-center gap-3">
                <EquipLegend color="bg-emerald-500" label="가동" />
                <EquipLegend color="bg-sky-500" label="대기" />
                <EquipLegend color="bg-amber-500" label="점검" />
              </div>
              <div className="text-right text-[11px] text-slate-500">
                * 장비 상태는 실시간 가동로그 기준입니다.
              </div>
            </div>
          </div>

          {/* 장비 목록 */}
          <div className="bg-white rounded-xl shadow-sm border border-table-border overflow-hidden">
            <div className="h-10 px-4 flex items-center justify-between border-b border-table-border bg-slate-50">
              <span className="text-sm font-semibold text-slate-800">
                장비 / 차량 목록
              </span>
              <button
                type="button"
                onClick={openEquipmentCreate}
                className="px-3 py-[5px] rounded-full text-[11px] bg-sidebar-bg text-white hover:bg-sidebar-hover"
              >
                장비 / 차량 등록
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="h-9 bg-slate-50 text-[11px] text-slate-500 border-b border-table-border">
                    <th className="px-4 text-left font-medium">장비명</th>
                    <th className="px-2 text-left font-medium">유형</th>
                    <th className="px-2 text-left font-medium">위치</th>
                    <th className="px-2 text-left font-medium">상태</th>
                    <th className="px-2 text-left font-medium">최근 작업</th>
                    <th className="px-2 text-left font-medium">이미지</th>
                    <th className="px-2 text-left font-medium">상세</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentList.map((e, idx) => (
                    <tr
                      key={e.id}
                      className={[
                        "h-9 border-b border-table-border/70 text-[11px]",
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                      ].join(" ")}
                    >
                      <td className="px-4 text-slate-900 font-medium">
                        {e.name}
                      </td>
                      <td className="px-2 text-slate-700">{e.type}</td>
                      <td className="px-2 text-slate-700">{e.zone}</td>
                      <td className="px-2">
                        <EquipStatusBadge status={e.status} />
                      </td>
                      <td className="px-2 text-slate-500">
                        {e.lastWork}
                      </td>
                      <td className="px-2">
                        {e.imageUrl ? (
                          <img
                            src={e.imageUrl}
                            alt={e.name}
                            className="w-10 h-6 rounded object-cover border border-table-border/70"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            없음
                          </span>
                        )}
                      </td>
                      <td className="px-2">
                        <button
                          type="button"
                          onClick={() => openEquipmentView(e)}
                          className="px-3 py-[5px] rounded-full text-[11px] bg-white border border-table-border text-slate-700 hover:bg-slate-50"
                        >
                          장비 / 차량관리 상세
                        </button>
                      </td>
                    </tr>
                  ))}
                  {equipmentList.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-[11px] text-slate-400"
                      >
                        등록된 장비가 없습니다. &quot;장비 / 차량 등록&quot;
                        버튼을 눌러 등록하세요.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-dashed border-table-border px-4 py-3 text-[11px] text-slate-500">
            * 근무자와 장비 정보를 연동하면, 야드 화면에서 각 핀을 클릭했을
            때 해당 근무자의 상세 정보 및 장비 가동 이력을 바로 확인할 수
            있습니다.
          </div>
        </div>
      </div>

      {/* 근무자 정보 보기 모달 (PDF 26페이지 느낌) */}
      {selectedWorker && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-table-border overflow-hidden">
            <div className="h-10 px-4 flex items-center justify-between border-b border-table-border bg-slate-50">
              <span className="text-sm font-semibold text-slate-800">
                근무자 정보
              </span>
              <button
                className="text-[11px] text-slate-500 hover:text-slate-700"
                onClick={() => setSelectedWorker(null)}
              >
                닫기
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-lg font-semibold text-slate-700">
                  {selectedWorker.name.charAt(0)}
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold text-slate-900">
                    {selectedWorker.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {selectedWorker.role}
                  </div>
                </div>
              </div>

              <div className="space-y-1 border-t border-b border-table-border py-3 text-[11px]">
                <InfoRow
                  label="소속"
                  value={selectedWorker.company ?? "(주)파인드이알"}
                />
                <InfoRow label="근무 구역" value={selectedWorker.zone} />
                <InfoRow label="연락처" value={selectedWorker.phone} />
                <InfoRow
                  label="이메일"
                  value={selectedWorker.email ?? "-"}
                />
                <InfoRow
                  label="근무 상태"
                  value={<WorkerStatusBadge status={selectedWorker.status} />}
                />
                <InfoRow
                  label="입사일"
                  value={selectedWorker.hireDate ?? "-"}
                />
                <InfoRow
                  label="최근 위치 업데이트"
                  value={selectedWorker.lastUpdate}
                />
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  className="px-10 py-2.5 rounded-full bg-sidebar-bg hover:bg-sidebar-hover text-white text-xs font-semibold"
                  onClick={() => setSelectedWorker(null)}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 장비 / 차량관리 상세 모달 (PDF 27~28) */}
      {equipmentModalOpen && equipmentDraft && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-table-border overflow-hidden">
            {/* 헤더 */}
            <div className="h-10 px-5 flex items-center justify-between border-b border-table-border bg-slate-50">
              <span className="text-sm font-semibold text-slate-800">
                {equipmentModalMode === "create"
                  ? "장비 / 차량 등록"
                  : "장비 / 차량관리 상세"}
              </span>
              <button
                className="text-[11px] text-slate-500 hover:text-slate-700"
                onClick={closeEquipmentModal}
              >
                닫기
              </button>
            </div>

            {/* 본문 */}
            <div className="p-5 space-y-5 text-xs">
              {/* 상단 이미지 */}
              <div className="bg-slate-50 rounded-xl border border-table-border flex flex-col items-center justify-center py-6">
                {equipmentDraft.imageUrl ? (
                  <img
                    src={equipmentDraft.imageUrl}
                    alt={equipmentDraft.name}
                    className="w-full max-w-md h-48 object-cover rounded-lg border border-table-border/70"
                  />
                ) : (
                  <div className="w-full max-w-md h-48 rounded-lg border border-dashed border-table-border flex items-center justify-center text-[11px] text-slate-400 bg-white">
                    장비 / 차량 이미지 미리보기 영역
                    <br />
                    (이미지 파일을 첨부하면 여기에서 바로 확인할 수 있습니다.)
                  </div>
                )}
              </div>

              {/* 기본 정보 폼 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldWithLabel
                    label="장비명"
                    editable={equipmentModalMode !== "view"}
                    value={equipmentDraft.name}
                    onChange={(v) =>
                      handleEquipmentFieldChange("name", v)
                    }
                  />
                  <FieldWithLabel
                    label="유형"
                    editable={equipmentModalMode !== "view"}
                    value={equipmentDraft.type}
                    onChange={(v) =>
                      handleEquipmentFieldChange("type", v)
                    }
                    placeholder="예: 지게차, 리치스태커, 트레일러"
                  />
                  <FieldWithLabel
                    label="차량 번호 / 식별번호"
                    editable={equipmentModalMode !== "view"}
                    value={equipmentDraft.plateNo ?? ""}
                    onChange={(v) =>
                      handleEquipmentFieldChange("plateNo", v)
                    }
                  />
                  <FieldWithLabel
                    label="담당자"
                    editable={equipmentModalMode !== "view"}
                    value={equipmentDraft.manager ?? ""}
                    onChange={(v) =>
                      handleEquipmentFieldChange("manager", v)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <FieldWithLabel
                    label="현재 위치"
                    editable={equipmentModalMode !== "view"}
                    value={equipmentDraft.zone}
                    onChange={(v) =>
                      handleEquipmentFieldChange("zone", v)
                    }
                    placeholder="예: A구역 D-2"
                  />

                  {/* 상태 */}
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-500">
                      상태
                    </div>
                    {equipmentModalMode === "view" ? (
                      <EquipStatusBadge status={equipmentDraft.status} />
                    ) : (
                      <select
                        className="w-full h-8 rounded-lg border border-table-border bg-white px-2 text-[11px] outline-none focus:ring-1 focus:ring-sky-500"
                        value={equipmentDraft.status}
                        onChange={(e) =>
                          handleEquipmentFieldChange(
                            "status",
                            e.target.value as EquipStatus
                          )
                        }
                      >
                        <option value="가동">가동</option>
                        <option value="대기">대기</option>
                        <option value="점검">점검</option>
                      </select>
                    )}
                  </div>

                  <FieldWithLabel
                    label="최근 작업 내용"
                    editable={equipmentModalMode !== "view"}
                    value={equipmentDraft.lastWork}
                    onChange={(v) =>
                      handleEquipmentFieldChange("lastWork", v)
                    }
                  />

                  {/* 이미지 업로드 */}
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-500">
                      이미지 파일 첨부
                    </div>
                    {equipmentModalMode === "view" ? (
                      <div className="text-[11px] text-slate-600">
                        {equipmentDraft.imageUrl
                          ? "이미지 등록 완료"
                          : "등록된 이미지가 없습니다."}
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEquipmentImageChange}
                        className="w-full text-[11px] text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border file:border-table-border file:bg-slate-50 file:text-[11px] file:text-slate-700"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* 메모 */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500">
                  비고 / 메모
                </div>
                {equipmentModalMode === "view" ? (
                  <div className="min-h-[60px] rounded-lg border border-table-border bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
                    {equipmentDraft.memo && equipmentDraft.memo.trim()
                      ? equipmentDraft.memo
                      : "등록된 메모가 없습니다."}
                  </div>
                ) : (
                  <textarea
                    className="w-full min-h-[60px] rounded-lg border border-table-border bg-white px-3 py-2 text-[11px] text-slate-700 outline-none focus:ring-1 focus:ring-sky-500"
                    value={equipmentDraft.memo ?? ""}
                    onChange={(e) =>
                      handleEquipmentFieldChange("memo", e.target.value)
                    }
                  />
                )}
              </div>

              {/* 버튼 영역 */}
              <div className="pt-2 flex justify-center gap-3">
                {equipmentModalMode === "view" ? (
                  <>
                    <button
                      type="button"
                      className="px-10 py-2.5 rounded-full bg-sidebar-bg hover:bg-sidebar-hover text-white text-xs font-semibold"
                      onClick={() =>
                        setEquipmentModalMode("edit")
                      }
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="px-8 py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                      onClick={closeEquipmentModal}
                    >
                      닫기
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="px-8 py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                      onClick={cancelEquipmentEdit}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      className="px-10 py-2.5 rounded-full bg-sidebar-bg hover:bg-sidebar-hover text-white text-xs font-semibold"
                      onClick={saveEquipment}
                    >
                      {equipmentModalMode === "create" ? "등록" : "저장"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───── 서브 컴포넌트들 ───── */

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
    <div className="bg-white rounded-xl shadow-sm border border-table-border px-5 py-4">
      <div className="text-[11px] text-slate-500 mb-1">{label}</div>
      <div
        className={[
          "text-xl font-semibold text-slate-900",
          highlight ?? "",
        ].join(" ")}
      >
        {value}
      </div>
      <div className="mt-2 text-[11px] text-slate-500">{description}</div>
    </div>
  );
}

function WorkerStatusBadge({ status }: { status: WorkerStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-[2px] text-[10px]";
  if (status === "근무중")
    return (
      <span className={`${base} bg-emerald-100 text-emerald-700`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
        근무중
      </span>
    );
  if (status === "대기")
    return (
      <span className={`${base} bg-sky-100 text-sky-700`}>
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1" />
        대기
      </span>
    );
  return (
    <span className={`${base} bg-amber-100 text-amber-700`}>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />
      휴식
    </span>
  );
}

function EquipStatusBadge({ status }: { status: EquipStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-[2px] text-[10px]";
  if (status === "가동")
    return (
      <span className={`${base} bg-emerald-100 text-emerald-700`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
        가동
      </span>
    );
  if (status === "대기")
    return (
      <span className={`${base} bg-slate-100 text-slate-700`}>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-1" />
        대기
      </span>
    );
  return (
    <span className={`${base} bg-amber-100 text-amber-700`}>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />
      점검
    </span>
  );
}

function EquipLegend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-slate-600">{label}</span>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 text-right">
        {typeof value === "string" ? value : value}
      </span>
    </div>
  );
}

function FieldWithLabel({
  label,
  value,
  editable,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] text-slate-500">{label}</div>
      {editable ? (
        <input
          className="w-full h-8 rounded-lg border border-table-border bg-white px-3 text-[11px] text-slate-700 outline-none focus:ring-1 focus:ring-sky-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <div className="h-8 rounded-lg border border-table-border bg-slate-50 px-3 flex items-center text-[11px] text-slate-800">
          {value && value.trim() ? value : "-"}
        </div>
      )}
    </div>
  );
}
