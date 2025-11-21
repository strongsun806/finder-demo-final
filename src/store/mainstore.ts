// src/store/mainstore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ───── 사고 / 메시지 / 알림 공통 타입 ───── */

export type IncidentSeverity = "경미" | "보통" | "중대";
export type IncidentStatus = "진행중" | "조치완료";

export type Incident = {
  id: number;
  title: string;
  location: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  time: string;
  description: string;
};

export type IncidentInput = {
  title: string;
  location: string;
  severity: IncidentSeverity;
  description: string;
};

export type ChatSender = "admin" | "worker";

export type ChatMessage = {
  id: number;
  sender: ChatSender;
  text: string;
  time: string;
};

export type ChatThread = {
  id: number;
  workerName: string;
  messages: ChatMessage[];
  lastUpdated: string;
};

export type PendingUser = {
  id: number;
  username: string;
  password: string;
  name: string;
  email: string;
  requestedAt: string;
};

export type AlertCategory = "safety" | "equipment" | "task" | "system";

export type AlertItem = {
  id: number;
  title: string;
  message: string;
  category: AlertCategory;
  createdAt: string;
  read: boolean;
};

export type AlertInput = {
  title: string;
  message: string;
  category: AlertCategory;
  createdAt?: string;
};

/* ───── ✅ 컨테이너 타입 ───── */

export type ContainerStatus = "입고" | "반출대기" | "반출완료";

export type ContainerItem = {
  id: number;
  area: string;
  lane: string;
  year: string;
  name: string;
  line: string;
  nation: string;
  type: string;
  quantity: number;
  regDate: string;
  departDate: string;
  bldo: string;
  status: ContainerStatus;
  imageUrl?: string | null;
};

export type ContainerInput = Omit<ContainerItem, "id">;

/* ───── ✅ 공지사항 타입 ───── */

export type NoticeItem = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: string;
  pinned: boolean;
};

export type NoticeInput = {
  title: string;
  content: string;
  author: string;
  pinned?: boolean;
};

/* ───── 공통 유틸 ───── */

const nowLabel = () => {
  const d = new Date();
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const hh = d.getHours().toString().padStart(2, "0");
  const mi = d.getMinutes().toString().padStart(2, "0");
  return `${mm}월 ${dd}일 ${hh}:${mi}`;
};

/* ───── 초기 더미 데이터 ───── */

const initialIncidents: Incident[] = [
  {
    id: 1,
    title: "야드 A-03 구역 장비 접촉",
    location: "A-03",
    severity: "보통",
    status: "진행중",
    time: "10월 15일 14:05",
    description:
      "컨테이너 상하역 중 지게차와 랙 구조물 경미 접촉. 인명 피해 없음.",
  },
  {
    id: 2,
    title: "B-12 구역 작업자 미배치",
    location: "B-12",
    severity: "경미",
    status: "조치완료",
    time: "10월 15일 09:20",
    description:
      "야드 계획 대비 작업자 미배치 확인 후, 인력 재배치 완료.",
  },
];

const initialThreads: ChatThread[] = [
  {
    id: 1,
    workerName: "김길동",
    lastUpdated: "10월 15일 13:00",
    messages: [
      {
        id: 11,
        sender: "worker",
        text: "관리자님, 오늘 작업 순서 확인 부탁드립니다.",
        time: "10월 15일 12:58",
      },
      {
        id: 12,
        sender: "admin",
        text: "네, 13시 전에 정리해서 안내드릴게요.",
        time: "10월 15일 13:00",
      },
    ],
  },
];

const initialAlerts: AlertItem[] = [
  {
    id: 1,
    title: "A구역 지게차 접촉 사고",
    message:
      "A구역 D-2 위치에서 지게차와 컨테이너 간 접촉 사고 발생. 인명 피해 없음.",
    category: "safety",
    createdAt: "10월 15일 14:05",
    read: false,
  },
  {
    id: 2,
    title: "장비 정기 점검 일정",
    message:
      "다음 주 수요일 09:00 ~ 11:00 야드 내 지게차 정기 점검 예정입니다.",
    category: "equipment",
    createdAt: "10월 14일 16:20",
    read: false,
  },
  {
    id: 3,
    title: "야간 작업 인원 배치 변경",
    message:
      "오늘 야간(22:00~02:00) 작업 인원 A/B 구역 재배치 완료.",
    category: "task",
    createdAt: "10월 15일 11:40",
    read: true,
  },
];

const initialPending: PendingUser[] = [];

/* ✅ 컨테이너 초기 데이터 */
const initialContainers: ContainerItem[] = [
  {
    id: 1,
    area: "A",
    lane: "A-001",
    year: "2023",
    name: "CT_001",
    line: "코드해운",
    nation: "중국",
    type: "컨테이너선",
    quantity: 10000,
    regDate: "2023-10-01",
    departDate: "2023-10-31 (13:45)",
    bldo: "BL12345",
    status: "반출대기",
    imageUrl: null,
  },
  {
    id: 2,
    area: "A",
    lane: "A-002",
    year: "2023",
    name: "CT_002",
    line: "코드대리점",
    nation: "중국",
    type: "컨테이너선",
    quantity: 9500,
    regDate: "2023-10-01",
    departDate: "2023-10-31 (13:45)",
    bldo: "BL67890",
    status: "입고",
    imageUrl: null,
  },
];

/* ✅ 공지사항 초기 데이터 (예시 2개) */
const initialNotices: NoticeItem[] = [
  {
    id: 1,
    title: "야간 작업 안전 수칙 안내",
    content:
      "야간 작업자 분들은 반드시 형광 조끼와 안전모를 착용해 주세요.\n지게차 동선과 작업 동선을 명확히 구분해주시기 바랍니다.",
    createdAt: "10월 10일 09:00",
    author: "관리자",
    pinned: true,
  },
  {
    id: 2,
    title: "주간 야드 정리 캠페인",
    content:
      "이번 주 금요일 16:00에 야드 정리 캠페인이 진행됩니다.\n컨테이너 적치 상태 및 통로 확보 여부 점검 예정입니다.",
    createdAt: "10월 12일 11:30",
    author: "관리자",
    pinned: false,
  },
];

/* ───── Store 타입 ───── */

type MainStore = {
  // 사고
  incidents: Incident[];
  addIncident: (input: IncidentInput) => void;
  updateIncidentStatus: (id: number, status: IncidentStatus) => void;
  deleteIncident: (id: number) => void;

  // 회원가입(승인 대기)
  pendingUsers: PendingUser[];
  addPendingUser: (data: {
    username: string;
    password: string;
    name: string;
    email: string;
  }) => void;
  approveUser: (user: PendingUser) => void;
  rejectUser: (pendingId: number) => void;

  // 승인된 유저 리스트
  approvedUsers: {
    id: number;
    username: string;
    password: string;
    name: string;
    role: "admin" | "staff";
  }[];

  // 메시지 스레드
  threads: ChatThread[];
  addThread: (workerName: string, firstText: string) => void;
  sendMessage: (threadId: number, sender: ChatSender, text: string) => void;

  // 알림
  alerts: AlertItem[];
  addAlert: (input: AlertInput) => void;
  markAlertRead: (id: number) => void;

  // 컨테이너
  containers: ContainerItem[];
  addContainer: (item: ContainerItem) => void;

  // ✅ 공지사항
  notices: NoticeItem[];
  addNotice: (input: NoticeInput) => void;
  toggleNoticePin: (id: number) => void;
  deleteNotice: (id: number) => void;
};

/* ───── Store 구현 ───── */

export const useMainStore = create<MainStore>()(
  persist(
    (set, get) => ({
      /* --- 사고 --- */
      incidents: initialIncidents,

      addIncident: (input) => {
        const id = Date.now();
        const time = nowLabel();
        const newIncident: Incident = {
          id,
          title: input.title,
          location: input.location,
          severity: input.severity,
          status: "진행중",
          time,
          description: input.description,
        };
        set((state) => ({
          incidents: [newIncident, ...state.incidents],
        }));

        // 사고 추가되면 자동으로 안전 알림 생성
        const alert: AlertInput = {
          title: `[사고 등록] ${input.title}`,
          message: `${input.location} 위치에서 "${input.title}" 사고가 등록되었습니다.`,
          category: "safety",
        };
        get().addAlert(alert);
      },

      updateIncidentStatus: (id, status) => {
        set((state) => ({
          incidents: state.incidents.map((i) =>
            i.id === id ? { ...i, status } : i
          ),
        }));
      },

      deleteIncident: (id) => {
        set((state) => ({
          incidents: state.incidents.filter((i) => i.id !== id),
        }));
      },

      /* --- 회원가입(승인 대기) --- */
      pendingUsers: initialPending,

      approvedUsers: [
        {
          id: 100,
          username: "admin",
          password: "admin123",
          name: "관리자 계정",
          role: "admin",
        },
        {
          id: 101,
          username: "staff",
          password: "staff123",
          name: "스태프 계정",
          role: "staff",
        },
      ],

      addPendingUser: ({ username, password, name, email }) => {
        const newPending: PendingUser = {
          id: Date.now(),
          username,
          password,
          name,
          email,
          requestedAt: nowLabel(),
        };
        set((state) => ({
          pendingUsers: [newPending, ...state.pendingUsers],
        }));

        get().addAlert({
          title: "회원가입 승인 요청",
          message: `${name} (${email}) 님이 회원가입을 요청했습니다.`,
          category: "system",
        });
      },

      approveUser: (user) => {
        set((state) => ({
          pendingUsers: state.pendingUsers.filter(
            (u) => u.id !== user.id
          ),
          approvedUsers: [
            ...state.approvedUsers,
            {
              id: user.id,
              username: user.username,
              password: user.password,
              name: user.name,
              role: "staff",
            },
          ],
        }));

        get().addAlert({
          title: "회원가입 승인 완료",
          message: `${user.name} 님의 계정을 승인했습니다.`,
          category: "system",
        });
      },

      rejectUser: (pendingId) => {
        const target = get().pendingUsers.find(
          (u) => u.id === pendingId
        );
        set((state) => ({
          pendingUsers: state.pendingUsers.filter(
            (u) => u.id !== pendingId
          ),
        }));

        if (target) {
          get().addAlert({
            title: "회원가입 요청 거절",
            message: `${target.name} 님의 회원가입 요청을 거절했습니다.`,
            category: "system",
          });
        }
      },

      /* --- 메시지 --- */
      threads: initialThreads,

      addThread: (workerName, firstText) => {
        const time = nowLabel();
        const msgId = Date.now();
        const newThread: ChatThread = {
          id: msgId,
          workerName,
          lastUpdated: time,
          messages: [
            {
              id: msgId,
              sender: "admin",
              text: firstText,
              time,
            },
          ],
        };
        set((state) => ({
          threads: [newThread, ...state.threads],
        }));
      },

      sendMessage: (threadId, sender, text) => {
        if (!text.trim()) return;
        const time = nowLabel();
        const msg: ChatMessage = {
          id: Date.now(),
          sender,
          text: text.trim(),
          time,
        };

        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: [...t.messages, msg],
                  lastUpdated: time,
                }
              : t
          ),
        }));
      },

      /* --- 알림 --- */
      alerts: initialAlerts,

      addAlert: (input) => {
        const id = Date.now();
        const createdAt = input.createdAt ?? nowLabel();
        const newAlert: AlertItem = {
          id,
          title: input.title,
          message: input.message,
          category: input.category,
          createdAt,
          read: false,
        };
        set((state) => ({
          alerts: [newAlert, ...state.alerts],
        }));
      },

      markAlertRead: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, read: true } : a
          ),
        }));
      },

      /* --- 컨테이너 --- */
      containers: initialContainers,

      addContainer: (item) => {
        set((state) => ({
          containers: [...state.containers, item],
        }));
      },

      /* --- ✅ 공지사항 --- */
      notices: initialNotices,

      addNotice: (input) => {
        const id = Date.now();
        const createdAt = nowLabel();
        const newNotice: NoticeItem = {
          id,
          title: input.title,
          content: input.content,
          author: input.author,
          createdAt,
          pinned: !!input.pinned,
        };
        set((state) => ({
          notices: [newNotice, ...state.notices],
        }));
      },

      toggleNoticePin: (id) => {
        set((state) => ({
          notices: state.notices.map((n) =>
            n.id === id ? { ...n, pinned: !n.pinned } : n
          ),
        }));
      },

      deleteNotice: (id) => {
        set((state) => ({
          notices: state.notices.filter((n) => n.id !== id),
        }));
      },
    }),
    {
      name: "finder-main-store-v1",
    }
  )
);