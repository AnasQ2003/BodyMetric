import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  Target,
  TrendingDown,
  TrendingUp,
  Minus,
  Flag,
  Calendar,
  Flame,
  Droplet,
  Footprints,
  Apple,
  ArrowRight,
  Trophy,
} from "lucide-react";
import {
  bmiCategory,
  calcBMI,
  useActivities,
  useHistory,
  useProfile,
  suggestGoalWeight,
} from "@/lib/bmi-store";
import { DonutChart } from "@/components/charts";

export const Route = createFileRoute("/_app/goals")({ component: GoalsPage });

function GoalsPage() {
  const { profile, update } = useProfile();
  const { items } = useHistory();
  const { items: acts } = useActivities();

  const bmi = calcBMI(profile.weight, profile.height);
  const cat = bmiCategory(bmi);
  const suggested = suggestGoalWeight({
    height: profile.height,
    goal: profile.goal,
    weight: profile.weight,
  });
  const diff = +(profile.weight - profile.targetWeight).toFixed(1);

  const { weeks, calDelta, milestones, pct } = useMemo(() => {
    const weeks = Math.max(1, Math.ceil(Math.abs(diff) / 0.5));
    const calDelta = Math.round((Math.abs(diff) * 7700) / (weeks * 7)); // kcal/day adjust
    const startW = items.length ? items[items.length - 1].weight : profile.weight;
    const span = startW - profile.targetWeight;
    const progressed = startW - profile.weight;
    const pct =
      span === 0 ? 100 : Math.min(100, Math.max(0, Math.round((progressed / span) * 100)));
    const steps = 4;
    const milestones = Array.from({ length: steps }, (_, i) => {
      const ratio = (i + 1) / steps;
      const weightAt = +(startW - span * ratio).toFixed(1);
      const reached = pct >= ratio * 100;
      return { label: `Milestone ${i + 1}`, weightAt, reached };
    });
    return { weeks, calDelta, milestones, pct };
  }, [diff, items, profile.weight, profile.targetWeight]);

  const etaDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weeks * 7);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }, [weeks]);

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-3xl p-5 text-white shadow-glow ${cat.gradient}`}
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <p className="text-xs uppercase tracking-widest opacity-80">Your goal</p>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h2 className="font-display text-3xl font-black">{profile.targetWeight} kg</h2>
            <p className="text-sm opacity-90 mt-1">
              {diff > 0
                ? `Lose ${diff} kg`
                : diff < 0
                  ? `Gain ${Math.abs(diff)} kg`
                  : "You're at target 🎉"}
            </p>
          </div>
          <DonutChart value={pct} label="Progress" color="white" />
        </div>
        <div className="mt-4 h-2.5 w-full rounded-full bg-white/25 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-white"
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { k: "ETA", v: `${weeks}w`, i: Calendar },
            { k: "On", v: etaDate.split(",")[0], i: Flag },
            { k: diff > 0 ? "Deficit" : "Surplus", v: `${calDelta}`, i: Flame },
          ].map((s) => (
            <div key={s.k} className="rounded-xl bg-white/15 backdrop-blur p-2">
              <s.i className="h-4 w-4 mx-auto opacity-90" />
              <p className="font-display font-black text-sm mt-1">{s.v}</p>
              <p className="text-[9px] uppercase tracking-wider opacity-80">{s.k}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Goal type */}
      <div>
        <p className="font-display font-bold mb-2 text-sm">Pick a goal direction</p>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              {
                k: "lose",
                icon: TrendingDown,
                label: "Lose",
                grad: "bg-gradient-sunset",
                desc: "0.5kg/wk",
              },
              {
                k: "maintain",
                icon: Minus,
                label: "Maintain",
                grad: "bg-gradient-mint",
                desc: "Hold steady",
              },
              {
                k: "gain",
                icon: TrendingUp,
                label: "Gain",
                grad: "bg-gradient-ocean",
                desc: "Lean mass",
              },
            ] as const
          ).map((g) => {
            const active = profile.goal === g.k;
            return (
              <motion.button
                key={g.k}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const t = suggestGoalWeight({
                    height: profile.height,
                    goal: g.k,
                    weight: profile.weight,
                  });
                  update({ goal: g.k, targetWeight: t });
                }}
                className={`rounded-2xl p-3 shadow-soft transition ${active ? g.grad + " text-white ring-2 ring-white/60" : "bg-card text-foreground"}`}
              >
                <g.icon className="h-5 w-5 mx-auto" />
                <p className="font-display font-bold mt-1 text-sm">{g.label}</p>
                <p
                  className={`text-[10px] mt-0.5 ${active ? "opacity-90" : "text-muted-foreground"}`}
                >
                  {g.desc}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Daily targets */}
      <div>
        <p className="font-display font-bold mb-2 text-sm">Your daily targets</p>
        <div className="grid grid-cols-2 gap-3">
          <DailyGoal
            icon={Flame}
            label="Calories"
            v={`${2000 + (diff > 0 ? -calDelta : calDelta)}`}
            sub="kcal/day"
            grad="bg-gradient-fire"
          />
          <DailyGoal icon={Droplet} label="Water" v="2L" sub="hydration" grad="bg-gradient-ocean" />
          <DailyGoal
            icon={Footprints}
            label="Steps"
            v={diff > 0 ? "10 000" : "7 000"}
            sub="movement"
            grad="bg-gradient-mint"
          />
          <DailyGoal
            icon={Apple}
            label="Protein"
            v={`${Math.round(profile.weight * 1.6)}g`}
            sub="1.6 g/kg"
            grad={cat.gradient}
          />
        </div>
      </div>

      {/* Milestone timeline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft"
      >
        <p className="font-display font-bold flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-amber-500" /> Milestones
        </p>
        <ol className="relative border-l-2 border-dashed border-border pl-4 space-y-3">
          {milestones.map((m, i) => (
            <li key={i} className="relative">
              <span
                className={`absolute -left-[22px] top-0.5 grid h-5 w-5 place-items-center rounded-full text-white text-[10px] font-black ${m.reached ? cat.gradient : "bg-secondary text-muted-foreground"}`}
              >
                {i + 1}
              </span>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{m.label}</p>
                <p
                  className={`text-xs font-bold ${m.reached ? "text-emerald-500" : "text-muted-foreground"}`}
                >
                  {m.weightAt} kg
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {m.reached ? "✓ Reached" : "Upcoming"}
              </p>
            </li>
          ))}
        </ol>
      </motion.div>

      {/* Suggested target */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft space-y-3"
      >
        <p className="font-display font-bold flex items-center gap-2">
          <Flag className="h-4 w-4" /> Suggested target
        </p>
        <p className="text-sm text-muted-foreground">
          Healthy ideal for your height:{" "}
          <span className="font-bold text-foreground">{suggested} kg</span>
        </p>
        <button
          onClick={() => update({ targetWeight: suggested })}
          className={`w-full rounded-2xl py-3 font-display font-bold text-white shadow-glow active:scale-95 ${cat.gradient}`}
        >
          Use suggested target
        </button>
      </motion.div>

      {/* Manual adjust */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft"
      >
        <div className="flex items-center justify-between">
          <p className="font-display font-bold flex items-center gap-2">
            <Target className="h-4 w-4" /> Fine-tune target
          </p>
          <p className="font-display font-black text-lg">{profile.targetWeight} kg</p>
        </div>
        <input
          type="range"
          min={30}
          max={200}
          value={profile.targetWeight}
          onChange={(e) => update({ targetWeight: +e.target.value })}
          className="w-full mt-3 accent-primary"
        />
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>30 kg</span>
          <span>200 kg</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/calculator"
          className="flex items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-sm font-semibold active:scale-95"
        >
          Full calculator <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/tips"
          className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white shadow-glow active:scale-95 ${cat.gradient}`}
        >
          Get tips <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="rounded-3xl bg-card p-5 shadow-soft text-sm text-muted-foreground">
        <p className="font-display font-bold text-foreground mb-1">Activity summary</p>
        <p>
          {acts.length} logged activities · {acts.reduce((s, a) => s + a.minutes, 0)} total minutes
        </p>
      </div>
    </div>
  );
}

function DailyGoal({ icon: Icon, label, v, sub, grad }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-3 text-white shadow-soft ${grad}`}
    >
      <Icon className="h-5 w-5 opacity-90" />
      <p className="font-display text-lg font-black mt-1">{v}</p>
      <p className="text-[10px] uppercase tracking-wider opacity-90">{label}</p>
      <p className="text-[9px] opacity-75">{sub}</p>
    </motion.div>
  );
}
