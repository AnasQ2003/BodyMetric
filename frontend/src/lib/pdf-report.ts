import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { BmiEntry, Profile } from "./bmi-store";
import { bmiCategory } from "./bmi-store";

type Range = { from: Date; to: Date; label: string };

const HEX = {
  ink: "#0f172a",
  sub: "#64748b",
  brand: "#7c3aed",
  brand2: "#06b6d4",
  ok: "#10b981",
  warn: "#f59e0b",
  bad: "#ef4444",
  bg: "#f8fafc",
  line: "#e2e8f0",
};

const catColor = (k: string) =>
  k === "under" ? "#0ea5e9" : k === "healthy" ? HEX.ok : k === "over" ? HEX.warn : HEX.bad;

export function generateBmiReport(opts: { profile: Profile; entries: BmiEntry[]; range: Range }) {
  const { profile, entries, range } = opts;
  const filtered = entries
    .filter((e) => {
      const d = new Date(e.date);
      return d >= range.from && d <= range.to;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 40;

  // ===== Cover header =====
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, pageW, 130, "F");
  doc.setFillColor(6, 182, 212);
  doc.circle(pageW - 60, 20, 70, "F");
  doc.setFillColor(236, 72, 153);
  doc.circle(40, 110, 50, "F");

  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("BMI Pulse · Health Report", M, 60);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Period: ${range.label} · ${range.from.toDateString()} → ${range.to.toDateString()}`,
    M,
    82,
  );
  doc.text(`Generated: ${new Date().toLocaleString()}`, M, 100);

  // ===== Profile card =====
  let y = 160;
  doc.setFillColor(HEX.bg);
  doc.roundedRect(M, y, pageW - M * 2, 90, 10, 10, "F");
  doc.setTextColor(HEX.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(profile.name || "Unnamed user", M + 16, y + 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(HEX.sub);
  doc.text(profile.email || "—", M + 16, y + 42);

  const cols = [
    ["Age", `${profile.age}`],
    ["Gender", profile.gender],
    ["Height", `${profile.height} cm`],
    ["Weight", `${profile.weight} kg`],
    ["Target", `${profile.targetWeight} kg`],
    ["Goal", profile.goal],
  ];
  cols.forEach(([k, v], i) => {
    const x = M + 16 + (i % 3) * 170;
    const yy = y + 62 + Math.floor(i / 3) * 16;
    doc.setTextColor(HEX.sub);
    doc.setFontSize(8);
    doc.text(String(k).toUpperCase(), x, yy);
    doc.setTextColor(HEX.ink);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(String(v), x + 50, yy);
    doc.setFont("helvetica", "normal");
  });

  y += 110;

  // ===== Stats =====
  doc.setTextColor(HEX.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Summary", M, y);
  y += 14;

  if (!filtered.length) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(HEX.sub);
    doc.setFontSize(11);
    doc.text("No measurements recorded in this period.", M, y + 20);
    doc.save(`bmi-report-${Date.now()}.pdf`);
    return;
  }

  const bmis = filtered.map((e) => e.bmi);
  const ws = filtered.map((e) => e.weight);
  const min = Math.min(...bmis),
    max = Math.max(...bmis);
  const avg = bmis.reduce((a, b) => a + b, 0) / bmis.length;
  const delta = filtered[filtered.length - 1].bmi - filtered[0].bmi;
  const wDelta = filtered[filtered.length - 1].weight - filtered[0].weight;

  const cards = [
    { k: "Readings", v: `${filtered.length}`, c: HEX.brand },
    { k: "Avg BMI", v: avg.toFixed(1), c: HEX.brand2 },
    { k: "Min BMI", v: min.toFixed(1), c: HEX.ok },
    { k: "Max BMI", v: max.toFixed(1), c: HEX.warn },
    { k: "Δ BMI", v: (delta >= 0 ? "+" : "") + delta.toFixed(1), c: delta > 0 ? HEX.warn : HEX.ok },
    {
      k: "Δ Weight",
      v: (wDelta >= 0 ? "+" : "") + wDelta.toFixed(1) + " kg",
      c: wDelta > 0 ? HEX.warn : HEX.ok,
    },
  ];
  const cardW = (pageW - M * 2 - 10) / 3;
  cards.forEach((c, i) => {
    const cx = M + (i % 3) * (cardW + 5);
    const cy = y + Math.floor(i / 3) * 56;
    doc.setFillColor(c.c);
    doc.roundedRect(cx, cy, cardW, 50, 8, 8, "F");
    doc.setTextColor("#ffffff");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(c.k.toUpperCase(), cx + 10, cy + 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(c.v, cx + 10, cy + 38);
  });
  y += 56 * 2 + 16;

  // ===== BMI line chart =====
  doc.setTextColor(HEX.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("BMI Trend", M, y);
  y += 10;

  const chartW = pageW - M * 2;
  const chartH = 140;
  drawLineChart(
    doc,
    M,
    y,
    chartW,
    chartH,
    filtered.map((e) => e.bmi),
    HEX.brand,
    "BMI",
  );
  y += chartH + 16;

  // ===== Weight chart =====
  if (y + 160 > pageH - 40) {
    doc.addPage();
    y = M;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(HEX.ink);
  doc.text("Weight Trend", M, y);
  y += 10;
  drawLineChart(
    doc,
    M,
    y,
    chartW,
    chartH,
    filtered.map((e) => e.weight),
    HEX.brand2,
    "kg",
  );
  y += chartH + 16;

  // ===== Category distribution =====
  if (y + 120 > pageH - 40) {
    doc.addPage();
    y = M;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Category Distribution", M, y);
  y += 12;
  const dist: Record<string, number> = { under: 0, healthy: 0, over: 0, obese: 0 };
  filtered.forEach((e) => dist[bmiCategory(e.bmi).key]++);
  const total = filtered.length;
  const order = ["under", "healthy", "over", "obese"] as const;
  let bx = M;
  const barW = pageW - M * 2;
  order.forEach((k) => {
    const w = (dist[k] / total) * barW;
    doc.setFillColor(catColor(k));
    doc.rect(bx, y, w, 18, "F");
    bx += w;
  });
  y += 30;
  order.forEach((k, i) => {
    const cx = M + i * ((pageW - M * 2) / 4);
    doc.setFillColor(catColor(k));
    doc.circle(cx + 5, y - 2, 4, "F");
    doc.setTextColor(HEX.ink);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${k.charAt(0).toUpperCase()}${k.slice(1)}`, cx + 14, y + 1);
    doc.setTextColor(HEX.sub);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${dist[k]} · ${((dist[k] / total) * 100).toFixed(0)}%`, cx + 14, y + 14);
  });
  y += 30;

  // ===== Comparison table =====
  if (y + 60 > pageH - 40) {
    doc.addPage();
    y = M;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(HEX.ink);
  doc.text("All Measurements", M, y);
  y += 6;

  autoTable(doc, {
    startY: y + 6,
    head: [["Date", "Weight (kg)", "Height (cm)", "BMI", "Category"]],
    body: filtered.map((e) => [
      new Date(e.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      e.weight.toString(),
      e.height.toString(),
      e.bmi.toFixed(1),
      bmiCategory(e.bmi).label,
    ]),
    theme: "grid",
    headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: 30 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 9, cellPadding: 6 },
    margin: { left: M, right: M },
  });

  // ===== Footer on every page =====
  const total2 = doc.getNumberOfPages();
  for (let p = 1; p <= total2; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(HEX.sub);
    doc.text(`BMI Pulse Report · ${profile.name || "User"}`, M, pageH - 18);
    doc.text(`Page ${p} / ${total2}`, pageW - M, pageH - 18, { align: "right" });
  }

  doc.save(`bmi-report-${range.label.toLowerCase()}-${Date.now()}.pdf`);
}

function drawLineChart(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  values: number[],
  color: string,
  yLabel: string,
) {
  doc.setFillColor("#ffffff");
  doc.setDrawColor(HEX.line);
  doc.roundedRect(x, y, w, h, 6, 6, "FD");
  if (!values.length) return;
  const padL = 40,
    padR = 12,
    padT = 14,
    padB = 24;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const sx = (i: number) =>
    x + padL + (values.length === 1 ? innerW / 2 : (i / (values.length - 1)) * innerW);
  const sy = (v: number) => y + padT + innerH - ((v - min) / (max - min || 1)) * innerH;

  // grid
  doc.setDrawColor(HEX.line);
  doc.setLineWidth(0.5);
  for (let i = 0; i <= 4; i++) {
    const gy = y + padT + (i / 4) * innerH;
    doc.line(x + padL, gy, x + w - padR, gy);
    const v = max - (i / 4) * (max - min);
    doc.setFontSize(7);
    doc.setTextColor(HEX.sub);
    doc.text(v.toFixed(1), x + padL - 4, gy + 3, { align: "right" });
  }
  doc.setFontSize(7);
  doc.text(yLabel, x + 8, y + padT);

  // line
  const [r, g, b] = hexToRgb(color);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(1.6);
  for (let i = 1; i < values.length; i++) {
    doc.line(sx(i - 1), sy(values[i - 1]), sx(i), sy(values[i]));
  }
  // dots
  doc.setFillColor(r, g, b);
  values.forEach((v, i) => doc.circle(sx(i), sy(v), 2, "F"));
}

function hexToRgb(h: string): [number, number, number] {
  const m = h.replace("#", "");
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}
