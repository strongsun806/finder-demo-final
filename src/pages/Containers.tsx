// src/pages/Containers.tsx
import React, { useState, useMemo, ChangeEvent } from "react";
import {
  useMainStore,
  ContainerItem,
  ContainerStatus,
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from "../store/mainstore";

/* ───── 야드 위험도 타입 & 계산 함수 (Yard와 동일 로직) ───── */

type YardRiskLevel = "LOW" | "MEDIUM" | "HIGH";

type YardRisk = {
  score: number;
  level: YardRiskLevel;
  incidentCount: number;
};

function computeYardRiskMap(
  incidents: Incident[]
): Map<string, YardRisk> {
  const map = new Map<string, YardRisk>();
  const now = Date.now();

  const severityScore: Record<IncidentSeverity, number> = {
    경미: 20,
    보통: 40,
    중대: 70,
  };

  const statusWeight: Record<IncidentStatus, number> = {
    진행중: 1.2,
    조치완료: 0.6,
  };

  for (const inc of incidents) {
    const loc = (inc.location || "기타").trim();
    const areaKey =
      loc.length > 0 ? loc.charAt(0).toUpperCase() : "기타";

    const base = severityScore[inc.severity] ?? 30;
    const weight = statusWeight[inc.status] ?? 1.0;

    let timeDecay = 1.0;
    if (inc.time) {
      const parsed = Date.parse(inc.time);
      if (!Number.isNaN(parsed)) {
        const hours = (now - parsed) / 36e5;
        if (hours > 24 && hours <= 72) timeDecay = 0.8;
        else if (hours > 72 && hours <= 168) timeDecay = 0.6;
        else if (hours > 168) timeDecay = 0.4;
      }
    }

    const addScore = base * weight * timeDecay;

    const prev = map.get(areaKey);
    const prevScore = prev?.score ?? 0;
    const prevCount = prev?.incidentCount ?? 0;

    const newScore = Math.min(100, prevScore + addScore);

    let level: YardRiskLevel;
    if (newScore >= 70) level = "HIGH";
    else if (newScore >= 40) level = "MEDIUM";
    else level = "LOW";

    map.set(areaKey, {
      score: newScore,
      level,
      incidentCount: prevCount + 1,
    });
  }

  return map;
}

/* ───── 필터 상태 타입 ───── */

interface FilterState {
  area: string;
  year: string;
  name: string;
  id: string;
}

const initialFilter: FilterState = {
  area: "",
  year: "",
  name: "",
  id: "",
};

export default function ContainersPage() {
  // ✅ 컨테이너 & 사고는 zustand store에서 가져옴
  const containers = useMainStore((s) => s.containers);
  const addContainer = useMainStore((s) => s.addContainer);
  const incidents = useMainStore((s) => s.incidents);

  const [filters, setFilters] =
    useState<FilterState>(initialFilter);

  const [detailTarget, setDetailTarget] =
    useState<ContainerItem | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<ContainerItem>({
    id: 0,
    area: "",
    lane: "",
    year: "",
    name: "",
    line: "",
    nation: "",
    type: "",
    quantity: 0,
    regDate: "",
    departDate: "",
    bldo: "",
    status: "입고",
    imageUrl: null,
  });

  // 🔍 컨테이너 조회 필터
  const filteredContainers = containers.filter((c) => {
    if (filters.area && !c.area.includes(filters.area)) return false;
    if (filters.year && !c.year.includes(filters.year)) return false;
    if (filters.name && !c.name.includes(filters.name)) return false;
    if (filters.id && !c.lane.includes(filters.id)) return false;
    return true;
  });

  const handleFilterChange = (
    field: keyof FilterState,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => setFilters(initialFilter);

  // 🔍 incidents → 구역별 위험도 분석 (ETA 계산에 활용)
  const yardRiskMap = useMemo(
    () => computeYardRiskMap(incidents),
    [incidents]
  );

  /* ─── 등록 모달: 입력 핸들러 ─── */

  const handleDraftChange = (
    field: keyof ContainerItem,
    value: string
  ) => {
    setCreateDraft((prev) => ({
      ...prev,
      [field]:
        field === "quantity" ? Number(value || 0) : value,
    }));
  };

  const handleDraftImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCreateDraft((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleSubmitCreate = () => {
    if (!createDraft.area.trim()) {
      alert("구역을 입력해 주세요.");
      return;
    }
    if (!createDraft.lane.trim()) {
      alert("경도/라인 코드를 입력해 주세요.");
      return;
    }
    if (!createDraft.name.trim()) {
      alert("컨테이너명을 입력해 주세요.");
      return;
    }

    const nextId =
      containers.reduce(
        (max, c) => (c.id > max ? c.id : max),
        0
      ) + 1;

    const newItem: ContainerItem = {
      ...createDraft,
      id: nextId,
      year:
        createDraft.year ||
        new Date().getFullYear().toString(),
    };

    addContainer(newItem);

    setCreateOpen(false);
    setCreateDraft({
      id: 0,
      area: "",
      lane: "",
      year: "",
      name: "",
      line: "",
      nation: "",
      type: "",
      quantity: 0,
      regDate: "",
      departDate: "",
      bldo: "",
      status: "입고",
      imageUrl: null,
    });

    alert("컨테이너가 등록되었습니다.");
  };

  // 📌 컨테이너별 ETA (알고리즘) 계산
  const getEtaForContainer = (c: ContainerItem) => {
    const baseMinutes = 40; // 기본 처리 시간
    const statusExtra: Record<ContainerStatus, number> = {
      입고: 10,
      반출대기: 20,
      반출완료: 0,
    };

    const risk = yardRiskMap.get(
      (c.area || "").trim().charAt(0).toUpperCase() ||
        "기타"
    );

    let riskDelay = 5;
    let riskLabel = "위험도 정보 없음";

    if (risk) {
      if (risk.level === "HIGH") riskDelay = 20;
      else if (risk.level === "MEDIUM") riskDelay = 10;
      else riskDelay = 0;

      riskLabel = `구역 ${c.area} · ${risk.level} (${Math.round(
        risk.score
      )}점)`;
    }

    const statusDelay = statusExtra[c.status] ?? 0;

    const totalMin = baseMinutes + statusDelay + riskDelay;

    const etaDate = new Date(
      Date.now() + totalMin * 60 * 1000
    );
    const etaLabel = etaDate
      .toTimeString()
      .slice(0, 5); // HH:MM

    return {
      etaLabel,
      explanation: `${riskLabel} · 상태: ${
        c.status
      } · 총 ${totalMin}분 기준`,
    };
  };

  return (
    <div className="space-y-6">
      {/* 제목 + 이미지 */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          컨테이너 현황
        </h1>

        {/* 컨테이너 현황 이미지 (그대로 유지) */}
        <div className="mt-3">
          <img
            src="/images/containers.png"
            alt="컨테이너 현황"
            className="w-full max-w-4xl mx-auto rounded-xl border border-slate-200 shadow-sm"
          />
        </div>

        <p className="text-xs text-slate-500 mt-2">
          경도 / 등록연도 / 컨테이너명을 기준으로 컨테이너 정보를
          조회합니다.
        </p>
      </div>

      {/* 필터 카드 */}
      <div className="bg-white rounded-xl shadow-sm border border-table-border overflow-hidden">
        <div className="h-10 px-4 flex items-center justify-between border-b border-table-border bg-slate-50">
          <div className="text-sm font-semibold text-slate-800">
            조회 조건
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-full text-[11px] bg-white border border-table-border text-slate-700 hover:bg-slate-50"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="px-3 py-1.5 rounded-full text-[11px] bg-sidebar-bg text-white hover:bg-sidebar-hover"
            >
              컨테이너 등록
            </button>
          </div>
        </div>

        <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px]">
          <div className="space-y-1">
            <div className="text-slate-500">경도</div>
            <input
              value={filters.area}
              onChange={(e) =>
                handleFilterChange("area", e.target.value)
              }
              placeholder="예: A"
              className="w-full h-8 rounded-lg border border-table-border bg-white px-3 text-[11px] outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-1">
            <div className="text-slate-500">등록연도</div>
            <input
              value={filters.year}
              onChange={(e) =>
                handleFilterChange("year", e.target.value)
              }
              placeholder="예: 2023"
              className="w-full h-8 rounded-lg border border-table-border bg-white px-3 text-[11px] outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-1">
            <div className="text-slate-500">컨테이너명</div>
            <input
              value={filters.name}
              onChange={(e) =>
                handleFilterChange("name", e.target.value)
              }
              placeholder="예: CT_001"
              className="w-full h-8 rounded-lg border border-table-border bg-white px-3 text-[11px] outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-1">
            <div className="text-slate-500">컨테이너ID</div>
            <input
              value={filters.id}
              onChange={(e) =>
                handleFilterChange("id", e.target.value)
              }
              placeholder="예: A-001"
              className="w-full h-8 rounded-lg border border-table-border bg-white px-3 text-[11px] outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* 테이블 카드 */}
      <div className="bg-white rounded-xl shadow-sm border border-table-border overflow-hidden">
        <div className="h-10 px-4 flex items-center justify-between border-b border-table-border bg-slate-50">
          <span className="text-sm font-semibold text-slate-800">
            컨테이너 목록
          </span>
          <span className="text-[11px] text-slate-500">
            조회 조건에 해당하는 컨테이너 리스트입니다.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="h-9 bg-slate-50 text-[11px] text-slate-500 border-b border-table-border">
                <th className="px-3 text-left font-medium">구역</th>
                <th className="px-3 text-left font-medium">경도</th>
                <th className="px-3 text-left font-medium">
                  등록연도
                </th>
                <th className="px-3 text-left font-medium">
                  컨테이너명
                </th>
                <th className="px-3 text-left font-medium">
                  선박/대리점
                </th>
                <th className="px-3 text-left font-medium">
                  선박국적
                </th>
                <th className="px-3 text-left font-medium">
                  선박종류
                </th>
                <th className="px-3 text-right font-medium">
                  국제통운수
                </th>
                <th className="px-3 text-left font-medium">
                  등록일
                </th>
                <th className="px-3 text-left font-medium">
                  출항일(출항시간)
                </th>
                <th className="px-3 text-left font-medium">
                  예상 처리 완료시간(알고리즘)
                </th>
                <th className="px-3 text-left font-medium">
                  B/L / D/O
                </th>
                <th className="px-3 text-left font-medium">
                  상태
                </th>
                <th className="px-3 text-left font-medium">
                  컨테이너 이미지
                </th>
                <th className="px-3 text-left font-medium">
                  상세
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredContainers.map((c, idx) => {
                const { etaLabel, explanation } =
                  getEtaForContainer(c);

                return (
                  <tr
                    key={c.id}
                    className={[
                      "h-9 border-b border-table-border/70 text-[11px]",
                      idx % 2 === 0
                        ? "bg-white"
                        : "bg-slate-50/40",
                    ].join(" ")}
                  >
                    <td className="px-3 text-slate-800">
                      {c.area}
                    </td>
                    <td className="px-3 text-slate-800">
                      {c.lane}
                    </td>
                    <td className="px-3 text-slate-800">
                      {c.year}
                    </td>
                    <td className="px-3 text-slate-800">
                      {c.name}
                    </td>
                    <td className="px-3 text-slate-700">
                      {c.line}
                    </td>
                    <td className="px-3 text-slate-700">
                      {c.nation}
                    </td>
                    <td className="px-3 text-slate-700">
                      {c.type}
                    </td>
                    <td className="px-3 text-right text-slate-700">
                      {c.quantity.toLocaleString()}
                    </td>
                    <td className="px-3 text-slate-600">
                      {c.regDate}
                    </td>
                    <td className="px-3 text-slate-600">
                      {c.departDate}
                    </td>
                    <td className="px-3 text-slate-700">
                      <div>{etaLabel}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {explanation}
                      </div>
                    </td>
                    <td className="px-3 text-slate-700">
                      {c.bldo}
                    </td>
                    <td className="px-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-3">
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt={c.name}
                          className="w-10 h-6 rounded object-cover border border-table-border/70"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          없음
                        </span>
                      )}
                    </td>
                    <td className="px-3">
                      <button
                        type="button"
                        onClick={() => setDetailTarget(c)}
                        className="px-3 py-[5px] rounded-full text-[11px] bg-white border border-table-border text-slate-700 hover:bg-slate-50"
                      >
                        보기
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredContainers.length === 0 && (
                <tr>
                  <td
                    colSpan={15}
                    className="px-4 py-6 text-center text-[11px] text-slate-400"
                  >
                    조회 조건에 해당하는 컨테이너가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세 모달 */}
      {detailTarget && (
        <ContainerDetailModal
          item={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {/* 등록 모달 */}
      {createOpen && (
        <ContainerCreateModal
          draft={createDraft}
          onChangeField={handleDraftChange}
          onChangeImage={handleDraftImage}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleSubmitCreate}
        />
      )}
    </div>
  );
}

/* ───── 서브 컴포넌트들 ───── */

function StatusBadge({ status }: { status: ContainerStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-[2px] text-[10px]";
  if (status === "입고") {
    return (
      <span className={`${base} bg-sky-50 text-sky-700`}>
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1" />
        입고
      </span>
    );
  }
  if (status === "반출대기") {
    return (
      <span className={`${base} bg-amber-50 text-amber-700`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />
        반출대기
      </span>
    );
  }
  return (
    <span className={`${base} bg-emerald-50 text-emerald-700`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
      반출완료
    </span>
  );
}

/* ─── 상세 모달 (PDF 컨테이너 상세 느낌) ─── */

function ContainerDetailModal({
  item,
  onClose,
}: {
  item: ContainerItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-table-border overflow-hidden">
        <div className="h-10 px-5 flex items-center justify-between border-b border-table-border bg-slate-50">
          <span className="text-sm font-semibold text-slate-800">
            컨테이너 상세 정보
          </span>
          <button
            className="text-[11px] text-slate-500 hover:text-slate-700"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* 상단 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailField label="구역" value={item.area} />
            <DetailField label="경도" value={item.lane} />
            <DetailField label="컨테이너명" value={item.name} />
            <DetailField label="등록연도" value={item.year} />
            <DetailField label="선박/대리점" value={item.line} />
            <DetailField label="선박국적" value={item.nation} />
            <DetailField label="선박종류" value={item.type} />
            <DetailField
              label="국제통운수"
              value={item.quantity.toLocaleString()}
            />
            <DetailField label="등록일" value={item.regDate} />
            <DetailField
              label="출항일(출항시간)"
              value={item.departDate}
            />
            <DetailField label="B/L / D/O" value={item.bldo} />
            <DetailField
              label="상태"
              value={<StatusBadge status={item.status} />}
            />
          </div>

          {/* 이미지 영역 */}
          <div className="space-y-1">
            <div className="text-[11px] text-slate-500">
              컨테이너 이미지
            </div>
            <div className="rounded-xl border border-table-border bg-slate-50 px-4 py-4 flex items-center justify-center min-h-[160px]">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full max-w-md h-40 object-cover rounded-lg border border-table-border/70"
                />
              ) : (
                <div className="text-[11px] text-slate-400 text-center">
                  등록된 컨테이너 이미지가 없습니다.
                  <br />
                  (등록 화면에서 이미지를 첨부하면 이 영역에
                  표시됩니다.)
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              className="px-10 py-2.5 rounded-full bg-sidebar-bg hover:bg-sidebar-hover text-white text-xs font-semibold"
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

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="h-8 rounded-lg border border-table-border bg-slate-50 px-3 flex items-center text-[11px] text-slate-800">
        {value}
      </div>
    </div>
  );
}

/* ─── 등록 모달 ─── */

function ContainerCreateModal({
  draft,
  onChangeField,
  onChangeImage,
  onClose,
  onSubmit,
}: {
  draft: ContainerItem;
  onChangeField: (
    field: keyof ContainerItem,
    value: string
  ) => void;
  onChangeImage: (e: ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-table-border overflow-hidden">
        <div className="h-10 px-5 flex items-center justify-between border-b border-table-border bg-slate-50">
          <span className="text-sm font-semibold text-slate-800">
            컨테이너 등록
          </span>
          <button
            className="text-[11px] text-slate-500 hover:text-slate-700"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* 상단 2열 폼 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="구역 *"
              placeholder="예: A"
              value={draft.area}
              onChange={(v) => onChangeField("area", v)}
            />
            <InputField
              label="경도 *"
              placeholder="예: A-001"
              value={draft.lane}
              onChange={(v) => onChangeField("lane", v)}
            />
            <InputField
              label="컨테이너명 *"
              placeholder="예: CT_001"
              value={draft.name}
              onChange={(v) => onChangeField("name", v)}
            />
            <InputField
              label="등록연도"
              placeholder="예: 2023"
              value={draft.year}
              onChange={(v) => onChangeField("year", v)}
            />
            <InputField
              label="선박/대리점"
              placeholder="예: 코드해운"
              value={draft.line}
              onChange={(v) => onChangeField("line", v)}
            />
            <InputField
              label="선박국적"
              placeholder="예: 중국"
              value={draft.nation}
              onChange={(v) => onChangeField("nation", v)}
            />
            <InputField
              label="선박종류"
              placeholder="예: 컨테이너선"
              value={draft.type}
              onChange={(v) => onChangeField("type", v)}
            />
            <InputField
              label="국제통운수"
              placeholder="예: 10000"
              value={
                draft.quantity ? draft.quantity.toString() : ""
              }
              onChange={(v) => onChangeField("quantity", v)}
            />
            <InputField
              label="등록일"
              placeholder="예: 2023-10-01"
              value={draft.regDate}
              onChange={(v) => onChangeField("regDate", v)}
            />
            <InputField
              label="출항일(출항시간)"
              placeholder="예: 2023-10-31 (13:45)"
              value={draft.departDate}
              onChange={(v) => onChangeField("departDate", v)}
            />
            <InputField
              label="B/L / D/O"
              placeholder="예: BL12345"
              value={draft.bldo}
              onChange={(v) => onChangeField("bldo", v)}
            />

            {/* 상태 셀렉트 */}
            <div className="space-y-1">
              <div className="text-[11px] text-slate-500">
                상태
              </div>
              <select
                className="w-full h-8 rounded-lg border border-table-border bg-white px-3 text-[11px] text-slate-700 outline-none focus:ring-1 focus:ring-sky-500"
                value={draft.status}
                onChange={(e) =>
                  onChangeField(
                    "status",
                    e.target.value as ContainerStatus
                  )
                }
              >
                <option value="입고">입고</option>
                <option value="반출대기">반출대기</option>
                <option value="반출완료">반출완료</option>
              </select>
            </div>
          </div>

          {/* 이미지 업로드 & 미리보기 */}
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr,1.8fr] gap-4">
            <div className="space-y-1">
              <div className="text-[11px] text-slate-500">
                컨테이너 이미지
              </div>
              <label className="inline-flex items-center px-3 py-1.5 rounded-full border border-table-border bg-white text-[11px] text-slate-700 cursor-pointer hover:bg-slate-50">
                이미지 파일 찾기
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onChangeImage}
                />
              </label>
              <div className="text-[11px] text-slate-500 mt-1">
                {draft.imageUrl
                  ? "이미지가 선택되었습니다."
                  : "선택된 파일 없음"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] text-slate-500">
                이미지 미리보기
              </div>
              <div className="rounded-xl border border-table-border bg-slate-50 px-4 py-4 flex items-center justify-center min-h-[140px]">
                {draft.imageUrl ? (
                  <img
                    src={draft.imageUrl}
                    alt={draft.name || "preview"}
                    className="w-full max-w-md h-32 object-cover rounded-lg border border-table-border/70"
                  />
                ) : (
                  <div className="text-[11px] text-slate-400 text-center">
                    이미지 파일을 선택하면 이 영역에서
                    미리보기로 표시됩니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              className="px-8 py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="button"
              className="px-10 py-2.5 rounded-full bg-sidebar-bg hover:bg-sidebar-hover text-white text-xs font-semibold"
              onClick={onSubmit}
            >
              등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] text-slate-500">{label}</div>
      <input
        className="w-full h-8 rounded-lg border border-table-border bg-white px-3 text-[11px] text-slate-700 outline-none focus:ring-1 focus:ring-sky-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}