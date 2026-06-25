import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Calculator,
  Target,
  Flame,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Droplet,
  Footprints,
  Moon,
  Activity,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  bmiCategory,
  calcBMI,
  useHistory,
  useLastResult,
  useProfile,
  useActivities,
} from "@/lib/bmi-store";
import { LineChart, RiskMeter, DonutChart, MultiLineChart, BarChart } from "@/components/charts";

export const Route = createFileRoute("/_app/home")({ component: HomePage });

function HomePage() {
  const { profile, update } = useProfile();
  const { items, add } = useHistory();
  const { set } = useLastResult();
  const { items: acts } = useActivities();
  const navigate = useNavigate();

  const [weight, setWeight] = useState(profile.weight);
  const [height, setHeight] = useState(profile.height);
  const [age, setAge] = useState(profile.age);
  const [chartRange, setChartRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  const bmi = calcBMI(weight, height);
  const cat = bmiCategory(bmi);

  const rangedItems = useMemo(() => {
    if (chartRange === "all") return items;
    const days = chartRange === "7d" ? 7 : chartRange === "30d" ? 30 : 90;
    const cutoff = Date.now() - days * 86400e3;
    return items.filter((i) => new Date(i.date).getTime() >= cutoff);
  }, [items, chartRange]);

  const trend = useMemo(() => {
    const arr = [...rangedItems].slice(0, 30).reverse();
    return arr.map((e) => ({
      x: new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      y: e.bmi,
    }));
  }, [rangedItems]);

  const weightTrend = useMemo(() => {
    const arr = [...rangedItems].slice(0, 30).reverse();
    return arr.map((e) => ({
      x: new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      y: e.weight,
    }));
  }, [rangedItems]);

  const weekStart = Date.now() - 7 * 86400e3;
  const weekMin = acts
    .filter((a) => new Date(a.date).getTime() > weekStart)
    .reduce((s, a) => s + a.minutes, 0);
  const weekCal = acts
    .filter((a) => new Date(a.date).getTime() > weekStart)
    .reduce((s, a) => s + a.calories, 0);

  const ideal = useMemo(() => {
    const h = height / 100;
    return { lo: +(18.5 * h * h).toFixed(1), hi: +(24.9 * h * h).toFixed(1) };
  }, [height]);

  // weekday calorie bar (fake but data-driven from logged activities)
  const dayBars = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const out = days.map((d) => ({ x: d, y: 0 }));
    acts.forEach((a) => {
      const dt = new Date(a.date);
      const idx = (dt.getDay() + 6) % 7;
      out[idx].y += a.calories;
    });
    return out;
  }, [acts]);

  const handleCalc = () => {
    const entry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      weight,
      height,
      age,
      gender: profile.gender,
      bmi,
      category: cat.label,
    };
    add(entry);
    set(entry);
    update({ weight, height, age });
    navigate({ to: "/result" });
  };

  const streak = useMemo(() => {
    let s = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    const dates = new Set(items.map((i) => new Date(i.date).toDateString()));
    while (dates.has(cursor.toDateString())) {
      s++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return s;
  }, [items]);

  const RiskIcon = cat.risk === "danger" || cat.risk === "warn" ? AlertTriangle : ShieldCheck;

  return (
    <div className="space-y-5">
      {/* Hero with live theme — richer composition */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-3xl p-5 text-white shadow-glow ${cat.gradient}`}
      >
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-2xl animate-blob" />
        <div
          className="absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-white/10 blur-3xl animate-blob"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_55%)]" />

        <div className="relative flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest opacity-85 flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Live pulse ·{" "}
              {new Date().toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </p>
            <p className="font-display text-base mt-1 opacity-95">
              Hey <span className="font-bold">{profile.name.split(" ")[0] || "there"}</span> 👋
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <motion.h2
                key={bmi.toFixed(1)}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 16 }}
                className="font-display text-4xl font-black drop-shadow"
              >
                {bmi.toFixed(1)}
              </motion.h2>
              <span className="text-sm font-medium opacity-85">BMI · {cat.label}</span>
            </div>
            <p className="text-xs opacity-90 mt-1 leading-snug max-w-[220px]">{cat.message}</p>
          </div>
          <motion.div
            key={cat.key}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220 }}
            className="grid h-16 w-16 place-items-center rounded-2xl bg-white/25 backdrop-blur shrink-0 relative"
          >
            <RiskIcon className="h-8 w-8" />
            <motion.span
              className="absolute inset-0 rounded-2xl ring-2 ring-white/50"
              animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>

        {/* Quick stat strip */}
        <div className="relative mt-4 grid grid-cols-4 gap-2 text-center">
          {[
            { k: "Streak", v: `${streak}d`, i: Flame },
            { k: "Logs", v: items.length, i: Activity },
            { k: "Ideal", v: `${ideal.lo}-${ideal.hi}`, sub: "kg", i: Target },
            { k: "Goal", v: `${profile.targetWeight}`, sub: "kg", i: TrendingUp },
          ].map((s) => (
            <motion.div
              key={s.k}
              whileTap={{ scale: 0.92 }}
              className="rounded-xl bg-white/15 backdrop-blur p-2"
            >
              <s.i className="h-3.5 w-3.5 mx-auto opacity-90" />
              <p className="font-display font-black text-[13px] mt-1 leading-none">
                {s.v}
                <span className="text-[9px] font-medium opacity-80 ml-0.5">
                  {(s as any).sub || ""}
                </span>
              </p>
              <p className="text-[9px] uppercase tracking-wider opacity-80 mt-0.5">{s.k}</p>
            </motion.div>
          ))}
        </div>

        {/* Progress to goal */}
        <div className="relative mt-3">
          <div className="flex items-center justify-between text-[10px] font-semibold opacity-90">
            <span>Now {profile.weight}kg</span>
            <span>Target {profile.targetWeight}kg</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, Math.max(0, 100 - Math.abs(profile.weight - profile.targetWeight) * 5))}%`,
              }}
              transition={{ duration: 1 }}
              className="h-full rounded-full bg-white shadow-glow"
            />
          </div>
        </div>
      </motion.div>

      {/* Risk meter + Donut goal progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl bg-card p-4 shadow-soft text-foreground"
      >
        <div className="flex items-center justify-between mb-1">
          <p className="font-display font-bold">Live health snapshot</p>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${cat.gradient}`}
          >
            {cat.label}
          </span>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
          <div className="grid place-items-center">
            <RiskMeter value={bmi} color={cat.color} />
          </div>
          <DonutChart
            value={Math.min(
              100,
              Math.max(0, 100 - Math.abs(profile.weight - profile.targetWeight) * 5),
            )}
            label="Goal"
            sub={`${profile.targetWeight}kg`}
            color={cat.color}
          />
        </div>
        <div className="grid grid-cols-4 text-[10px] font-bold text-center pt-1">
          <span className="text-sky-500">Under</span>
          <span className="text-emerald-500">Healthy</span>
          <span className="text-amber-500">Over</span>
          <span className="text-rose-500">Obese</span>
        </div>
      </motion.div>

      {/* Daily wellness ring */}
      <div className="grid grid-cols-3 gap-3">
        <DailyTile
          icon={Droplet}
          label="Water"
          value="1.4L"
          sub="of 2L"
          grad="bg-gradient-ocean"
          pct={70}
        />
        <DailyTile
          icon={Footprints}
          label="Steps"
          value="6.2k"
          sub="of 8k"
          grad="bg-gradient-mint"
          pct={77}
        />
        <DailyTile
          icon={Moon}
          label="Sleep"
          value="7h 20m"
          sub="of 8h"
          grad="bg-gradient-sunset"
          pct={91}
        />
      </div>

      {/* Live calculator */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft space-y-4"
      >
        <div className="flex items-center justify-between">
          <p className="font-display font-bold">Quick calculator</p>
          <Link to="/calculator" className="text-xs font-bold text-primary flex items-center gap-1">
            Full version <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground font-medium">Height</p>
          <p className="font-display">
            <span className="text-3xl font-black">{height}</span>
            <span className="text-sm font-medium text-muted-foreground ml-1">cm</span>
          </p>
        </div>
        <input
          type="range"
          min={120}
          max={220}
          value={height}
          onChange={(e) => setHeight(+e.target.value)}
          className="w-full accent-primary"
        />

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Stepper
            label="Weight"
            unit="kg"
            value={weight}
            onChange={setWeight}
            min={20}
            max={250}
          />
          <Stepper label="Age" unit="yrs" value={age} onChange={setAge} min={1} max={120} />
        </div>
      </motion.div>

      {/* History compare chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="font-display font-bold">BMI vs weight</p>
          <Link to="/history" className="text-xs font-bold text-primary">
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-1 bg-secondary rounded-xl p-1 mb-3">
          {(["7d", "30d", "90d", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setChartRange(r)}
              className={`relative rounded-lg py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${chartRange === r ? "text-white" : "text-muted-foreground"}`}
            >
              {chartRange === r && (
                <motion.span
                  layoutId="home-chart-pill"
                  className={`absolute inset-0 rounded-lg ${cat.gradient}`}
                />
              )}
              <span className="relative">{r}</span>
            </button>
          ))}
        </div>
        {trend.length >= 1 ? (
          <MultiLineChart
            series={[
              { name: "BMI", color: cat.color, data: trend },
              { name: "kg", color: "var(--brand-2)", data: weightTrend },
            ]}
          />
        ) : (
          <p className="text-center text-xs text-muted-foreground py-8">
            No entries in this range. Try a longer window.
          </p>
        )}
      </motion.div>

      {/* Weekly cardio */}
      {dayBars.some((d) => d.y > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-card p-5 shadow-soft"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-bold">This week — calories burned</p>
            <span className="text-xs text-muted-foreground">
              {weekCal} kcal · {weekMin}m
            </span>
          </div>
          <BarChart data={dayBars} color={cat.color} />
        </motion.div>
      )}

      {/* Motivation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-fire p-5 text-white shadow-soft"
      >
        <Sparkles className="absolute right-4 top-4 h-12 w-12 opacity-25" />
        <p className="text-xs uppercase tracking-widest opacity-90">Today's mantra</p>
        <p className="font-display text-lg font-bold mt-1 leading-snug">
          "Small habits, when stacked daily, become your transformation."
        </p>
        <Link
          to="/tips"
          className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur"
        >
          Explore tips <ArrowRight className="h-3 w-3" />
        </Link>
      </motion.div>

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleCalc}
        className={`relative w-full overflow-hidden rounded-3xl py-5 text-white shadow-glow font-display text-lg font-bold flex items-center justify-center gap-2 ${cat.gradient}`}
      >
        <Calculator className="h-5 w-5" /> Calculate &amp; save
        <span className="absolute inset-0 shimmer opacity-40 pointer-events-none" />
      </motion.button>
    </div>
  );
}

function DailyTile({ icon: Icon, label, value, sub, grad, pct }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-3 text-white shadow-soft ${grad}`}
    >
      <Icon className="h-5 w-5 opacity-90" />
      <p className="font-display text-base font-black mt-1.5">{value}</p>
      <p className="text-[10px] uppercase tracking-wider opacity-90">
        {label} · {sub}
      </p>
      <div className="mt-2 h-1.5 w-full rounded-full bg-white/30 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9 }}
          className="h-full bg-white"
        />
      </div>
    </motion.div>
  );
}

function Stepper({ label, unit, value, onChange, min, max }: any) {
  return (
    <div className="rounded-2xl bg-secondary p-3">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="font-display mt-1">
        <span className="text-2xl font-black">{value}</span>
        <span className="text-xs text-muted-foreground ml-1">{unit}</span>
      </p>
      <div className="mt-2 flex justify-between gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="grid h-9 w-9 place-items-center rounded-xl bg-card active:scale-95"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-white shadow-glow active:scale-95"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
