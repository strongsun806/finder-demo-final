import React, { useEffect, useState } from "react";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { api } from "../lib/api";
import type { Person, Vehicle } from "../lib/types";

export default function People(){
  const [tab, setTab] = useState<"근무자"|"장비">("근무자");
  const [people, setPeople] = useState<Person[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [openAddVeh, setOpenAddVeh] = useState(false);
  useEffect(()=>{ api.getPeople().then(setPeople); api.getVehicles().then(setVehicles); }, []);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">근무자 / 장비관리</h2>
        <div className="flex gap-2">
          <Button variant={tab==="근무자"?"primary":"ghost"} onClick={()=>setTab("근무자")}>근무자</Button>
          <Button variant={tab==="장비"?"primary":"ghost"} onClick={()=>setTab("장비")}>장비 / 차량관리</Button>
        </div>
      </div>

      {tab === "근무자" && <Table columns={[{ key:"name", title:"근무자명" },{ key:"role", title:"직책/담당업무" },{ key:"car", title:"차량번호" },{ key:"since", title:"입사일" },{ key:"state", title:"근무현황" },{ key:"manager", title:"담당자" },]} rows={people as any} actions={()=> <Button>정보보기</Button>} />}

      {tab === "장비" && (<>
        <div className="flex justify-end"><Button onClick={()=>setOpenAddVeh(true)} variant="primary">차량등록</Button></div>
        <Table columns={[{ key:"name", title:"차량/장비명" },{ key:"plate", title:"차량번호" },{ key:"since", title:"등록날짜" },{ key:"owner", title:"담당자" },]} rows={vehicles as any} actions={()=> <Button>정보보기</Button>} />
        <AddVehicleModal open={openAddVeh} onClose={()=>setOpenAddVeh(false)} onSaved={async()=> setVehicles(await api.getVehicles())} />
      </>)}
    </div>
  );
}

function AddVehicleModal({ open, onClose, onSaved }:{ open:boolean; onClose:()=>void; onSaved:()=>void }){
  const [form, setForm] = useState({ name:"", plate:"", since:"", owner:"" });
  const submit = async ()=>{ if(!(form as any).name || !(form as any).plate || !(form as any).since) return; await api.addVehicle(form as any); onClose(); onSaved?.(); };
  return (
    <Modal open={open} onClose={onClose} title="장비 / 차량등록" footer={<><Button onClick={onClose}>취소</Button><Button variant="primary" onClick={submit}>등록</Button></>}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div><label className="mb-1 block text-sm text-gray-600">차량/장비명 *</label><Input value={(form as any).name} onChange={(e)=>setForm({...form, name:e.target.value})} placeholder="이동차량/덤프트럭"/></div>
        <div><label className="mb-1 block text-sm text-gray-600">차량번호 *</label><Input value={(form as any).plate} onChange={(e)=>setForm({...form, plate:e.target.value})} placeholder="38누6806"/></div>
        <div><label className="mb-1 block text-sm text-gray-600">등록날짜 *</label><Input value={(form as any).since} onChange={(e)=>setForm({...form, since:e.target.value})} placeholder="20231010"/></div>
        <div><label className="mb-1 block text-sm text-gray-600">담당자</label><Input value={(form as any).owner} onChange={(e)=>setForm({...form, owner:e.target.value})} placeholder="박성근"/></div>
        <div className="md:col-span-2"><label className="mb-1 block text-sm text-gray-600">차량이미지 *</label><div className="grid h-24 place-items-center rounded-xl border-2 border-dashed text-sm text-gray-500" style={{borderColor:"var(--border)"}}>이미지 업로드 (비워둠)</div></div>
      </div>
    </Modal>
  );
}
