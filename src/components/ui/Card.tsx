import React from "react";
export default function Card({
  title,
  right,
  children
}: React.PropsWithChildren<{ title?: string; right?: React.ReactNode }>) {
  return (
    <div className="rounded-2xl border bg-white p-3" style={{ borderColor: "var(--border)" }}>
      {(title || right) && (
        <div className="mb-2 flex items-center justify-between">
          <div className="font-medium">{title}</div>
          <div>{right}</div>
        </div>
      )}
      {children}
    </div>
  );
}
