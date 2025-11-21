// src/lib/api.ts
import type { ContainerRow, Task, Person, Vehicle, Notice, Report } from "./types";

type DB = {
  containers?: ContainerRow[];
  requests?: any[];
  conversations?: Array<{
    id: number; name: string; last: string;
    messages: { id: number; from: string; text: string; time: string }[];
  }>;
  workers?: any[];
  incidents?: any[];
  reports?: Report[];
  tasks?: Task[];
  people?: Person[];
  vehicles?: Vehicle[];
  notices?: Notice[];
  users?: Array<{ id:number; role:"admin"|"staff"; name:string; username:string; password:string; company:string }>;
  auth?: { user: { name: string; company: string; role:"admin"|"staff" } } | null;
};

function getDB(): DB { try { return JSON.parse(localStorage.getItem("db") || "{}"); } catch { return {}; } }
function setDB(db: DB) { localStorage.setItem("db", JSON.stringify(db)); }

// ───────────────── seed ─────────────────
(function seed() {
  const db = getDB();

  if (!db.users) {
    db.users = [
      { id:1, role:"admin", name:"홍길동", username:"admin", password:"admin123", company:"FINDER" },
      { id:2, role:"staff", name:"이영희", username:"staff", password:"staff123", company:"FINDER" },
    ];
  }

  if (!db.conversations) {
    db.conversations = [
      { id: 1, name: "차인우", last: "작업요청드립니다", messages: [
        { id: 1, from: "차인우", text: "안녕하세요! 작업요청드립니다", time: "오후 2:35" },
        { id: 2, from: "나", text: "어떤 작업인가요?", time: "오후 2:35" },
      ]},
    ];
  }

  if (!db.reports) {
    db.reports = [
      { id:101, type:"사고", content:"A-05 지게차 경미 충돌", time:"2023-11-03 10:40", place:"야드 A-05", lat:35.1, lng:129.05 },
      { id:102, type:"위험", content:"B-03 유류 누유 의심",   time:"2023-11-03 11:10", place:"야드 B-03" }
    ];
  }

  if (!db.tasks) {
    db.tasks = [
      { id: 1, title: "E구역 컨테이너 하차", assignee: "김길동", status: "진행중", date: "2023-10-10 14:00", content:"E구역 하차 진행", location:"E-01", timeline:[
        { at: "2023-10-10 14:00", note: "작업 시작" },
        { at: "2023-10-10 14:20", note: "장비 투입" },
      ] },
      { id: 2, title: "D구역 컨테이너 하차", assignee: "고길동", status: "완료", date: "2023-10-10 14:00", content:"D구역 하차", timeline:[
        { at: "2023-10-10 14:00", note: "시작" },
        { at: "2023-10-10 16:30", note: "완료" },
      ] },
    ];
  }

  if (!db.people) {
    db.people = [
      { id: 1, name: "김길동", role: "야드운전수", car: "지게차-3호", since: "2022-03-10", state: "근무중", manager: "이영희" },
      { id: 2, name: "이영희", role: "현장관리자", car: "-",         since: "2021-06-01", state: "근무중", manager: "관리부" },
      { id: 3, name: "박민수", role: "야드운전수", car: "덤프트럭-2호", since: "2023-01-15", state: "대기",   manager: "이영희" },
    ];
  }

  if (!db.vehicles) {
    db.vehicles = [
      { id: 1, name: "이동차량/덤프트럭", plate: "38누3806", since: "2002-12-01", owner: "FINDER" },
      { id: 2, name: "지게차-3호", plate: "부산12 가1234", since: "2021-02-03", owner: "FINDER" },
    ];
  }

  if (!db.notices) {
    const base: Notice[] = [
      { id: 9001, title:"긴급전달사항입니다 전직원읽어주세요!", urgent:true,  date:"2023-10-16", author:"관리자", views:100 },
      { id: 9002, title:"긴급전달사항 필독",                     urgent:true,  date:"2023-10-16", author:"관리자", views:100 },
      { id: 9003, title:"공지사항입니다!",                        urgent:false, date:"2023-09-16", author:"관리자", views:54 },
      { id: 9004, title:"공지사항입니다!",                        urgent:false, date:"2023-09-16", author:"관리자", views:54 },
      { id: 9005, title:"공지사항입니다 읽어주세요!!!",            urgent:false, date:"2023-10-10", author:"관리자", views:10058 },
      { id: 9006, title:"공지사항입니다 읽어주세요!!!",            urgent:false, date:"2023-10-10", author:"관리자", views:10058 },
      { id: 9007, title:"전달사항입니다",                          urgent:false, date:"2023-08-22", author:"관리자", views:88 },
      { id: 9008, title:"전달사항입니다",                          urgent:false, date:"2023-08-22", author:"관리자", views:88 },
      { id: 9009, title:"공지",                                    urgent:false, date:"2023-08-15", author:"관리자", views:27 },
      { id: 9010, title:"공지",                                    urgent:false, date:"2023-08-15", author:"관리자", views:27 },
    ];
    db.notices = base;
  }

  if (db.auth === undefined) db.auth = null;
  setDB(db);
})();

// ───────────────── API ─────────────────
export const api = {
  // Auth
  getAuth: async () => (getDB().auth ?? null),
  login: async (username: string, password: string) => {
    const db = getDB();
    const u = (db.users || []).find(x => x.username === username && x.password === password);
    if (!u) throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
    db.auth = { user: { name: u.name, company: u.company, role: u.role } };
    setDB(db);
    return db.auth;
  },
  logout: async () => { const db = getDB(); db.auth = null; setDB(db); },
  registerUser: async (p: { name:string; username:string; password:string; company:string })=>{
    const db = getDB();
    if ((db.users||[]).some(u=>u.username===p.username)) throw new Error("이미 존재하는 아이디입니다.");
    const id = Date.now(); const role:"staff"="staff";
    db.users = [...(db.users||[]), {id, role, ...p}];
    db.requests = [{ id:id+1000, type:"회원가입", name:p.name, company:p.company, date:new Date().toISOString().slice(0,10), details:{ username:p.username } }, ...(db.requests||[])];
    setDB(db);
    return {id, role, ...p};
  },

  // Containers
  getContainers: async (): Promise<ContainerRow[]> => getDB().containers || [],
  addContainer: async (row: Omit<ContainerRow, "id" | "ton"> & { ton: any }) => {
    const db = getDB(); const id = Date.now(); const { ton, ...rest } = row as any;
    const newRow: ContainerRow = { id, ...rest, ton: Number(ton) || 0 };
    db.containers = [newRow, ...(db.containers || [])]; setDB(db);
  },
  setContainerOutAt: async (id: number, iso: string) => {
    const db = getDB(); db.containers = (db.containers || []).map(c => (c.id === id ? { ...c, outAt: iso } : c)); setDB(db);
  },

  // Requests
  getRequests: async (): Promise<any[]> => { const db = getDB(); if (!db.requests) db.requests = []; return db.requests; },
  resolveRequest: async (id: number) => { const db = getDB(); db.requests = (db.requests || []).filter((r: any) => r.id !== id); setDB(db); },

  // Conversations & Messages
  getConversations: async () => getDB().conversations || [],
  createConversation: async (name: string, seedText?: string) => {
    const db = getDB(); const id = Date.now();
    const conv = { id, name, last: seedText || "", messages: seedText ? [{ id: id+1, from:"시스템", text: seedText, time: new Date().toLocaleTimeString() }] : [] };
    db.conversations = [conv, ...(db.conversations || [])]; setDB(db); return conv;
  },
  sendMessage: async (convId: number, text: string) => {
    const db = getDB(); let c = (db.conversations || []).find((x: any) => x.id === convId);
    if (!c) { c = { id: convId || Date.now(), name: "새 대화", last: "", messages: [] }; db.conversations = [c, ...(db.conversations || [])]; }
    c.messages.push({ id: Date.now(), from: "나", text, time: new Date().toLocaleTimeString() }); c.last = text; setDB(db);
  },
  deleteMessage: async (convId:number, msgId:number) => {
    const db = getDB(); const c = (db.conversations || []).find((x:any)=>x.id===convId);
    if (c) { c.messages = c.messages.filter((m:any)=>m.id!==msgId); c.last = c.messages[c.messages.length-1]?.text || ""; setDB(db); }
  },
  deleteConversation: async (convId:number)=>{ const db = getDB(); db.conversations = (db.conversations || []).filter((x:any)=>x.id!==convId); setDB(db); },

  // Reports
  getReports: async (): Promise<Report[]> => getDB().reports || [],
  addReport: async (r: Omit<Report,"id">) => {
    const db = getDB(); const id = Date.now();
    db.reports = [{ id, ...r }, ...(db.reports || [])];
    db.incidents = [{ id, ...r }, ...(db.incidents || [])];
    setDB(db);
  },

  // Yard / Workers
  getWorkers: async () => {
    const db = getDB();
    if (!db.workers) {
      db.workers = [
        { id: 1, name: "김길동", role: "야드운전수", zone: "A", cell: "A-12", state: "근무중" },
        { id: 2, name: "고길동", role: "야드운전수", zone: "B", cell: "B-03", state: "대기" },
        { id: 3, name: "이영희", role: "현장관리자", zone: "C", cell: "C-07", state: "근무중" },
      ];
      setDB(db);
    }
    return db.workers;
  },
  moveWorker: async (id: number, zone: string, cell: string) => {
    const db = getDB(); const w = (db.workers || []).find((x: any) => x.id === id);
    if (w) { w.zone = zone; w.cell = cell; } setDB(db);
  },

  // Tasks / People / Vehicles
  getTasks: async (): Promise<Task[]> => getDB().tasks || [],
  addTask: async (task: Omit<Task, "id">) => {
    const db = getDB(); const id = Date.now();
    const row: Task = { id, ...task, timeline: task.timeline || [] };
    db.tasks = [row, ...(db.tasks || [])]; setDB(db);
  },
  completeTask: async (id:number, when:string, note?:string) => {
    const db = getDB();
    db.tasks = (db.tasks || []).map(t => t.id===id ? { ...t, status:"완료", timeline:[...(t.timeline||[]), ...(note? [{at:when, note}] : [])] } : t);
    setDB(db);
  },
  addTaskTimeline: async (id:number, at:string, note:string)=>{
    const db = getDB(); db.tasks = (db.tasks || []).map(t => t.id===id ? { ...t, timeline:[...(t.timeline||[]), {at, note}] } : t); setDB(db);
  },
  getPeople: async (): Promise<Person[]> => getDB().people || [],
  getVehicles: async (): Promise<Vehicle[]> => getDB().vehicles || [],
  addVehicle: async (v: Omit<Vehicle,"id">) => {
    const db = getDB(); const id = Date.now();
    db.vehicles = [{ id, ...v }, ...(db.vehicles || [])]; setDB(db);
  },

  // Notices
  getNotices: async (): Promise<Notice[]> => (getDB().notices || []).slice(),
  addNotice: async (n: Notice) => {
    const db = getDB(); const id = Date.now();
    const row: Notice = { ...n, id, views: 0 };
    db.notices = [row, ...(db.notices || [])]; setDB(db);
  },
  updateNotice: async (n: Notice) => {
    const db = getDB(); db.notices = (db.notices || []).map(x => x.id === n.id ? { ...x, ...n } : x); setDB(db);
  },
  deleteNotice: async (id: number) => {
    const db = getDB(); db.notices = (db.notices || []).filter(x => x.id !== id); setDB(db);
  },
  viewNotice: async (id: number) => {
    const db = getDB(); db.notices = (db.notices || []).map(x => x.id === id ? { ...x, views: (x.views || 0) + 1 } : x); setDB(db);
  },

  getDashboardMetrics: async ()=> ({ workers: 1004, running: 210, done: 1010 }),
  getYardHeadline: async ()=> ({ workers: 1004, hazards: 1, running: 1010 }),
};
