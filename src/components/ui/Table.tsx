import React from "react";
import Button from "./Button";

type Col = { key: string; title: string; render?: (v: any, r: any) => React.ReactNode };

export default function Table({
  columns,
  rows,
  actions
}: {
  columns: Col[];
  rows: any[];
  actions?: (row: any) => React.ReactNode;
}) {
  return (
    <div className="overflow-auto rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
      <table className="min-w-[720px] w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map(c => (
              <th key={c.key} className="px-3 py-2 text-left font-semibold">{c.title}</th>
            ))}
            {actions && <th className="px-3 py-2 text-left font-semibold">작업</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
              {columns.map(c => (
                <td key={c.key} className="px-3 py-2">{c.render ? c.render((r as any)[c.key], r) : (r as any)[c.key]}</td>
              ))}
              {actions && <td className="px-3 py-2"><div className="flex gap-2">{actions(r)}</div></td>}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="px-3 py-6 text-center text-gray-500">데이터가 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
