import React from "react";
import Button from "./Button";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-2xl rounded-2xl border bg-white p-4 shadow-soft" style={{ borderColor: "var(--border)" }}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <Button variant="ghost" onClick={onClose}>닫기</Button>
        </div>
        <div className="mb-3">{children}</div>
        <div className="flex justify-end gap-2">{footer ?? <Button onClick={onClose}>확인</Button>}</div>
      </div>
    </div>
  );
}
