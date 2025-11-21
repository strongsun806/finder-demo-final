// src/lib/types.ts
export type User = {
  id: number;
  role: "admin" | "staff";
  name: string;
  username: string;
  password?: string;
  company: string;
};

export type Notice = {
  id: number;
  title: string;
  urgent: boolean;
  date: string;
  author: string;
  views: number;
  content?: string;
  attachments?: string[];
};

export type Alert = { id: number; type: string; name?: string; msg?: string; time: string; place?: string };

export type ContainerRow = {
  id: number; zone: string; code: string; flag: string; reg: string; ship: string; ton: number; outAt: string | null;
};

export type Task = {
  id: number;
  title: string;
  assignee: string;
  status: "진행중" | "완료";
  date: string;
  content?: string;
  location?: string;
  lat?: number; lng?: number;
  timeline?: { at: string; note: string }[];
};

export type Person = { id: number; name: string; role: string; car: string; since: string; state: string; manager: string };

export type Vehicle = { id: number; name: string; plate: string; since: string; owner: string };

export type Report = {
  id: number;
  type: "사고" | "고장" | "위험";
  content: string;
  time: string;
  place?: string;
  lat?: number; lng?: number;
};
