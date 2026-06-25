import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Share2,
  RotateCcw,
  Target,
  Flame,
  Apple,
  Dumbbell,
  Ruler,
  Activity,
  Heart,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { bmiCategory, calcBMI, useLastResult, useProfile, useHistory } from "@/lib/bmi-store";
import { RiskMeter, BarChart, DonutChart } from "@/components/charts";

export const Route = createFileRoute("/_app/result")({ component: ResultPage });

function ResultPage() {
  const { last } = useLastResult();
  const { profile } = useProfile();
  const { items } = useHistory();

  const [weight, setWeight] = useState(last?.weight ?? profile.weight);
  const [height, setHeight] = useState(last?.height ?? profile.height);

  useEffect(() => {
    if (last) {
      setWeight(last.weight);
      setHeight(last.height);
    }
  }, [last]);

  const bmi = calcBMI(weight, height);
  const cat = bmiCategory(bmi);
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const from = animated,
      to = bmi;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 500);
      setAnimated(+(from + (to - from) * (1 - Math.pow(1 - p, 3))).toFixed(2));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line
  }, [bmi]);

  const { calories, ideal, weightDelta, healthScore, weeksToGoal } = useMemo(() => {
    const s = profile.gender === "male" ? 5 : -161;
    const bmr = 10 * weight + 6.25 * height - 5 * profile.age + s;
    const mult =
      profile.activityLevel === "high" ? 1.55 : profile.activityLevel === "low" ? 1.2 : 1.375;
    const tdee = Math.round(bmr * mult);
    const h = height / 100;
    const idealLo = +(18.5 * h * h).toFixed(1);
    const idealHi = +(24.9 * h * h).toFixed(1);
    const target = profile.targetWeight;
    const delta = +(weight - target).toFixed(1);
    // 0.5kg/week = ~500kcal/day deficit
    const weeksToGoal = Math.abs(delta) > 0 ? Math.ceil(Math.abs(delta) / 0.5) : 0;
    // Crude health score 0–100
    let score = 100 - Math.min(40, Math.abs(bmi - 22) * 4);
    score = Math.max(0, Math.round(score));
    return {
      calories: tdee,
      ideal: { lo: idealLo, hi: idealHi },
      weightDelta: delta,
      healthScore: score,
      weeksToGoal,
    };
  }, [weight, height, profile]);

  const compare = items
    .slice(0, 6)
    .reverse()
    .map((e) => ({
      x: new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      y: e.bmi,
    }));

  if (!last) {
    return (
      <div className="rounded-3xl bg-card p-6 text-center shadow-soft">
        <p className="text-muted-foreground">No result yet. Calculate first!</p>
        <Link
          to="/home"
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-brand px-4 py-2 text-white font-medium"
        >
          Go to Calculator <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const pct = Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100));
  const advice = adviceFor(cat.key);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <motion.div
        key={cat.key}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-glow ${cat.gradient}`}
      >
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-2xl animate-blob" />
        <p className="text-xs uppercase tracking-widest opacity-80">Your BMI today</p>
        <div className="mt-3 flex items-end gap-3">
          <motion.p className="font-display text-7xl font-black leading-none">
            {animated.toFixed(1)}
          </motion.p>
          <span className="mb-2 rounded-full bg-white/25 px-3 py-1 text-xs font-bold backdrop-blur">
            {cat.label}
          </span>
        </div>
        <div className="mt-6 h-3 w-full rounded-full bg-white/25 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6 }}
            className="h-full bg-white"
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-medium opacity-80">
          <span>Under</span>
          <span>Healthy</span>
          <span>Over</span>
          <span>Obese</span>
        </div>

        {/* Score chips */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { l: "Health score", v: `${healthScore}`, s: "/100" },
            { l: "Ideal", v: `${ideal.lo}-${ideal.hi}`, s: "kg" },
            {
              l: weightDelta > 0 ? "To lose" : weightDelta < 0 ? "To gain" : "On target",
              v: `${Math.abs(weightDelta)}`,
              s: "kg",
            },
          ].map((s) => (
            <div key={s.l} className="rounded-xl bg-white/15 backdrop-blur p-2 text-center">
              <p className="font-display font-black text-base">
                {s.v}
                <span className="text-[10px] opacity-80 ml-0.5">{s.s}</span>
              </p>
              <p className="text-[9px] uppercase tracking-wider opacity-80">{s.l}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Risk meter + health score donut */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft"
      >
        <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
          <div className="grid place-items-center">
            <RiskMeter value={bmi} color={cat.color} />
          </div>
          <DonutChart value={healthScore} label="Health" color={cat.color} />
        </div>
      </motion.div>

      {/* Live tune */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft space-y-3"
      >
        <p className="font-display font-bold">Tune your inputs live</p>
        <div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Weight</span>
            <span className="font-bold">{weight} kg</span>
          </div>
          <input
            type="range"
            min={20}
            max={250}
            value={weight}
            onChange={(e) => setWeight(+e.target.value)}
            className="w-full accent-primary"
          />
        </div>
        <div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Height</span>
            <span className="font-bold">{height} cm</span>
          </div>
          <input
            type="range"
            min={120}
            max={220}
            value={height}
            onChange={(e) => setHeight(+e.target.value)}
            className="w-full accent-primary"
          />
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Flame,
            label: "Calories",
            value: calories,
            sub: "kcal/day",
            grad: "bg-gradient-fire",
          },
          {
            icon: Target,
            label: "Target",
            value: `${profile.targetWeight}kg`,
            sub: `${weeksToGoal}w to go`,
            grad: "bg-gradient-mint",
          },
          {
            icon: Apple,
            label: "Goal",
            value: profile.goal,
            sub: profile.activityLevel,
            grad: "bg-gradient-ocean",
          },
          {
            icon: Ruler,
            label: "Range",
            value: `${ideal.lo}-${ideal.hi}`,
            sub: "kg ideal",
            grad: cat.gradient,
          },
          {
            icon: Activity,
            label: "BMR",
            value: Math.round(
              calories /
                (profile.activityLevel === "high"
                  ? 1.55
                  : profile.activityLevel === "low"
                    ? 1.2
                    : 1.375),
            ),
            sub: "rest kcal",
            grad: "bg-gradient-sunset",
          },
          {
            icon: Heart,
            label: "Risk",
            value: cat.risk,
            sub: cat.label,
            grad: "bg-gradient-brand",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`relative overflow-hidden rounded-2xl p-3 text-white shadow-soft ${s.grad}`}
          >
            <s.icon className="h-5 w-5 opacity-90" />
            <p className="font-display text-base font-black mt-1.5 capitalize leading-tight">
              {s.value}
            </p>
            <p className="text-[10px] uppercase tracking-wider opacity-90">{s.label}</p>
            <p className="text-[9px] opacity-75 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Plan / advice */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft"
      >
        <p className="font-display font-bold flex items-center gap-2 mb-3">
          <Dumbbell className="h-4 w-4" /> Your action plan
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{cat.message}</p>
        <ol className="space-y-2.5">
          {advice.map((a, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-white text-xs font-black ${cat.gradient}`}
              >
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-sm">{a.title}</p>
                <p className="text-xs text-muted-foreground leading-snug">{a.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link
          to="/tips"
          className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-primary"
        >
          See all personalized tips <ArrowRight className="h-3 w-3" />
        </Link>
      </motion.div>

      {/* Risk facts */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-5 text-white shadow-soft ${cat.risk === "safe" ? "bg-gradient-mint" : cat.risk === "watch" ? "bg-gradient-ocean" : cat.risk === "warn" ? "bg-gradient-sunset" : "bg-gradient-fire"}`}
      >
        <p className="font-display font-bold flex items-center gap-2">
          {cat.risk === "safe" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}{" "}
          Risk profile
        </p>
        <p className="text-sm opacity-90 mt-1 leading-snug">{riskCopy(cat.key)}</p>
      </motion.div>

      {/* Comparison */}
      {compare.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-card p-5 shadow-soft"
        >
          <p className="font-display font-bold mb-2 flex items-center gap-2">
            {weightDelta < 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            )}
            Recent comparison
          </p>
          <BarChart data={compare} color={cat.color} />
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/home"
          className="flex items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-sm font-semibold active:scale-95"
        >
          <RotateCcw className="h-4 w-4" /> Recalc
        </Link>
        <button
          className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white shadow-glow active:scale-95 ${cat.gradient}`}
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>
    </div>
  );
}

function adviceFor(key: string) {
  const map: Record<string, { title: string; body: string }[]> = {
    under: [
      { title: "Add 300–500 kcal/day", body: "Lean meats, nuts, oats, dairy. Don't skip meals." },
      {
        title: "Strength train 3×/week",
        body: "Compound lifts build healthy mass faster than cardio.",
      },
      { title: "Track weekly", body: "Aim for ~0.25–0.5 kg/week gain. Faster is mostly fat." },
    ],
    healthy: [
      { title: "Maintain protein at 1.6 g/kg", body: "Preserves muscle and steadies satiety." },
      { title: "150 min cardio + 2 strength", body: "WHO weekly minimum for long-term health." },
      { title: "Sleep & stress", body: "Both regulate weight more than most diets." },
    ],
    over: [
      { title: "300–500 kcal deficit", body: "Cut sugary drinks first; biggest, easiest win." },
      { title: "10 000 daily steps", body: "Compounding NEAT moves the scale steadily." },
      { title: "Protein 1.6–2 g/kg", body: "Keeps muscle while you drop fat." },
    ],
    obese: [
      { title: "See a clinician", body: "Personalized plan reduces metabolic risk faster." },
      { title: "Walk after every meal", body: "Lowers glucose spikes meaningfully." },
      {
        title: "Build sustainable swaps",
        body: "Replace, don't restrict — focus on 80% adherence.",
      },
    ],
  };
  return map[key];
}

function riskCopy(key: string) {
  switch (key) {
    case "under":
      return "Higher chance of nutrient deficiency, low bone density and immune issues.";
    case "healthy":
      return "Lowest baseline risk for metabolic disease. Keep building the habits.";
    case "over":
      return "Elevated risk for type-2 diabetes, hypertension and joint stress.";
    default:
      return "Significantly higher cardiometabolic risk. Small, daily wins compound — start today.";
  }
}
