import React from "react";
export default function Select({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200 ${className}`}
      style={{ borderColor: "var(--border)" }}
    >
      {children}
    </select>
  );
}
