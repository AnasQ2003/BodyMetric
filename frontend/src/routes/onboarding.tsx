import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  User,
  UserRound,
  Ruler,
  Weight,
  Cake,
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Flame,
  Leaf,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Activity,
  Heart,
} from "lucide-react";
import { useProfile, suggestGoalWeight } from "@/lib/bmi-store";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const stepThemes = [
  { from: "#a78bfa", to: "#ec4899", name: "Identity" },
  { from: "#f59e0b", to: "#ef4444", name: "Age" },
  { from: "#06b6d4", to: "#3b82f6", name: "Height" },
  { from: "#10b981", to: "#22d3ee", name: "Weight" },
  { from: "#f43f5e", to: "#8b5cf6", name: "Goal" },
];

function Onboarding() {
  const { profile, update } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState({
    gender: profile.gender,
    age: profile.age,
    height: profile.height,
    weight: profile.weight,
    goal: profile.goal,
    activityLevel: profile.activityLevel,
  });

  const steps = [
    { title: "Who are you?", subtitle: "Tell us a bit about yourself", icon: Sparkles },
    { title: "How old are you?", subtitle: "Age helps tailor your metrics", icon: Cake },
    { title: "Your height", subtitle: "Stretch up — measure tall", icon: Ruler },
    { title: "Your weight", subtitle: "Just a starting point", icon: Weight },
    { title: "Your goal", subtitle: "What are we working toward?", icon: Target },
  ];

  const theme = stepThemes[step];

  const finish = () => {
    const target = suggestGoalWeight({ height: data.height, goal: data.goal, weight: data.weight });
    update({ ...data, targetWeight: target, onboarded: true });
    navigate({ to: "/home" });
  };

  const next = () => {
    setDir(1);
    if (step === steps.length - 1) {
      finish();
    } else {
      setStep(step + 1);
    }
  };
  const back = () => {
    if (step > 0) {
      setDir(-1);
      setStep(step - 1);
    }
  };

  const Icon = steps[step].icon;

  return (
    <div className="relative h-full overflow-hidden bg-background">
      {/* Animated themed background */}
      <AnimatePresence mode="sync">
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -left-24 h-80 w-80 rounded-full opacity-40 blur-3xl"
            style={{ background: `radial-gradient(circle, ${theme.from}, transparent 70%)` }}
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 right-0 h-96 w-96 rounded-full opacity-40 blur-3xl"
            style={{ background: `radial-gradient(circle, ${theme.to}, transparent 70%)` }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full opacity-20 blur-3xl"
            style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Floating sparkles */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{
              background: i % 2 ? theme.from : theme.to,
              left: `${(i * 13) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      <div className="mx-auto flex h-full max-w-md flex-col px-5 pt-12 pb-8">
        {/* Top navigation bar */}
        <div className="flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={back}
            className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-secondary-foreground shadow-soft"
            disabled={step === 0}
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate({ to: "/auth" })}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition"
          >
            Skip to login
          </motion.button>
        </div>

        {/* Progress dots */}
        <div className="mt-4 flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary/60 backdrop-blur"
            >
              <motion.div
                initial={false}
                animate={{ width: i < step ? "100%" : i === step ? "60%" : "0%" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${theme.from}, ${theme.to})` }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="mt-4 flex items-center gap-3">
          <motion.div
            key={step}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 15 }}
            className="relative grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
              boxShadow: `0 10px 30px -8px ${theme.to}`,
            }}
          >
            <Icon className="h-7 w-7" />
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{ boxShadow: [`0 0 0 0px ${theme.from}40`, `0 0 0 12px ${theme.from}00`] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <div className="flex-1 overflow-hidden">
            <p
              className="text-[10px] uppercase tracking-[0.2em] font-bold"
              style={{ color: theme.from }}
            >
              Step {step + 1} / {steps.length} · {theme.name}
            </p>
            <motion.h2
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-display text-2xl font-bold"
            >
              {steps[step].title}
            </motion.h2>
            <motion.p
              key={`${step}-sub`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xs text-muted-foreground"
            >
              {steps[step].subtitle}
            </motion.p>
          </div>
        </div>

        {/* Step body */}
        <div className="relative mt-4 flex-1">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: dir * -60, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {step === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { k: "male", label: "Male", Icon: User, from: "#3b82f6", to: "#06b6d4" },
                      {
                        k: "female",
                        label: "Female",
                        Icon: UserRound,
                        from: "#ec4899",
                        to: "#f43f5e",
                      },
                    ] as const
                  ).map((g) => {
                    const active = data.gender === g.k;
                    return (
                      <motion.button
                        key={g.k}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setData({ ...data, gender: g.k })}
                        className="relative overflow-hidden rounded-3xl p-6 text-left shadow-soft"
                        style={
                          active
                            ? {
                                background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                                color: "white",
                                boxShadow: `0 15px 40px -10px ${g.to}`,
                              }
                            : { background: "var(--card)" }
                        }
                      >
                        {active && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/20 blur-2xl"
                          />
                        )}
                        <g.Icon className="h-10 w-10" />
                        <p className="mt-3 font-display text-xl font-bold">{g.label}</p>
                        {active && (
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-full bg-white/30 backdrop-blur"
                          >
                            <Check className="h-4 w-4" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {step === 1 && (
                <BigNumber
                  value={data.age}
                  onChange={(v) => setData({ ...data, age: v })}
                  min={5}
                  max={100}
                  unit="years"
                  theme={theme}
                />
              )}

              {step === 2 && (
                <div
                  className="relative overflow-hidden rounded-3xl p-6 shadow-soft"
                  style={{ background: `linear-gradient(135deg, ${theme.from}15, ${theme.to}15)` }}
                >
                  <div className="absolute inset-0 bg-card/70 backdrop-blur-xl" />
                  <div className="relative">
                    <div className="flex items-end justify-center gap-2">
                      <motion.span
                        key={data.height}
                        initial={{ scale: 0.7, opacity: 0.4 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="font-display text-7xl font-black tabular-nums"
                        style={{
                          background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {data.height}
                      </motion.span>
                      <span className="pb-3 text-xl font-bold text-muted-foreground">cm</span>
                    </div>
                    <input
                      type="range"
                      min={120}
                      max={220}
                      value={data.height}
                      onChange={(e) => setData({ ...data, height: +e.target.value })}
                      className="w-full mt-6"
                      style={{ accentColor: theme.to }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground font-bold mt-1">
                      <span>120</span>
                      <span>170</span>
                      <span>220</span>
                    </div>
                    {/* Height visual */}
                    <div className="mt-5 flex items-end justify-center gap-1 h-16">
                      {[...Array(20)].map((_, i) => {
                        const ratio = (data.height - 120) / 100;
                        const active = i / 20 <= ratio;
                        return (
                          <motion.div
                            key={i}
                            animate={{ height: active ? `${20 + i * 2.5}%` : "20%" }}
                            className="w-1.5 rounded-full"
                            style={{
                              background: active
                                ? `linear-gradient(180deg, ${theme.from}, ${theme.to})`
                                : "var(--secondary)",
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <BigNumber
                  value={data.weight}
                  onChange={(v) => setData({ ...data, weight: v })}
                  min={20}
                  max={250}
                  unit="kg"
                  theme={theme}
                />
              )}

              {step === 4 && (
                <div className="space-y-3">
                  {(
                    [
                      {
                        k: "lose",
                        label: "Lose weight",
                        desc: "Burn fat, get lean",
                        Icon: TrendingDown,
                        from: "#f97316",
                        to: "#ef4444",
                      },
                      {
                        k: "maintain",
                        label: "Stay fit",
                        desc: "Hold steady, feel great",
                        Icon: Minus,
                        from: "#10b981",
                        to: "#22d3ee",
                      },
                      {
                        k: "gain",
                        label: "Gain weight",
                        desc: "Build muscle, grow strong",
                        Icon: TrendingUp,
                        from: "#6366f1",
                        to: "#8b5cf6",
                      },
                    ] as const
                  ).map((o, idx) => {
                    const active = data.goal === o.k;
                    return (
                      <motion.button
                        key={o.k}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setData({ ...data, goal: o.k })}
                        className="relative flex w-full items-center gap-3 overflow-hidden rounded-2xl p-4 text-left shadow-soft"
                        style={
                          active
                            ? {
                                background: `linear-gradient(135deg, ${o.from}, ${o.to})`,
                                color: "white",
                                boxShadow: `0 12px 30px -8px ${o.to}`,
                              }
                            : { background: "var(--card)" }
                        }
                      >
                        <div
                          className="grid h-12 w-12 place-items-center rounded-2xl"
                          style={
                            active
                              ? { background: "rgba(255,255,255,0.25)" }
                              : {
                                  background: `linear-gradient(135deg, ${o.from}30, ${o.to}30)`,
                                  color: o.to,
                                }
                          }
                        >
                          <o.Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-display text-lg font-bold leading-tight">{o.label}</p>
                          <p
                            className={`text-xs ${active ? "text-white/80" : "text-muted-foreground"}`}
                          >
                            {o.desc}
                          </p>
                        </div>
                        {active && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="grid h-8 w-8 place-items-center rounded-full bg-white/25"
                          >
                            <Check className="h-4 w-4" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}

                  <div className="pt-3">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
                      Activity level
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { k: "low", label: "Low", Icon: Leaf, from: "#22d3ee", to: "#0ea5e9" },
                          {
                            k: "moderate",
                            label: "Moderate",
                            Icon: Activity,
                            from: "#f59e0b",
                            to: "#f97316",
                          },
                          { k: "high", label: "High", Icon: Flame, from: "#ef4444", to: "#ec4899" },
                        ] as const
                      ).map((a) => {
                        const active = data.activityLevel === a.k;
                        return (
                          <motion.button
                            key={a.k}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => setData({ ...data, activityLevel: a.k })}
                            className="flex flex-col items-center gap-1 rounded-2xl py-3 text-xs font-bold transition"
                            style={
                              active
                                ? {
                                    background: `linear-gradient(135deg, ${a.from}, ${a.to})`,
                                    color: "white",
                                    boxShadow: `0 8px 20px -6px ${a.to}`,
                                  }
                                : { background: "var(--secondary)" }
                            }
                          >
                            <a.Icon className="h-4 w-4" />
                            {a.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav buttons */}
        <div className="mt-4 flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={next}
            className="relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl py-4 font-display font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
              boxShadow: `0 15px 35px -10px ${theme.to}`,
            }}
          >
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              style={{ background: "linear-gradient(90deg, transparent, white, transparent)" }}
            />
            <span className="relative">{step === steps.length - 1 ? "Let's Go" : "Continue"}</span>
            {step === steps.length - 1 ? (
              <Zap className="relative h-5 w-5" />
            ) : (
              <ArrowRight className="relative h-5 w-5" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function BigNumber({
  value,
  onChange,
  min,
  max,
  unit,
  theme,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  unit: string;
  theme: { from: string; to: string };
}) {
  const ratio = (value - min) / (max - min);
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-8 shadow-soft text-center"
      style={{ background: `linear-gradient(135deg, ${theme.from}10, ${theme.to}10)` }}
    >
      <div className="absolute inset-0 bg-card/70 backdrop-blur-xl" />
      <div className="relative">
        <motion.div
          key={value}
          initial={{ scale: 0.85, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="font-display"
        >
          <span
            className="text-7xl font-black tabular-nums"
            style={{
              background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {value}
          </span>
          <span className="text-2xl text-muted-foreground ml-2">{unit}</span>
        </motion.div>

        {/* Progress ring style bar */}
        <div className="mt-6 h-2 w-full rounded-full bg-secondary overflow-hidden">
          <motion.div
            animate={{ width: `${ratio * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${theme.from}, ${theme.to})` }}
          />
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(Math.max(min, value - 1))}
            className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary font-display text-2xl font-bold"
          >
            −
          </motion.button>
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(+e.target.value)}
            className="flex-1"
            style={{ accentColor: theme.to }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(Math.min(max, value + 1))}
            className="grid h-14 w-14 place-items-center rounded-2xl text-white font-display text-2xl font-bold"
            style={{
              background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
              boxShadow: `0 10px 25px -8px ${theme.to}`,
            }}
          >
            +
          </motion.button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Heart className="h-3 w-3" style={{ color: theme.to }} />
          <span>
            Range {min} – {max}
          </span>
        </div>
      </div>
    </div>
  );
}
