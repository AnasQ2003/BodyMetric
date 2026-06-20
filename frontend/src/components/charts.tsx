import { motion } from "framer-motion";
import { useMemo } from "react";

export type Point = { x: string; y: number };
export type Series = { name: string; color: string; data: Point[] };

export function LineChart({ data, color = "var(--primary)", height = 160, yLabel = "BMI" }: { data: Point[]; color?: string; height?: number; yLabel?: string }) {
  const w = 320, padL = 36, padR = 12, padT = 14, padB = 26;
  const innerW = w - padL - padR, innerH = height - padT - padB;
  const { path, area, points, yTicks, xs } = useMemo(() => {
    if (!data.length) return { path: "", area: "", points: [] as { cx: number; cy: number; p: Point }[], yTicks: [] as number[], xs: [] as { x: number; label: string }[] };
    const ys = data.map((d) => d.y);
    let min = Math.min(...ys), max = Math.max(...ys);
    if (max - min < 0.5) { const c = (min + max) / 2; min = c - 1.5; max = c + 1.5; }
    const pad = (max - min) * 0.15;
    min = +(min - pad).toFixed(2); max = +(max + pad).toFixed(2);
    const sx = (i: number) => padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const sy = (v: number) => padT + innerH - ((v - min) / (max - min || 1)) * innerH;
    const pts = data.map((d, i) => ({ cx: sx(i), cy: sy(d.y), p: d }));
    const path = pts.map((p, i) => `${i ? "L" : "M"}${p.cx},${p.cy}`).join(" ");
    const area = `${path} L${pts[pts.length - 1].cx},${padT + innerH} L${pts[0].cx},${padT + innerH} Z`;
    const ticks = [min, (min + max) / 2, max].map((v) => +v.toFixed(1));
    const xs = data.map((d, i) => ({ x: sx(i), label: d.x }));
    return { path, area, points: pts, yTicks: ticks, xs };
  }, [data, innerH, innerW]);

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full">
      <defs>
        <linearGradient id="lcg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map((t, i) => {
        const cy = padT + innerH - (i / 2) * innerH;
        return (
          <g key={i}>
            <line x1={padL} x2={w - padR} y1={cy} y2={cy} stroke="currentColor" strokeOpacity="0.08" />
            <text x={padL - 6} y={cy + 3} fontSize="9" textAnchor="end" fill="currentColor" opacity="0.5">{t}</text>
          </g>
        );
      })}
      <text x={6} y={padT - 2} fontSize="8" fill="currentColor" opacity="0.5">{yLabel}</text>
      {data.length > 0 && (
        <>
          <motion.path d={area} fill="url(#lcg)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} />
          <motion.path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: "easeOut" }} />
          {points.map((pt, i) => (
            <motion.circle key={i} cx={pt.cx} cy={pt.cy} r={3.5} fill={color} stroke="white" strokeWidth={1.5}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.05, type: "spring", stiffness: 240 }} />
          ))}
          {xs.filter((_, i) => i % Math.max(1, Math.ceil(xs.length / 5)) === 0).map((t, i) => (
            <text key={i} x={t.x} y={height - 8} fontSize="9" textAnchor="middle" fill="currentColor" opacity="0.55">{t.label}</text>
          ))}
        </>
      )}
    </svg>
  );
}

export function MultiLineChart({ series, height = 200, xLabels }: { series: Series[]; height?: number; xLabels?: string[] }) {
  const w = 320, padL = 38, padR = 38, padT = 18, padB = 30;
  const innerW = w - padL - padR, innerH = height - padT - padB;
  const n = Math.max(...series.map((s) => s.data.length), 1);

  // pre-compute per-series normalization with safe padding when flat
  const normSeries = series.map((s) => {
    if (!s.data.length) return { ...s, min: 0, max: 1, ticks: [0, 0.5, 1] };
    const ys = s.data.map((d) => d.y);
    let min = Math.min(...ys);
    let max = Math.max(...ys);
    if (max - min < 0.5) { const c = (min + max) / 2; min = c - 1; max = c + 1; }
    const pad = (max - min) * 0.15;
    min = +(min - pad).toFixed(2);
    max = +(max + pad).toFixed(2);
    const ticks = [min, (min + max) / 2, max].map((v) => +v.toFixed(1));
    return { ...s, min, max, ticks };
  });

  const xLabelsList = xLabels || series[0]?.data.map((d) => d.x) || [];

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full">
      {/* horizontal grid + Y ticks (left = first series, right = second) */}
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
        const y = padT + innerH * p;
        return (
          <g key={i}>
            <line x1={padL} x2={w - padR} y1={y} y2={y} stroke="currentColor" strokeOpacity={i === 0 || i === 4 ? 0.18 : 0.07} />
          </g>
        );
      })}
      {/* left Y tick labels (series 0) */}
      {normSeries[0] && [0, 0.5, 1].map((p, i) => {
        const y = padT + innerH * p + 3;
        const v = normSeries[0].max - (normSeries[0].max - normSeries[0].min) * p;
        return <text key={i} x={padL - 5} y={y} fontSize="8.5" textAnchor="end" fill={normSeries[0].color} opacity="0.75" fontWeight="700">{v.toFixed(1)}</text>;
      })}
      {/* right Y tick labels (series 1) */}
      {normSeries[1] && [0, 0.5, 1].map((p, i) => {
        const y = padT + innerH * p + 3;
        const v = normSeries[1].max - (normSeries[1].max - normSeries[1].min) * p;
        return <text key={i} x={w - padR + 5} y={y} fontSize="8.5" textAnchor="start" fill={normSeries[1].color} opacity="0.75" fontWeight="700">{v.toFixed(1)}</text>;
      })}

      {normSeries.map((s, si) => {
        if (!s.data.length) return null;
        const sx = (i: number) => padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
        const sy = (v: number) => padT + innerH - ((v - s.min) / (s.max - s.min || 1)) * innerH;
        const pts = s.data.map((d, i) => ({ cx: sx(i), cy: sy(d.y), v: d.y }));
        const path = pts.map((p, i) => `${i ? "L" : "M"}${p.cx},${p.cy}`).join(" ");
        const area = pts.length > 1 ? `${path} L${pts[pts.length - 1].cx},${padT + innerH} L${pts[0].cx},${padT + innerH} Z` : "";
        const gid = `ml-grad-${si}`;
        return (
          <g key={si}>
            <defs>
              <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {si === 0 && area && <motion.path d={area} fill={`url(#${gid})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />}
            <motion.path d={path} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: si * 0.15 }} />
            {pts.map((pt, i) => (
              <motion.circle key={i} cx={pt.cx} cy={pt.cy} r={3} fill={s.color} stroke="white" strokeWidth={1.2}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.04 + si * 0.1, type: "spring", stiffness: 240 }} />
            ))}
            {/* legend chip top corner */}
            <text x={si === 0 ? padL : w - padR} y={10} fontSize="9" textAnchor={si === 0 ? "start" : "end"} fill={s.color} fontWeight="800">{s.name}</text>
          </g>
        );
      })}

      {/* X tick labels — evenly sampled */}
      {(() => {
        if (xLabelsList.length === 0) return null;
        const total = xLabelsList.length;
        const target = Math.min(5, total);
        const out = [];
        for (let i = 0; i < target; i++) {
          const idx = Math.round((i / (target - 1 || 1)) * (total - 1));
          const x = padL + (total === 1 ? innerW / 2 : (idx / (total - 1)) * innerW);
          out.push(<text key={i} x={x} y={height - 9} fontSize="9" textAnchor="middle" fill="currentColor" opacity="0.55">{xLabelsList[idx]}</text>);
        }
        return out;
      })()}
    </svg>
  );
}

export function BarChart({ data, color = "var(--primary)", height = 170, yLabel }: { data: Point[]; color?: string; height?: number; yLabel?: string }) {
  const w = 320, padL = 34, padR = 12, padT = 14, padB = 28;
  const innerW = w - padL - padR, innerH = height - padT - padB;
  if (!data.length) return null;
  const rawMax = Math.max(...data.map((d) => d.y), 1);
  const max = rawMax * 1.1;
  const bw = innerW / data.length - 6;
  const ticks = [0, max * 0.5, max].map((v) => +v.toFixed(1));
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full">
      {/* Y grid + labels */}
      {ticks.map((t, i) => {
        const y = padT + innerH - (i / 2) * innerH;
        return (
          <g key={i}>
            <line x1={padL} x2={w - 4} y1={y} y2={y} stroke="currentColor" strokeOpacity={i === 0 ? 0.2 : 0.08} />
            <text x={padL - 5} y={y + 3} fontSize="8.5" textAnchor="end" fill="currentColor" opacity="0.55" fontWeight="700">{t}</text>
          </g>
        );
      })}
      {yLabel && <text x={6} y={padT - 3} fontSize="8" fill="currentColor" opacity="0.55">{yLabel}</text>}
      {data.map((d, i) => {
        const h = (d.y / max) * innerH;
        const x = padL + i * (bw + 6) + 3;
        const y = padT + innerH - h;
        return (
          <g key={i}>
            <motion.rect x={x} width={bw} rx={4} fill={color}
              initial={{ y: padT + innerH, height: 0 }}
              animate={{ y, height: h }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 180, damping: 20 }} />
            <text x={x + bw / 2} y={y - 4} fontSize="8" textAnchor="middle" fill="currentColor" opacity="0.7" fontWeight="700">{d.y}</text>
            <text x={x + bw / 2} y={height - 9} fontSize="9" textAnchor="middle" fill="currentColor" opacity="0.55">{d.x}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function RiskMeter({ value, min = 10, max = 40, color = "var(--primary)" }: { value: number; min?: number; max?: number; color?: string }) {
  const w = 300, h = 215;
  const cx = w / 2, cy = h - 38, r = 100;
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const angle = -Math.PI + pct * Math.PI;
  const nx = cx + Math.cos(angle) * (r - 6);
  const ny = cy + Math.sin(angle) * (r - 6);

  const zones = [
    { from: min, to: 18.5, c: "oklch(0.72 0.18 220)", label: "Under" },
    { from: 18.5, to: 25, c: "oklch(0.72 0.18 155)", label: "Healthy" },
    { from: 25, to: 30, c: "oklch(0.82 0.17 75)", label: "Over" },
    { from: 30, to: max, c: "oklch(0.65 0.24 25)", label: "Obese" },
  ];

  const pos = (v: number) => {
    const a = -Math.PI + ((v - min) / (max - min)) * Math.PI;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, a };
  };

  const seg = (from: number, to: number, c: string, key: string) => {
    const p1 = pos(from), p2 = pos(to);
    const active = value >= from && value <= to;
    return (
      <motion.path key={key} d={`M ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y}`}
        stroke={c} strokeWidth={active ? 20 : 14} fill="none" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: active ? 1 : 0.5 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={active ? { filter: `drop-shadow(0 0 8px ${c})` } : undefined} />
    );
  };

  const ticks: number[] = [];
  for (let v = min; v <= max; v += 5) ticks.push(v);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[320px]">
      <defs>
        <radialGradient id="meterGlow" cx="50%" cy="80%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r + 10} fill="url(#meterGlow)" />

      {/* Zone labels — outside the arc, clear of number */}
      {zones.map((z, i) => {
        const mid = (z.from + z.to) / 2;
        const a = -Math.PI + ((mid - min) / (max - min)) * Math.PI;
        const lx = cx + Math.cos(a) * (r + 26);
        const ly = cy + Math.sin(a) * (r + 26) + 3;
        const active = value >= z.from && value <= z.to;
        return (
          <text key={i} x={lx} y={ly} fontSize="9.5" textAnchor="middle"
            fill={z.c} fontWeight={active ? 900 : 700} opacity={active ? 1 : 0.85}
            style={active ? { filter: `drop-shadow(0 0 4px ${z.c})` } : undefined}>{z.label}</text>
        );
      })}

      {zones.map((z, i) => seg(z.from, z.to, z.c, `z${i}`))}

      {/* Numeric ticks — labels only on side bands so center stays clean */}
      {ticks.map((t, i) => {
        const a = -Math.PI + ((t - min) / (max - min)) * Math.PI;
        const x1 = cx + Math.cos(a) * (r - 18);
        const y1 = cy + Math.sin(a) * (r - 18);
        const x2 = cx + Math.cos(a) * (r - 24);
        const y2 = cy + Math.sin(a) * (r - 24);
        const lx = cx + Math.cos(a) * (r + 10);
        const ly = cy + Math.sin(a) * (r + 10) + 3;
        const inTopBand = a > -Math.PI + 0.25 && a < -0.25;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeOpacity="0.35" strokeWidth={1.2} />
            {!inTopBand && (
              <text x={lx} y={ly} fontSize="7.5" textAnchor="middle" fill="currentColor" opacity="0.55">{t}</text>
            )}
          </g>
        );
      })}

      {/* Needle + hub */}
      <motion.line x1={cx} y1={cy} x2={nx} y2={ny}
        initial={{ x2: cx + Math.cos(-Math.PI) * (r - 6), y2: cy + Math.sin(-Math.PI) * (r - 6) }}
        animate={{ x2: nx, y2: ny }}
        transition={{ type: "spring", stiffness: 70, damping: 12 }}
        stroke={color} strokeWidth={3.5} strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      <circle cx={cx} cy={cy} r={9} fill={color} />
      <circle cx={cx} cy={cy} r={4} fill="white" />

      {/* Value sits in the lower well — no overlap */}
      <text x={cx} y={cy - 18} fontSize="30" textAnchor="middle" fill="currentColor" fontWeight="900">{value.toFixed(1)}</text>
      <text x={cx} y={cy + 26} fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.6" letterSpacing="3" fontWeight="700">BMI INDEX</text>
    </svg>
  );
}

export function StackedCompareBar({ rows }: { rows: { label: string; value: number; target: number; color: string }[] }) {
  return (
    <div className="space-y-3">
      {rows.map((r, i) => {
        const pct = Math.min(100, Math.max(0, (r.value / r.target) * 100));
        return (
          <div key={i}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold">{r.label}</span>
              <span className="font-bold">{r.value} <span className="text-muted-foreground font-medium">/ {r.target}</span></span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.08, duration: 0.8 }}
                className="h-full rounded-full" style={{ background: r.color, boxShadow: `0 0 10px ${r.color}` }} />
              <div className="absolute inset-y-0 left-[100%] w-px bg-foreground/40 -translate-x-1/2" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RadarChart({ axes, values, color = "var(--primary)" }: { axes: string[]; values: number[]; color?: string }) {
  const w = 240, h = 220, cx = w / 2, cy = h / 2, r = 80;
  const n = axes.length;
  const angleOf = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const pt = (i: number, v: number) => {
    const a = angleOf(i);
    return { x: cx + Math.cos(a) * r * v, y: cy + Math.sin(a) * r * v };
  };
  const grid = [0.25, 0.5, 0.75, 1];
  const polyPts = values.map((v, i) => pt(i, Math.min(1, Math.max(0, v)))).map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[280px]">
      {grid.map((g, i) => {
        const pts = Array.from({ length: n }, (_, k) => pt(k, g)).map((p) => `${p.x},${p.y}`).join(" ");
        return <polygon key={i} points={pts} fill="none" stroke="currentColor" strokeOpacity={0.1} />;
      })}
      {axes.map((_, i) => {
        const p = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="currentColor" strokeOpacity={0.1} />;
      })}
      <motion.polygon points={polyPts} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={2}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }} />
      {values.map((v, i) => {
        const p = pt(i, Math.min(1, Math.max(0, v)));
        return <motion.circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} stroke="white" strokeWidth={1.4}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.06 }} />;
      })}
      {axes.map((a, i) => {
        const p = pt(i, 1.22);
        return <text key={i} x={p.x} y={p.y + 3} fontSize="9" textAnchor="middle" fill="currentColor" opacity={0.7} fontWeight={700}>{a}</text>;
      })}
    </svg>
  );
}

export function DonutChart({ value, max = 100, color = "var(--primary)", label, sub }: { value: number; max?: number; color?: string; label: string; sub?: string }) {
  const size = 140, stroke = 14, r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-32 h-32">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeOpacity="0.1" strokeWidth={stroke} fill="none" />
      <motion.circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct) }}
        transition={{ duration: 1, ease: "easeOut" }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 - 2} fontSize="22" textAnchor="middle" fill="currentColor" fontWeight="900">{Math.round(pct * 100)}%</text>
      <text x={size / 2} y={size / 2 + 16} fontSize="9" textAnchor="middle" fill="currentColor" opacity="0.6">{label}</text>
      {sub && <text x={size / 2} y={size / 2 + 28} fontSize="8" textAnchor="middle" fill="currentColor" opacity="0.5">{sub}</text>}
    </svg>
  );
}
