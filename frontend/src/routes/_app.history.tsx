import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { Trash2, TrendingUp, History as HistoryIcon, Filter, CalendarDays, ArrowDown, ArrowUp, Activity, FileDown, X, Sparkles } from "lucide-react";
import { bmiCategory, useHistory, useProfile } from "@/lib/bmi-store";
import { LineChart, BarChart, MultiLineChart, RadarChart } from "@/components/charts";
import { generateBmiReport } from "@/lib/pdf-report";

export const Route = createFileRoute("/_app/history")({ component: HistoryPage });

type Range = "week" | "month" | "year";
type Filt = "all" | "healthy" | "under" | "over" | "obese";

const RANGE_DAYS: Record<Range, number> = { week: 7, month: 30, year: 365 };
const RANGE_LABEL: Record<Range, string> = { week: "Week", month: "Month", year: "Year" };

function HistoryPage() {
  const { items, remove, clear } = useHistory();
  const { profile } = useProfile();
  const [range, setRange] = useState<Range>("month");
  const [filt, setFilt] = useState<Filt>("all");
  const [cursor, setCursor] = useState(() => new Date());
  const [showPdf, setShowPdf] = useState(false);

  const filtered = useMemo(() => {
    const now = Date.now();
    const span = RANGE_DAYS[range];
    return items.filter((i) => {
      const ageDays = (now - new Date(i.date).getTime()) / 86400e3;
      if (ageDays > span) return false;
      if (filt === "all") return true;
      return bmiCategory(i.bmi).key === filt;
    });
  }, [items, range, filt]);

  const ordered = useMemo(() => [...filtered].reverse(), [filtered]);

  const bmiSeries = useMemo(() => ordered.map((e) => ({ x: new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }), y: e.bmi })), [ordered]);
  const weightSeries = useMemo(() => ordered.map((e) => ({ x: new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }), y: e.weight })), [ordered]);
  const goalSeries = useMemo(() => ordered.map((e, i) => ({ x: bmiSeries[i]?.x || "", y: 22 })), [ordered, bmiSeries]);

  const weeklyAvg = useMemo(() => {
    const buckets: Record<string, number[]> = {};
    filtered.forEach((e) => {
      const d = new Date(e.date);
      const k = `${d.getMonth() + 1}/${Math.ceil(d.getDate() / 7)}w`;
      (buckets[k] ||= []).push(e.bmi);
    });
    return Object.entries(buckets).slice(-6).map(([x, ys]) => ({ x, y: +(ys.reduce((a, b) => a + b, 0) / ys.length).toFixed(1) }));
  }, [filtered]);


  const stats = useMemo(() => {
    if (!filtered.length) return null;
    const bmis = filtered.map((i) => i.bmi);
    const ws = filtered.map((i) => i.weight);
    return {
      min: Math.min(...bmis).toFixed(1),
      max: Math.max(...bmis).toFixed(1),
      avg: (bmis.reduce((a, b) => a + b, 0) / bmis.length).toFixed(1),
      delta: ((filtered[0].bmi - filtered[filtered.length - 1].bmi)).toFixed(1),
      kgDelta: ((filtered[0].weight - filtered[filtered.length - 1].weight)).toFixed(1),
      maxKg: Math.max(...ws).toFixed(1),
      minKg: Math.min(...ws).toFixed(1),
    };
  }, [filtered]);

  // category distribution
  const distribution = useMemo(() => {
    const counts: Record<string, number> = { under: 0, healthy: 0, over: 0, obese: 0 };
    filtered.forEach((i) => counts[bmiCategory(i.bmi).key]++);
    const total = Math.max(1, filtered.length);
    return [
      { k: "under", label: "Under", pct: (counts.under / total) * 100, color: "bg-gradient-ocean" },
      { k: "healthy", label: "Healthy", pct: (counts.healthy / total) * 100, color: "bg-gradient-mint" },
      { k: "over", label: "Over", pct: (counts.over / total) * 100, color: "bg-gradient-sunset" },
      { k: "obese", label: "Obese", pct: (counts.obese / total) * 100, color: "bg-gradient-fire" },
    ];
  }, [filtered]);

  const cal = useMemo(() => {
    const y = cursor.getFullYear(), m = cursor.getMonth();
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const cells: { day: number | null; entry?: ReturnType<typeof bmiCategory>; bmi?: number }[] = [];
    for (let i = 0; i < first; i++) cells.push({ day: null });
    for (let d = 1; d <= days; d++) {
      const match = items.find((e) => {
        const dt = new Date(e.date);
        return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
      });
      cells.push({ day: d, entry: match ? bmiCategory(match.bmi) : undefined, bmi: match?.bmi });
    }
    return cells;
  }, [cursor, items]);

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-sunset p-5 text-white shadow-glow relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-80">Your journey</p>
            <h2 className="font-display text-2xl font-bold mt-1">{filtered.length} measurements</h2>
            <p className="text-xs opacity-90 mt-1">Avg BMI {stats?.avg ?? "—"} · Δ {stats?.delta ?? "0"}</p>
          </div>
          <TrendingUp className="h-10 w-10 opacity-80" />
        </div>
        {stats && (
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[
              { k: "Min", v: stats.min, i: ArrowDown },
              { k: "Max", v: stats.max, i: ArrowUp },
              { k: "Min kg", v: stats.minKg, i: ArrowDown },
              { k: "Max kg", v: stats.maxKg, i: ArrowUp },
            ].map((s) => (
              <div key={s.k} className="rounded-xl bg-white/15 backdrop-blur p-2">
                <s.i className="h-3.5 w-3.5 mx-auto opacity-90" />
                <p className="font-display font-black text-sm mt-0.5">{s.v}</p>
                <p className="text-[9px] uppercase opacity-80">{s.k}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card p-3 shadow-soft space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Filter className="h-3.5 w-3.5" /> Range</div>
          <button onClick={() => setShowPdf(true)}
            className="flex items-center gap-1.5 rounded-full bg-gradient-brand px-3 py-1.5 text-[11px] font-bold text-white shadow-glow active:scale-95">
            <FileDown className="h-3.5 w-3.5" /> PDF Report
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-secondary rounded-xl p-1">
          {(["week", "month", "year"] as Range[]).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`relative rounded-lg py-2 text-xs font-bold capitalize transition ${range === r ? "text-white" : "text-muted-foreground"}`}>
              {range === r && <motion.span layoutId="range-pill" className="absolute inset-0 rounded-lg bg-gradient-brand" />}
              <span className="relative">{RANGE_LABEL[r]}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(["all", "healthy", "under", "over", "obese"] as Filt[]).map((f) => (
            <button key={f} onClick={() => setFilt(f)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold capitalize transition ${filt === f ? "bg-gradient-brand text-white shadow-soft" : "bg-secondary text-muted-foreground"}`}>{f}</button>
          ))}
        </div>
      </motion.div>

      {/* Multi-series chart */}
      {bmiSeries.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-1">
            <p className="font-display font-bold">BMI · weight · goal</p>
            <div className="flex gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> BMI</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "var(--brand-2)" }} /> kg</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Goal</span>
            </div>
          </div>
          <MultiLineChart series={[
            { name: "BMI", color: "var(--primary)", data: bmiSeries },
            { name: "kg",  color: "var(--brand-2)", data: weightSeries },
            { name: "ideal", color: "var(--success)", data: goalSeries },
          ]} />
        </motion.div>
      )}

      {/* Solo BMI */}
      {bmiSeries.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-card p-5 shadow-soft">
          <p className="font-display font-bold mb-1">BMI over time</p>
          <LineChart data={bmiSeries} />
        </motion.div>
      )}

      {/* Weekly avg */}
      {weeklyAvg.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-card p-5 shadow-soft">
          <p className="font-display font-bold mb-1">Weekly avg comparison</p>
          <BarChart data={weeklyAvg} color="var(--brand-2)" />
        </motion.div>
      )}

      {/* Distribution */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft">
        <p className="font-display font-bold mb-3 flex items-center gap-2"><Activity className="h-4 w-4" /> Category distribution</p>
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-secondary">
          {distribution.map((d, i) => (
            <motion.div key={d.k} className={d.color}
              initial={{ width: 0 }} animate={{ width: `${d.pct}%` }}
              transition={{ delay: 0.1 * i, duration: 0.8 }} />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {distribution.map((d) => (
            <div key={d.k} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${d.color}`} />
              <span className="font-semibold capitalize">{d.label}</span>
              <span className="ml-auto font-bold">{d.pct.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Health radar */}
      {filtered.length > 0 && (() => {
        const avgBmi = filtered.reduce((a, b) => a + b.bmi, 0) / filtered.length;
        const avgW = filtered.reduce((a, b) => a + b.weight, 0) / filtered.length;
        const consistency = Math.min(1, filtered.length / 14);
        const proximity = Math.max(0, 1 - Math.abs(avgBmi - 22) / 10);
        const stability = Math.max(0, 1 - (Math.max(...filtered.map((i) => i.bmi)) - Math.min(...filtered.map((i) => i.bmi))) / 8);
        const target = profile.targetWeight ? Math.max(0, 1 - Math.abs(avgW - profile.targetWeight) / 20) : 0.5;
        const trend = filtered.length > 1
          ? Math.max(0, 1 - Math.abs(filtered[filtered.length - 1].bmi - filtered[0].bmi) / 5)
          : 0.5;
        return (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-card p-5 shadow-soft">
            <p className="font-display font-bold mb-1 flex items-center gap-2"><Sparkles className="h-4 w-4" /> Health profile</p>
            <p className="text-xs text-muted-foreground mb-2">5-axis comparison vs ideal</p>
            <div className="grid place-items-center">
              <RadarChart axes={["Healthy", "Stable", "On-Goal", "Steady", "Logged"]}
                values={[proximity, stability, target, trend, consistency]}
                color={bmiCategory(avgBmi).color} />
            </div>
          </motion.div>
        );
      })()}


      {/* Calendar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="grid h-8 w-8 place-items-center rounded-xl bg-secondary">‹</button>
          <p className="font-display font-bold flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </p>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="grid h-8 w-8 place-items-center rounded-xl bg-secondary">›</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cal.map((c, i) => (
            <div key={i} className="aspect-square">
              {c.day && (
                <motion.div whileTap={{ scale: 0.9 }}
                  className={`relative grid h-full w-full place-items-center rounded-lg text-[11px] font-bold ${c.entry ? `${c.entry.gradient} text-white shadow-soft` : "bg-secondary text-muted-foreground"}`}
                  title={c.bmi ? `BMI ${c.bmi}` : undefined}>
                  {c.day}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-card p-10 text-center shadow-soft">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary mb-3">
            <HistoryIcon className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-display font-bold text-lg">No readings</p>
          <p className="text-sm text-muted-foreground mt-1">Adjust filters or add a measurement.</p>
        </div>
      ) : (
        <>
          <button onClick={clear} className="text-xs text-destructive font-semibold ml-auto block">Clear all</button>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {filtered.map((it, i) => {
                const cat = bmiCategory(it.bmi);
                return (
                  <motion.div key={it.id} layout
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50, scale: 0.9 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
                    <div className={`grid h-14 w-14 place-items-center rounded-2xl text-white ${cat.gradient}`}>
                      <span className="font-display text-lg font-black">{it.bmi}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{cat.label}</p>
                      <p className="text-xs text-muted-foreground">{new Date(it.date).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      <p className="text-xs text-muted-foreground">{it.weight}kg · {it.height}cm</p>
                    </div>
                    <button onClick={() => remove(it.id)}
                      className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/10 text-destructive active:scale-95">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}

      <AnimatePresence>
        {showPdf && (
          <PdfModal
            onClose={() => setShowPdf(false)}
            onGenerate={(from, to, label) => {
              generateBmiReport({ profile, entries: items, range: { from, to, label } });
              setShowPdf(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PdfModal({ onClose, onGenerate }: { onClose: () => void; onGenerate: (from: Date, to: Date, label: string) => void }) {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const [preset, setPreset] = useState<"week" | "month" | "quarter" | "year" | "all" | "custom">("month");
  const [from, setFrom] = useState(iso(new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())));
  const [to, setTo] = useState(iso(today));

  const presets = [
    { k: "week", label: "Last week", days: 7 },
    { k: "month", label: "Last month", days: 30 },
    { k: "quarter", label: "Last 3 months", days: 90 },
    { k: "year", label: "Last year", days: 365 },
    { k: "all", label: "All time", days: 36500 },
    { k: "custom", label: "Custom range", days: 0 },
  ] as const;

  const submit = () => {
    if (preset === "custom") {
      const f = new Date(from), t = new Date(to);
      t.setHours(23, 59, 59);
      onGenerate(f, t, "Custom");
      return;
    }
    const p = presets.find((x) => x.k === preset)!;
    const f = new Date(); f.setDate(f.getDate() - p.days); f.setHours(0, 0, 0);
    onGenerate(f, new Date(), p.label);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-md p-5">
      <motion.div onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.6, y: 30, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.7, y: 20 }}
        transition={{ type: "spring", stiffness: 230, damping: 22 }}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-card shadow-glow">
        <div className="relative p-5 text-white bg-gradient-brand">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <button onClick={onClose}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/20 active:scale-95">
            <X className="h-4 w-4" />
          </button>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/25 backdrop-blur mb-2">
            <FileDown className="h-6 w-6" />
          </div>
          <p className="font-display text-xl font-bold">Generate PDF report</p>
          <p className="text-xs opacity-90 mt-1">Pick the time period you want included.</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button key={p.k} onClick={() => setPreset(p.k)}
                className={`relative rounded-2xl p-3 text-left text-sm font-bold transition active:scale-95 ${preset === p.k ? "bg-gradient-brand text-white shadow-glow" : "bg-secondary text-foreground"}`}>
                {p.label}
              </button>
            ))}
          </div>
          <AnimatePresence>
            {preset === "custom" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-2 overflow-hidden">
                <label className="text-xs font-semibold space-y-1">
                  <span className="block text-muted-foreground">From</span>
                  <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                    className="w-full rounded-xl bg-secondary px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold space-y-1">
                  <span className="block text-muted-foreground">To</span>
                  <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                    className="w-full rounded-xl bg-secondary px-3 py-2 text-sm" />
                </label>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button whileTap={{ scale: 0.96 }} onClick={submit}
            className="relative w-full overflow-hidden rounded-2xl bg-gradient-fire py-3 text-white font-bold shadow-glow flex items-center justify-center gap-2">
            <FileDown className="h-4 w-4" /> Download report
          </motion.button>
          <p className="text-[10px] text-center text-muted-foreground">Includes profile, summary, BMI &amp; weight charts, distribution and full table.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

