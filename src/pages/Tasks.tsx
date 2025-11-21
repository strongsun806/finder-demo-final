import React, { useState, ChangeEvent } from "react";

type TaskTab = "ongoing" | "completed" | "assign";
type CompletedRange = "daily" | "weekly" | "monthly";

interface Task {
  id: number;
  title: string;
  dateTime: string;
  worker: string;
  status: "진행중" | "완료";
  area: string;
  description: string;
}

interface TimelineItem {
  time: string;
  text: string;
}

interface Worker {
  id: number;
  name: string;
  role: string;
  distanceKm: number;
  status: "근무중" | "근무 대기중";
  zone: string;
}

interface AssignmentForm {
  workerId: number | null;
  content: string;
  fileName: string | null;
}

const ongoingTasksSample: Task[] = [
  {
    id: 1,
    title: "E구역 컨테이너 하차",
    dateTime: "2023-10-10 (14:00)",
    worker: "김길동",
    status: "진행중",
    area: "E구역 B-1",
    description: "E구역 B-1 위치에서 컨테이너 하차 작업 진행 중",
  },
  {
    id: 2,
    title: "D구역 컨테이너 하차",
    dateTime: "2023-10-10 (14:00)",
    worker: "고길동",
    status: "진행중",
    area: "D구역 C-3",
    description: "D구역 C-3 위치에서 컨테이너 하차 작업 진행 중",
  },
];

const completedTasksSample: Task[] = [
  {
    id: 3,
    title: "E구역 컨테이너 하차",
    dateTime: "2023-10-10 (14:00)",
    worker: "김길동",
    status: "완료",
    area: "E구역 B-1",
    description: "E구역 컨테이너 하차 작업 완료",
  },
  {
    id: 4,
    title: "D구역 컨테이너 하차",
    dateTime: "2023-10-10 (14:00)",
    worker: "고길동",
    status: "완료",
    area: "D구역 C-3",
    description: "D구역 컨테이너 하차 작업 완료",
  },
];

const sampleTimeline: TimelineItem[] = [
  { time: "14:00", text: "업무하달 (A구역 컨테이너 하차)" },
  { time: "14:05", text: "김길동 근무자에게 업무전달" },
  { time: "14:25", text: "업무 승인요청" },
  { time: "14:30", text: "업무 승인" },
  { time: "15:10", text: "김길동 근무자 업무 시작" },
  { time: "15:50", text: "A구역 컨테이너 하차 중" },
  { time: "16:30", text: "업무 진행" },
  { time: "17:00", text: "업무 진행" },
  { time: "17:55", text: "업무 종료" },
];

const workersSample: Worker[] = [
  {
    id: 1,
    name: "김길동",
    role: "셔틀 / 야드운전수",
    distanceKm: 2,
    status: "근무중",
    zone: "A구역 D-2",
  },
  {
    id: 2,
    name: "박근수",
    role: "대리 / 현장관리자",
    distanceKm: 3,
    status: "근무 대기중",
    zone: "B구역 B-1",
  },
];

export default function TasksPage() {
  const [tab, setTab] = useState<TaskTab>("ongoing");

  // 진행중 업무 상세 모달
  const [selectedOngoingTask, setSelectedOngoingTask] =
    useState<Task | null>(null);

  // 완료 업무 범위 (일일/주간/월간)
  const [completedRange, setCompletedRange] =
    useState<CompletedRange>("daily");
  const [selectedCompletedTaskId, setSelectedCompletedTaskId] =
    useState<number | null>(null);

  // 업무하달
  const [assignmentForm, setAssignmentForm] =
    useState<AssignmentForm>({
      workerId: workersSample[0]?.id ?? null,
      content: "",
      fileName: null,
    });

  const [assignHistory, setAssignHistory] = useState<
    { id: number; workerName: string; content: string; time: string }[]
  >([]);

  /* ─── 완료 업무 필터 (범위에 따라 보여주는 것처럼 보이기만) ─── */
  const filteredCompletedTasks = completedTasksSample.filter((t) => {
    if (completedRange === "daily") return true; // 오늘 기준 전부
    if (completedRange === "weekly") {
      // 샘플이라 그냥 첫 번째만 남기는 식으로 가짜 필터
      return t.id === completedTasksSample[0].id;
    }
    // monthly: 두 번째만 남기는 식의 가짜 필터
    return t.id === completedTasksSample[1].id;
  });

  const selectedCompletedTask =
    filteredCompletedTasks.find(
      (t) => t.id === selectedCompletedTaskId
    ) ?? filteredCompletedTasks[0] ?? null;

  /* ─── 업무하달 핸들러 ─── */

  const handleSelectWorkerForAssign = (id: number) => {
    setAssignmentForm((prev) => ({ ...prev, workerId: id }));
  };

  const handleAssignmentContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setAssignmentForm((prev) => ({
      ...prev,
      content: e.target.value,
    }));
  };

  const handleAssignmentFileChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    setAssignmentForm((prev) => ({
      ...prev,
      fileName: file ? file.name : null,
    }));
  };

  const handleSubmitAssignment = () => {
    if (!assignmentForm.workerId) {
      alert("업무를 하달할 근무자를 선택해 주세요.");
      return;
    }
    if (!assignmentForm.content.trim()) {
      alert("업무 내용을 입력해 주세요.");
      return;
    }

    const worker = workersSample.find(
      (w) => w.id === assignmentForm.workerId
    );
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    setAssignHistory((prev) => [
      {
        id: prev.length + 1,
        workerName: worker ? worker.name : "알수없음",
        content: assignmentForm.content.trim(),
        time: timeStr,
      },
      ...prev,
    ]);

    alert("업무 하달이 완료되었습니다. (데모: 로컬 상태에만 저장)");

    setAssignmentForm((prev) => ({
      ...prev,
      content: "",
      fileName: null,
    }));
  };

  return (
    <div className="space-y-6">
      {/* 제목 */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          업무 현황
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          진행 중인 업무, 완료된 업무 및 업무 하달 내역을 확인합니다.
        </p>
      </div>

      {/* 상단 탭: 진행중 / 완료업무 / 업무하달 */}
      <div className="flex gap-2 border-b border-table-border text-[13px]">
        <TopTabButton
          active={tab === "ongoing"}
          onClick={() => setTab("ongoing")}
        >
          진행 중
        </TopTabButton>
        <TopTabButton
          active={tab === "completed"}
          onClick={() => setTab("completed")}
        >
          완료업무
        </TopTabButton>
        <TopTabButton
          active={tab === "assign"}
          onClick={() => setTab("assign")}
        >
          업무하달
        </TopTabButton>
      </div>

      {tab === "ongoing" && (
        <OngoingSection
          tasks={ongoingTasksSample}
          onClickView={setSelectedOngoingTask}
        />
      )}

      {tab === "completed" && (
        <CompletedSection
          tasks={filteredCompletedTasks}
          completedRange={completedRange}
          onChangeRange={setCompletedRange}
          selectedTask={selectedCompletedTask}
          onSelectTask={setSelectedCompletedTaskId}
        />
      )}

      {tab === "assign" && (
        <AssignSection
          workers={workersSample}
          assignmentForm={assignmentForm}
          onSelectWorker={handleSelectWorkerForAssign}
          onChangeContent={handleAssignmentContentChange}
          onChangeFile={handleAssignmentFileChange}
          onSubmit={handleSubmitAssignment}
          assignHistory={assignHistory}
        />
      )}

      {/* 진행중 업무 보기 모달 */}
      {selectedOngoingTask && (
        <OngoingDetailModal
          task={selectedOngoingTask}
          onClose={() => setSelectedOngoingTask(null)}
        />
      )}
    </div>
  );
}

/* ─── 상단 탭 버튼 ─── */

function TopTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-4 py-2 -mb-px border-b-2 text-sm",
        active
          ? "border-sidebar-bg text-slate-900 font-semibold"
          : "border-transparent text-slate-500 hover:text-slate-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ─── 진행중 업무 섹션 ─── */

function OngoingSection({
  tasks,
  onClickView,
}: {
  tasks: Task[];
  onClickView: (task: Task) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-table-border overflow-hidden">
      <div className="h-10 px-4 flex items-center justify-between border-b border-table-border bg-slate-50">
        <span className="text-sm font-semibold text-slate-800">
          진행 중 업무
        </span>
        <span className="text-[11px] text-slate-500">
          진행 중인 업무, 완료된 업무 및 업무 하달 내역을 확인합니다.
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="h-9 bg-slate-50 text-[11px] text-slate-500 border-b border-table-border">
              <th className="px-4 text-left font-medium">
                업무유형(이미지)
              </th>
              <th className="px-2 text-left font-medium">날짜/시간</th>
              <th className="px-2 text-left font-medium">업무내용</th>
              <th className="px-2 text-left font-medium">담당자</th>
              <th className="px-2 text-left font-medium">진행상황</th>
              <th className="px-2 text-left font-medium">상세</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t, idx) => (
              <tr
                key={t.id}
                className={[
                  "h-9 border-b border-table-border/70 text-[11px]",
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                ].join(" ")}
              >
                <td className="px-4 text-slate-700">하차</td>
                <td className="px-2 text-slate-700">{t.dateTime}</td>
                <td className="px-2 text-slate-700">{t.title}</td>
                <td className="px-2 text-slate-700">{t.worker}</td>
                <td className="px-2 text-slate-700">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-[2px] text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                    업무 진행중
                  </span>
                </td>
                <td className="px-2">
                  <button
                    type="button"
                    onClick={() => onClickView(t)}
                    className="px-3 py-[5px] rounded-full text-[11px] bg-white border border-table-border text-slate-700 hover:bg-slate-50"
                  >
                    보기
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-[11px] text-slate-400"
                >
                  진행 중인 업무가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function OngoingDetailModal({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-table-border overflow-hidden">
        {/* 헤더 */}
        <div className="h-10 px-5 flex items-center justify-between border-b border-table-border bg-slate-50">
          <span className="text-sm font-semibold text-slate-800">
            업무 상세
          </span>
          <button
            className="text-[11px] text-slate-500 hover:text-slate-700"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        {/* 본문 */}
        <div className="p-5 space-y-4 text-xs">
          {/* 상단 기본정보 */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <div className="text-[11px] text-slate-500">업무명</div>
              <div className="h-8 rounded-lg border border-table-border bg-slate-50 px-3 flex items-center text-[11px] text-slate-800">
                {task.title}
              </div>
            </div>
            <div className="w-full md:w-44 space-y-1">
              <div className="text-[11px] text-slate-500">담당자</div>
              <div className="h-8 rounded-lg border border-table-border bg-slate-50 px-3 flex items-center text-[11px] text-slate-800">
                {task.worker}
              </div>
            </div>
            <div className="w-full md:w-44 space-y-1">
              <div className="text-[11px] text-slate-500">날짜/시간</div>
              <div className="h-8 rounded-lg border border-table-border bg-slate-50 px-3 flex items-center text-[11px] text-slate-800">
                {task.dateTime}
              </div>
            </div>
          </div>

          {/* 타임라인 */}
          <div className="mt-2">
            <div className="text-[11px] text-slate-500 mb-2">
              업무 진행 내역
            </div>
            <div className="rounded-xl border border-table-border bg-slate-50 px-5 py-4">
              <ul className="space-y-2 text-[11px] text-slate-700">
                {sampleTimeline.map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="w-10 text-slate-500">
                      {item.time}
                    </span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 버튼 */}
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

/* ─── 완료업무 섹션 ─── */

function CompletedSection({
  tasks,
  completedRange,
  onChangeRange,
  selectedTask,
  onSelectTask,
}: {
  tasks: Task[];
  completedRange: CompletedRange;
  onChangeRange: (r: CompletedRange) => void;
  selectedTask: Task | null;
  onSelectTask: (id: number) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-table-border overflow-hidden">
      {/* 헤더 */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-table-border bg-slate-50">
        <span className="text-sm font-semibold text-slate-800">
          완료업무
        </span>
        <span className="text-[11px] text-slate-500">
          일일 / 주간 / 월간 기준으로 완료된 업무 내역을 조회합니다.
        </span>
      </div>

      {/* 상단 범위 토글 */}
      <div className="px-4 py-3 border-b border-table-border flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-slate-600">완료 업무 기준</span>
          <div className="flex rounded-full bg-slate-100 p-[2px]">
            <button
              type="button"
              onClick={() => onChangeRange("daily")}
              className={[
                "px-3 py-1 rounded-full transition",
                completedRange === "daily"
                  ? "bg-white text-slate-900 shadow-sm border border-table-border"
                  : "text-slate-500",
              ].join(" ")}
            >
              일일
            </button>
            <button
              type="button"
              onClick={() => onChangeRange("weekly")}
              className={[
                "px-3 py-1 rounded-full transition",
                completedRange === "weekly"
                  ? "bg-white text-slate-900 shadow-sm border border-table-border"
                  : "text-slate-500",
              ].join(" ")}
            >
              주간
            </button>
            <button
              type="button"
              onClick={() => onChangeRange("monthly")}
              className={[
                "px-3 py-1 rounded-full transition",
                completedRange === "monthly"
                  ? "bg-white text-slate-900 shadow-sm border border-table-border"
                  : "text-slate-500",
              ].join(" ")}
            >
              월간
            </button>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          {completedRange === "daily" && "10월 기준 완료 업무 내역"}
          {completedRange === "weekly" && "최근 1주일 완료 업무 내역 (데모)"}
          {completedRange === "monthly" &&
            "최근 1개월 완료 업무 내역 (데모)"}
        </div>
      </div>

      {/* 메인 그리드: 테이블 + 타임라인 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1.6fr] gap-0">
        {/* 왼쪽: 완료업무 테이블 */}
        <div className="border-r border-table-border overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="h-9 bg-slate-50 text-[11px] text-slate-500 border-b border-table-border">
                <th className="px-4 text-left font-medium">업무유형</th>
                <th className="px-2 text-left font-medium">날짜/시간</th>
                <th className="px-2 text-left font-medium">업무내용</th>
                <th className="px-2 text-left font-medium">담당자</th>
                <th className="px-2 text-left font-medium">
                  완료시간/상세보기
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, idx) => (
                <tr
                  key={t.id}
                  className={[
                    "h-9 border-b border-table-border/70 text-[11px] cursor-pointer",
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                    selectedTask?.id === t.id
                      ? "bg-sky-50"
                      : "",
                  ].join(" ")}
                  onClick={() => onSelectTask(t.id)}
                >
                  <td className="px-4 text-slate-700">하차</td>
                  <td className="px-2 text-slate-700">{t.dateTime}</td>
                  <td className="px-2 text-slate-700">{t.title}</td>
                  <td className="px-2 text-slate-700">{t.worker}</td>
                  <td className="px-2 text-slate-700">
                    <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-[2px] text-[10px]">
                      2023-10-30 (14:35) / 상세보기
                    </span>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-[11px] text-slate-400"
                  >
                    선택한 기간에 완료된 업무가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 오른쪽: 타임라인 박스 */}
        <div className="px-4 py-4">
          <div className="text-[11px] text-slate-500 mb-2">
            업무완료 내역 상세보기
          </div>
          <div className="rounded-xl border border-table-border bg-slate-50 px-5 py-4 min-h-[200px]">
            {selectedTask ? (
              <div className="space-y-3 text-[11px] text-slate-700">
                <div className="font-semibold text-slate-800">
                  {selectedTask.title} - 담당자 {selectedTask.worker}
                </div>
                <ul className="space-y-2">
                  {sampleTimeline.map((item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="w-10 text-slate-500">
                        {item.time}
                      </span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[11px] text-slate-400">
                왼쪽 목록에서 업무를 선택하면 상세 내역이 여기에
                표시됩니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 업무하달 섹션 ─── */

function AssignSection({
  workers,
  assignmentForm,
  onSelectWorker,
  onChangeContent,
  onChangeFile,
  onSubmit,
  assignHistory,
}: {
  workers: Worker[];
  assignmentForm: AssignmentForm;
  onSelectWorker: (id: number) => void;
  onChangeContent: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  onChangeFile: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  assignHistory: {
    id: number;
    workerName: string;
    content: string;
    time: string;
  }[];
}) {
  const selectedWorker = workers.find(
    (w) => w.id === assignmentForm.workerId
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1.6fr] gap-4">
      {/* 좌측: 근무자 검색/선택 */}
      <div className="bg-white rounded-xl shadow-sm border border-table-border overflow-hidden">
        <div className="h-10 px-4 flex items-center justify-between border-b border-table-border bg-slate-50">
          <span className="text-sm font-semibold text-slate-800">
            근무자 검색
          </span>
          <span className="text-[11px] text-slate-500">
            현재 위치 기준 거리순으로 근무자를 검색합니다.
          </span>
        </div>

        <div className="px-4 py-3 border-b border-table-border flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">정렬</span>
            <button
              type="button"
              className="px-3 py-1 rounded-full bg-sidebar-bg text-white text-[11px]"
            >
              거리순으로 정렬
            </button>
          </div>
          <div className="text-slate-500">
            위치 기준 A구역 D-2
          </div>
        </div>

        <div className="divide-y divide-table-border text-xs">
          {workers.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => onSelectWorker(w.id)}
              className={[
                "w-full px-4 py-3 flex items-center justify-between text-left",
                assignmentForm.workerId === w.id
                  ? "bg-sky-50"
                  : "bg-white hover:bg-slate-50",
              ].join(" ")}
            >
              <div>
                <div className="text-[12px] font-semibold text-slate-900">
                  {w.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {w.role}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] text-slate-600">
                  {w.zone}
                </span>
                <span className="text-[11px] text-slate-500">
                  {w.distanceKm}km
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-[2px] text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                  {w.status}
                </span>
              </div>
            </button>
          ))}
          {workers.length === 0 && (
            <div className="px-4 py-6 text-center text-[11px] text-slate-400">
              검색된 근무자가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 우측: 업무 정보 입력 + 하달 */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-table-border overflow-hidden">
          <div className="h-10 px-4 flex items-center justify-between border-b border-table-border bg-slate-50">
            <span className="text-sm font-semibold text-slate-800">
              업무 정보입력
            </span>
            <span className="text-[11px] text-slate-500">
              선택된 근무자에게 업무를 하달합니다.
            </span>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <div className="space-y-1">
              <div className="text-[11px] text-slate-500">
                업무내용 *
              </div>
              <textarea
                className="w-full min-h-[90px] rounded-lg border border-table-border bg-white px-3 py-2 text-[11px] text-slate-700 outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="예: A구역 0000 위치에서 CT_02 컨테이너 하차 후 B구역 000 위치로 이동"
                value={assignmentForm.content}
                onChange={onChangeContent}
              />
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-slate-500">이미지</div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center px-3 py-1.5 rounded-full border border-table-border bg-white text-[11px] text-slate-700 cursor-pointer hover:bg-slate-50">
                  파일 찾기
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onChangeFile}
                  />
                </label>
                <span className="text-[11px] text-slate-500">
                  {assignmentForm.fileName
                    ? assignmentForm.fileName
                    : "선택된 파일 없음"}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 border-t border-table-border pt-3">
              선택된 근무자:{" "}
              <span className="font-semibold text-slate-800">
                {selectedWorker
                  ? `${selectedWorker.name} (${selectedWorker.role})`
                  : "없음"}
              </span>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                className="px-6 py-2 rounded-full bg-sidebar-bg hover:bg-sidebar-hover text-white text-xs font-semibold"
                onClick={onSubmit}
              >
                업무 하달하기
              </button>
            </div>
          </div>
        </div>

        {/* 아래: 하달 내역 요약 (간단) */}
        <div className="bg-slate-50 rounded-xl border border-dashed border-table-border px-4 py-3 text-[11px] text-slate-500">
          <div className="font-semibold text-slate-700 mb-2">
            최근 업무 하달 내역 (데모)
          </div>
          {assignHistory.length === 0 && (
            <div className="text-slate-400">
              아직 하달된 업무가 없습니다. 위에서 업무를 하달하면
              여기에 기록됩니다.
            </div>
          )}
          {assignHistory.length > 0 && (
            <ul className="space-y-1">
              {assignHistory.map((h) => (
                <li key={h.id} className="flex gap-2">
                  <span className="text-slate-500 w-10">
                    {h.time}
                  </span>
                  <span className="text-slate-700">
                    <span className="font-semibold">{h.workerName}</span>
                    에게 하달: {h.content}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
