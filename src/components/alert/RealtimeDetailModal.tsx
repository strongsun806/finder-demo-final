// src/components/alerts/RealtimeDetailModal.tsx
import React from "react";

type RealtimeItem = {
  id: number;
  worker: string;
  time: string;
  title: string;
  location: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  item: RealtimeItem | null;
};

const RealtimeDetailModal: React.FC<Props> = ({ open, onClose, item }) => {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* 상단 바 */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-2 text-sm">
          <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px]">
            긴급
          </span>
          <span className="font-semibold text-slate-800">{item.time}</span>
          <span className="text-slate-600 text-[13px] truncate">
            {item.title}
          </span>
          <button
            onClick={onClose}
            className="ml-auto text-slate-400 hover:text-slate-600 text-lg leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 상단 이미지 (야드 도면 / 사고 위치) */}
        <img
          src="/images/accident.png"
          alt="사고 위치 지도"
          className="w-full h-auto border-b border-slate-200"
        />

        {/* 텍스트 영역 */}
        <div className="p-5 text-[13px] space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">위치</span>
            <span className="text-sky-600 font-semibold">
              {item.location}
            </span>
          </div>

          <div className="text-slate-700 leading-relaxed text-[12px]">
            {item.time} {item.worker} 근무자 위치에서 사고가 발생하였습니다.
            현재 현장 점검 및 조치 중입니다.
          </div>
        </div>

        {/* 하단 실제 현장 사진 */}
        <img
          src="/images/container.png"
          alt="컨테이너 사고 현장"
          className="w-full h-auto border-t border-slate-200"
        />

        {/* 확인 버튼 */}
        <div className="p-5 pt-3">
          <button
            onClick={onClose}
            className="w-full h-11 bg-[#003388] hover:bg-[#002266] text-white text-[14px] rounded-lg font-semibold shadow-sm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealtimeDetailModal;
