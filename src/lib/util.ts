export function downloadCSV(
  filename: string,
  rows: any[],
  columns: { key: string; title: string }[]
) {
  const header = columns.map(c => c.title).join(",");
  const body = rows
    .map(r => columns.map(c => JSON.stringify((r as any)[c.key] ?? "")).join(","))
    .join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
