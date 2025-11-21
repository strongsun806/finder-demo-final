import React from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";

export default function Realtime() {
  const [open, setOpen] = React.useState(false);
  const [list, setList] = React.useState<any[]>([
    { id:1, title:"A구역 위험요소 발견", time:"10:15", who:"현장관리자", content:"A-12 위치에 미끄럼 위험" },
    { id:2, title:"C구역 진행업무 보고", time:"10:50", who:"김길동", content:"컨테이너 하차 완료" },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">실시간 보고</h2>
        <Button variant="primary" onClick={()=>setOpen(true)}>보고 등록</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {list.map(item => (
          <Card key={item.id} title={item.title} right={<span className="text-sm text-gray-500">{item.time} · {item.who}</span>}>
            <div className="text-sm text-gray-700">{item.content}</div>
          </Card>
        ))}
      </div>

      <ReportModal
        open={open}
        onClose={()=>setOpen(false)}
        onSave={(data:any)=>{ setList([{ id:Date.now(), ...data }, ...list]); setOpen(false); }}
      />
    </div>
  );
}

function ReportModal({ open, onClose, onSave }: { open:boolean; onClose:()=>void; onSave:(d:any)=>void }) {
  const [form, setForm] = React.useState({ title:"", who:"나", time:"", content:"" });
  const submit = ()=> { if (!form.title) return; onSave(form); };
  return (
    <Modal open={open} onClose={onClose} title="실시간 보고 등록" footer={<><Button onClick={onClose}>취소</Button><Button variant="primary" onClick={submit}>등록</Button></>}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div><label className="mb-1 block text-sm text-gray-600">제목 *</label><Input value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} /></div>
        <div><label className="mb-1 block text-sm text-gray-600">작성자</label><Input value={form.who} onChange={(e)=>setForm({...form, who:e.target.value})} /></div>
        <div><label className="mb-1 block text-sm text-gray-600">시간</label><Input type="time" value={form.time} onChange={(e)=>setForm({...form, time:e.target.value})} /></div>
        <div className="md:col-span-2"><label className="mb-1 block text-sm text-gray-600">내용</label><textarea className="h-32 w-full rounded-xl border p-3 text-sm outline-none" style={{borderColor:"var(--border)"}} value={form.content} onChange={(e)=>setForm({...form, content:e.target.value})} /></div>
        <div className="md:col-span-2"><label className="mb-1 block text-sm text-gray-600">이미지</label><div className="grid h-24 place-items-center rounded-xl border-2 border-dashed text-sm text-gray-500" style={{borderColor:"var(--border)"}}>이미지 업로드 (비워둠)</div></div>
      </div>
    </Modal>
  );
}
