import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Apple,
  Dumbbell,
  Moon,
  Droplet,
  Brain,
  Heart,
  Plus,
  X,
  Check,
  Flame,
  ChevronDown,
  Salad,
  Bike,
  Coffee,
  Sun,
  BookOpen,
} from "lucide-react";
import { bmiCategory, calcBMI, useActivities, useProfile } from "@/lib/bmi-store";

export const Route = createFileRoute("/_app/tips")({ component: TipsPage });

type Tip = {
  icon: any;
  key: string;
  title: string;
  desc: string;
  grad: string;
  minutes: number;
  cal: number;
  category: "Nutrition" | "Fitness" | "Mind" | "Sleep";
  steps: string[];
  benefit: string;
};

const allTips: Tip[] = [
  {
    icon: Apple,
    key: "rainbow",
    title: "Eat the rainbow",
    desc: "Half your plate, colorful veggies.",
    grad: "bg-gradient-mint",
    minutes: 20,
    cal: 0,
    category: "Nutrition",
    steps: ["Pick 3 colors per meal", "Roast a tray once a week", "Top oatmeal with berries"],
    benefit: "Antioxidants & fiber that aid weight balance.",
  },
  {
    icon: Salad,
    key: "protein",
    title: "Protein at every meal",
    desc: "Keeps you full longer.",
    grad: "bg-gradient-mint",
    minutes: 15,
    cal: 0,
    category: "Nutrition",
    steps: ["Aim 25–35g per meal", "Stock eggs, tofu, yogurt", "Add seeds to salads"],
    benefit: "Preserves muscle while losing fat.",
  },
  {
    icon: Droplet,
    key: "hydrate",
    title: "Hydrate 2L daily",
    desc: "Sip throughout the day.",
    grad: "bg-gradient-ocean",
    minutes: 5,
    cal: 0,
    category: "Nutrition",
    steps: ["Glass on waking", "Bottle at your desk", "Sparkling water with citrus"],
    benefit: "Boosts metabolism ~3% per liter.",
  },

  {
    icon: Dumbbell,
    key: "strength",
    title: "Strength 30 min",
    desc: "Compound lifts 3×/week.",
    grad: "bg-gradient-brand",
    minutes: 30,
    cal: 220,
    category: "Fitness",
    steps: ["Squat, hinge, push, pull", "3 sets of 8–12 reps", "Add 2.5kg weekly"],
    benefit: "Raises resting metabolism for 48h.",
  },
  {
    icon: Heart,
    key: "walk",
    title: "Walk 6 000 steps",
    desc: "Compound daily movement.",
    grad: "bg-gradient-brand",
    minutes: 45,
    cal: 180,
    category: "Fitness",
    steps: ["Park further away", "Take call walks", "10-min after-meal stroll"],
    benefit: "Improves insulin sensitivity & mood.",
  },
  {
    icon: Bike,
    key: "cardio",
    title: "Zone-2 cardio",
    desc: "Easy pace 30 min.",
    grad: "bg-gradient-fire",
    minutes: 30,
    cal: 250,
    category: "Fitness",
    steps: ["Nose-breathing pace", "Bike, swim, or jog", "Twice a week"],
    benefit: "Builds mitochondria — fat burning engine.",
  },

  {
    icon: Brain,
    key: "breathe",
    title: "Box breathing 5m",
    desc: "4-4-4-4 in box pattern.",
    grad: "bg-gradient-fire",
    minutes: 5,
    cal: 0,
    category: "Mind",
    steps: ["Inhale 4s", "Hold 4s", "Exhale 4s", "Hold 4s"],
    benefit: "Lowers cortisol & sugar cravings.",
  },
  {
    icon: BookOpen,
    key: "journal",
    title: "2-min reflection",
    desc: "Note 3 wins each night.",
    grad: "bg-gradient-sunset",
    minutes: 2,
    cal: 0,
    category: "Mind",
    steps: ["Open phone notes", "Write 3 wins", "1 thing to improve"],
    benefit: "Builds self-trust and consistency.",
  },

  {
    icon: Moon,
    key: "sleep",
    title: "Sleep 7–9h",
    desc: "Rest balances hunger hormones.",
    grad: "bg-gradient-sunset",
    minutes: 480,
    cal: 0,
    category: "Sleep",
    steps: ["Lights dim 9pm", "No caffeine after 2pm", "Cool room 18°C"],
    benefit: "Regulates leptin & ghrelin.",
  },
  {
    icon: Coffee,
    key: "caffeine",
    title: "Cut late caffeine",
    desc: "Stop by 2pm.",
    grad: "bg-gradient-sunset",
    minutes: 0,
    cal: 0,
    category: "Sleep",
    steps: ["Swap to decaf after lunch", "Herbal tea evening", "Track sleep score"],
    benefit: "Deeper REM, easier waking.",
  },
  {
    icon: Sun,
    key: "morning-light",
    title: "Morning sunlight",
    desc: "10 min in first hour up.",
    grad: "bg-gradient-mint",
    minutes: 10,
    cal: 0,
    category: "Sleep",
    steps: ["Step outside", "No sunglasses", "Pair with stretch"],
    benefit: "Sets circadian rhythm.",
  },
];

const sections = ["Nutrition", "Fitness", "Mind", "Sleep"] as const;

function TipsPage() {
  const { profile } = useProfile();
  const { items, add, remove } = useActivities();
  const [showAdd, setShowAdd] = useState<null | Tip>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [activeSec, setActiveSec] = useState<(typeof sections)[number] | "All">("All");

  const bmi = calcBMI(profile.weight, profile.height);
  const cat = bmiCategory(bmi);

  const suggested = useMemo(() => {
    if (cat.key === "under") return ["strength", "protein", "sleep"];
    if (cat.key === "over") return ["walk", "hydrate", "rainbow"];
    if (cat.key === "obese") return ["walk", "hydrate", "breathe", "rainbow"];
    return ["breathe", "sleep", "hydrate"];
  }, [cat]);

  const weekGoalMin =
    profile.activityLevel === "high" ? 300 : profile.activityLevel === "low" ? 90 : 180;
  const weekStart = Date.now() - 7 * 86400e3;
  const minutesDone = items
    .filter((a) => new Date(a.date).getTime() > weekStart)
    .reduce((s, a) => s + a.minutes, 0);
  const goalPct = Math.min(100, Math.round((minutesDone / weekGoalMin) * 100));

  const filtered = activeSec === "All" ? allTips : allTips.filter((t) => t.category === activeSec);

  return (
    <div className="space-y-4">
      {/* Weekly goal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-3xl p-5 text-white shadow-glow ${cat.gradient}`}
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
        <p className="text-xs uppercase tracking-widest opacity-90">Weekly active minutes</p>
        <div className="flex items-baseline justify-between mt-1">
          <h2 className="font-display text-2xl font-bold">
            {minutesDone}/{weekGoalMin} min
          </h2>
          <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-bold backdrop-blur">
            {goalPct}%
          </span>
        </div>
        <div className="mt-3 h-2.5 w-full rounded-full bg-white/25 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goalPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-white"
          />
        </div>
        <p className="text-xs opacity-90 mt-2">
          Tuned for {cat.label.toLowerCase()} BMI · {profile.activityLevel} activity
        </p>
      </motion.div>

      {/* Suggested */}
      <div>
        <p className="font-display font-bold mb-2 flex items-center gap-2">
          <Flame className="h-4 w-4 text-rose-500" /> Suggested for you
        </p>
        <div className="space-y-2.5">
          {allTips
            .filter((t) => suggested.includes(t.key))
            .map((t, i) => (
              <ExpandableTip
                key={t.key}
                tip={t}
                index={i}
                onAdd={() => setShowAdd(t)}
                open={openKey === t.key}
                onToggle={() => setOpenKey(openKey === t.key ? null : t.key)}
              />
            ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {(["All", ...sections] as const).map((s) => (
          <button
            key={s}
            onClick={() => setActiveSec(s)}
            className={`relative shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${activeSec === s ? "text-white" : "bg-secondary text-muted-foreground"}`}
          >
            {activeSec === s && (
              <motion.span
                layoutId="sec-pill"
                className={`absolute inset-0 rounded-full ${cat.gradient}`}
              />
            )}
            <span className="relative">{s}</span>
          </button>
        ))}
      </div>

      {/* All tips, sequenced & detailed */}
      <div className="space-y-2.5">
        {filtered.map((t, i) => (
          <ExpandableTip
            key={t.key + activeSec}
            tip={t}
            index={i}
            onAdd={() => setShowAdd(t)}
            open={openKey === t.key}
            onToggle={() => setOpenKey(openKey === t.key ? null : t.key)}
            numbered
          />
        ))}
      </div>

      {/* Activities log */}
      <div>
        <p className="font-display font-bold mb-2">Your activities</p>
        {items.length === 0 ? (
          <div className="rounded-2xl bg-card p-5 text-center shadow-soft text-sm text-muted-foreground">
            No activities yet — tap a tip above to log.
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {items.slice(0, 10).map((a) => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30, scale: 0.9 }}
                  className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-fire text-white">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{a.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.minutes} min · {a.calories} kcal · {new Date(a.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(a.id)}
                    className="grid h-8 w-8 place-items-center rounded-xl bg-destructive/10 text-destructive active:scale-95"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAdd(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-md p-5"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.6, opacity: 0, y: 40, rotate: -4 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 30, rotate: 4 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              className="w-full max-w-sm overflow-hidden rounded-3xl bg-card shadow-glow"
            >
              <div className={`relative p-5 text-white ${showAdd.grad}`}>
                <button
                  onClick={() => setShowAdd(null)}
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/25 backdrop-blur">
                  <showAdd.icon className="h-6 w-6" />
                </div>
                <p className="font-display text-xl font-bold mt-3">{showAdd.title}</p>
                <p className="text-xs opacity-90">{showAdd.desc}</p>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="rounded-2xl bg-secondary p-3 text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">Why:</span> {showAdd.benefit}
                </div>
                <button
                  onClick={() => {
                    add({
                      id: crypto.randomUUID(),
                      date: new Date().toISOString(),
                      type: showAdd.title,
                      minutes: showAdd.minutes,
                      calories: showAdd.cal,
                    });
                    setShowAdd(null);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-brand py-3.5 font-display font-bold text-white shadow-glow"
                >
                  <Check className="h-5 w-5" /> Log this activity
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExpandableTip({
  tip,
  index,
  onAdd,
  open,
  onToggle,
  numbered,
}: {
  tip: Tip;
  index: number;
  onAdd: () => void;
  open: boolean;
  onToggle: () => void;
  numbered?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl bg-card shadow-soft overflow-hidden"
    >
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-3.5 text-left">
        <div
          className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-soft ${tip.grad}`}
        >
          <tip.icon className="h-5 w-5" />
          {numbered && (
            <span className="absolute -top-1.5 -left-1.5 grid h-5 w-5 place-items-center rounded-full bg-foreground text-white text-[10px] font-black">
              {index + 1}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold leading-tight">{tip.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tip.category} · {tip.minutes > 0 ? `${tip.minutes}m` : "habit"} · {tip.desc}
          </p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-2.5">
              <ol className="space-y-1.5">
                {tip.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white text-[10px] font-black ${tip.grad}`}
                    >
                      {i + 1}
                    </span>
                    <span className="font-medium">{s}</span>
                  </li>
                ))}
              </ol>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground">Why it works:</span> {tip.benefit}
              </p>
              <button
                onClick={onAdd}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-soft ${tip.grad}`}
              >
                <Plus className="h-4 w-4" /> Add to my activities
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
