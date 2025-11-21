// src/components/Yardmap.tsx
import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Incident } from "../store/mainstore";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// TS 타입 꼬임 방지용 캐스팅 (버전 안 맞는 center/zoom 에러 우회)
const AnyMapContainer: any = MapContainer;
const AnyTileLayer: any = TileLayer;
const AnyMarker: any = Marker;
const AnyPopup: any = Popup;

type YardMapProps = {
  incidents: Incident[];
  height?: number;
  onSelectIncident?: (incident: Incident) => void;
};

// 심각도/종류별 핀 아이콘 생성 (divIcon 사용 → PNG 필요 없음)
const makePinIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width: 16px;
      height: 16px;
      border-radius: 9999px;
      background: ${color};
      border: 2px solid white;
      box-shadow: 0 0 8px ${color}80;
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const INCIDENT_ICON = makePinIcon("#f97373"); // 빨강
const EQUIP_ICON = makePinIcon("#3b82f6"); // 파랑
const ZONE_ICON = makePinIcon("#22c55e"); // 초록

// 가상의 야드 좌표 (부산 신항 근처 느낌으로 설정)
const YARD_CENTER: [number, number] = [35.095, 128.86];

// 가상 장비/존/사고 핀 정의
type DemoPin = {
  id: string;
  kind: "incident" | "equipment" | "zone";
  label: string;
  description: string;
  position: [number, number];
};

const DEMO_PINS: DemoPin[] = [
  {
    id: "rtgc-accident",
    kind: "incident",
    label: "RTGC 주행 중 충돌",
    description:
      "A2 블록 RTGC 주행 중 야드트랙터(YT)와 접촉. 인명 피해 없음, 장비 점검 필요.",
    position: [35.096, 128.859],
  },
  {
    id: "reefer-power",
    kind: "incident",
    label: "냉동 컨테이너 전원 이상",
    description:
      "냉동존 Reefer Rack 일부 전원 순간 차단 감지. 예비 전원으로 자동 전환됨.",
    position: [35.0952, 128.8625],
  },
  {
    id: "gate-ocr",
    kind: "incident",
    label: "Gate OCR 인식 오류",
    description:
      "Gate IN 차로 2번 차량 번호 인식 오류로 수동 입력 전환. 검수자 확인 필요.",
    position: [35.094, 128.858],
  },
  {
    id: "sc-worker",
    kind: "incident",
    label: "SC 근접 작업자 감지",
    description:
      "C1 블록 스트래들 캐리어 작업 반경 내 작업자 접근 감지. 일시 정지 후 상황 점검.",
    position: [35.0958, 128.857],
  },
  // 장비 위치 예시
  {
    id: "rtgc-equip",
    kind: "equipment",
    label: "RTGC #03",
    description: "A2 블록 상단 레인에서 컨테이너 적재 작업 중.",
    position: [35.0963, 128.8608],
  },
  {
    id: "sc-equip",
    kind: "equipment",
    label: "SC #12",
    description: "C1 블록에서 반출 컨테이너 픽업 대기.",
    position: [35.0957, 128.8588],
  },
  {
    id: "yt-equip",
    kind: "equipment",
    label: "YT #21",
    description: "게이트 → B 블록 반입 운송 중.",
    position: [35.0946, 128.8595],
  },
  // 존(Zone) 마커 느낌 (텍스트용)
  {
    id: "reefer-zone",
    kind: "zone",
    label: "냉동 컨테이너 존",
    description: "Reefer 전용 존. 온도 모니터링 및 비상 전원 연동.",
    position: [35.0954, 128.8635],
  },
  {
    id: "hazard-zone",
    kind: "zone",
    label: "위험물(HZ) 존",
    description: "IMDG 위험물 컨테이너 전용 보관 구역.",
    position: [35.0948, 128.8618],
  },
];

const Yardmap: React.FC<YardMapProps> = ({
  incidents,
  height = 360,
  onSelectIncident,
}) => {
  // incidents[]를 지도 위에 올릴 때, 위치 문자열(A-03 등)을 대충 좌표로 매핑
  const incidentPins = useMemo(() => {
    return incidents.map((i, index) => {
      // 위치 텍스트(A-03, B-12 등)를 간단하게 좌표 변형
      const rowBase = i.location.startsWith("A")
        ? 0.0015
        : i.location.startsWith("B")
        ? 0.0005
        : i.location.startsWith("C")
        ? -0.0005
        : -0.0015;

      const num = Number(i.location.replace(/[^\d]/g, ""));
      const offsetX =
        isNaN(num) || num === 0 ? (index % 5) * 0.0005 : (num % 5) * 0.00045;

      const lat = YARD_CENTER[0] + rowBase;
      const lng = YARD_CENTER[1] + offsetX - 0.001;

      return {
        id: i.id,
        incident: i,
        position: [lat, lng] as [number, number],
      };
    });
  }, [incidents]);

  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-table-border"
      style={{ height }}
    >
      <AnyMapContainer
        center={YARD_CENTER}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <AnyTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* === 가상 데모 핀 (사고/장비/존) === */}
        {DEMO_PINS.map((pin) => {
          const icon =
            pin.kind === "incident"
              ? INCIDENT_ICON
              : pin.kind === "equipment"
              ? EQUIP_ICON
              : ZONE_ICON;

          return (
            <AnyMarker
              key={pin.id}
              position={pin.position}
              icon={icon}
            >
              <AnyPopup>
                <div className="text-[11px] space-y-1">
                  <div className="font-semibold text-slate-900">
                    {pin.label}
                  </div>
                  <div className="text-slate-600">
                    {pin.description}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400">
                    (데모용 가상 위치 / 실제 서비스에서는 TOS 좌표와
                    연동)
                  </div>
                </div>
              </AnyPopup>
            </AnyMarker>
          );
        })}

        {/* === 스토어 incidents 기반 핀 === */}
        {incidentPins.map(({ id, incident, position }) => (
          <AnyMarker
            key={`inc-${id}`}
            position={position}
            icon={INCIDENT_ICON}
            eventHandlers={{
              click: () => {
                if (onSelectIncident) onSelectIncident(incident);
              },
            }}
          >
            <AnyPopup>
              <div className="text-[11px] space-y-1">
                <div className="font-semibold text-slate-900">
                  {incident.title}
                </div>
                <div className="text-slate-600">
                  위치: {incident.location}
                  <br />
                  시간: {incident.time}
                  <br />
                  상태: {incident.status}
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                  (하단 사고 리스트와 연동됩니다.)
                </div>
              </div>
            </AnyPopup>
          </AnyMarker>
        ))}
      </AnyMapContainer>
    </div>
  );
};

export default Yardmap;
