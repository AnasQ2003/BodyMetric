import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useProfile, useHistory, useActivities, bmiCategory, calcBMI, suggestGoalWeight } from "@/lib/bmi-store";
import { Edit3, Award, Flame, Target, X, Check, LogOut, Trophy, Zap, Heart, Calendar, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({ component: ProfilePage });

function ProfilePage() {
  const { profile, update } = useProfile();
  const { items } = useHistory();
  const { items: acts } = useActivities();
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(profile);

  const latest = items[0];
  const bmi = latest?.bmi ?? calcBMI(profile.weight, profile.height);
  const cat = bmiCategory(bmi);

  const stats = useMemo(() => {
    const totalMin = acts.reduce((s, a) => s + a.minutes, 0);
    const totalCal = acts.reduce((s, a) => s + a.calories, 0);
    const days = new Set(items.map((i) => new Date(i.date).toDateString())).size;
    const weightStart = items.length ? items[items.length - 1].weight : profile.weight;
    return { totalMin, totalCal, days, weightDelta: +(profile.weight - weightStart).toFixed(1) };
  }, [acts, items, profile.weight]);

  const achievements = [
    { id: "first", icon: Sparkles, label: "First log", unlocked: items.length >= 1, grad: "bg-gradient-brand" },
    { id: "five", icon: Flame, label: "5 logs", unlocked: items.length >= 5, grad: "bg-gradient-fire" },
    { id: "streak", icon: Zap, label: "3-day streak", unlocked: stats.days >= 3, grad: "bg-gradient-sunset" },
    { id: "active", icon: Trophy, label: "100 active min", unlocked: stats.totalMin >= 100, grad: "bg-gradient-mint" },
    { id: "healthy", icon: Heart, label: "Healthy zone", unlocked: cat.key === "healthy", grad: "bg-gradient-ocean" },
    { id: "loyal", icon: Award, label: "10 logs", unlocked: items.length >= 10, grad: cat.gradient },
  ];

  const journey = items.slice(0, 5);

  const saveEdit = () => {
    const target = suggestGoalWeight({ height: draft.height, goal: draft.goal, weight: draft.weight });
    update({ ...draft, targetWeight: target });
    setEdit(false);
  };

  const signOut = () => {
    update({ authed: false });
    navigate({ to: "/auth" });
  };

  return (
    <div className="relative space-y-5">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-glow ${cat.gradient}`}>
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-2xl animate-blob" />
        <div className="flex items-center gap-4">
          <motion.div initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="grid h-20 w-20 place-items-center rounded-3xl text-white shadow-glow relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, oklch(0.7 0.22 ${profile.avatarHue}), oklch(0.78 0.18 ${(profile.avatarHue + 80) % 360}))` }}>
            <GenderAvatar gender={profile.gender} />
            <motion.span className="absolute inset-0 rounded-3xl ring-2 ring-white/40"
              animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity }} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-2xl font-bold truncate">{profile.name || "You"}</p>
            <p className="text-sm opacity-80 capitalize">{profile.age} yrs · {profile.gender}</p>
            <p className="text-xs opacity-80 mt-1">🎯 {profile.goal} · target {profile.targetWeight} kg</p>
          </div>
          <button onClick={() => { setDraft(profile); setEdit(true); }}
            className="relative z-20 grid h-10 w-10 place-items-center rounded-xl bg-white/20 active:scale-95 cursor-pointer">
            <Edit3 className="h-4 w-4" />
          </button>
        </div>

        {/* Mini journey progress */}
        <div className="mt-5 grid grid-cols-4 gap-2 text-center">
          {[
            { k: "BMI", v: bmi.toFixed(1) },
            { k: "Logs", v: items.length },
            { k: "Δ kg", v: (stats.weightDelta > 0 ? "+" : "") + stats.weightDelta },
            { k: "Min", v: stats.totalMin },
          ].map((s) => (
            <div key={s.k} className="rounded-xl bg-white/15 backdrop-blur p-2">
              <p className="font-display font-black text-base">{s.v}</p>
              <p className="text-[9px] uppercase tracking-wider opacity-80">{s.k}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display font-bold flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" /> Achievements</p>
          <span className="text-xs text-muted-foreground">{achievements.filter((a) => a.unlocked).length}/{achievements.length}</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {achievements.map((a, i) => (
            <motion.div key={a.id}
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05, type: "spring" }}
              className={`relative grid place-items-center rounded-2xl p-3 text-center ${a.unlocked ? a.grad + " text-white shadow-soft" : "bg-secondary text-muted-foreground"}`}>
              <a.icon className={`h-5 w-5 ${a.unlocked ? "" : "opacity-50"}`} />
              <p className="text-[10px] font-bold mt-1.5 leading-tight">{a.label}</p>
              {!a.unlocked && <p className="text-[9px] opacity-70 mt-0.5">locked</p>}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Body metrics */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft space-y-3">
        <h3 className="font-display font-bold">Body metrics</h3>
        <div className="grid grid-cols-2 gap-2">
          <Metric k="Height" v={`${profile.height} cm`} />
          <Metric k="Weight" v={`${profile.weight} kg`} />
          <Metric k="Target" v={`${profile.targetWeight} kg`} />
          <Metric k="BMI" v={bmi.toFixed(1)} accent={cat.color} />
          <Metric k="Status" v={cat.label} accent={cat.color} />
          <Metric k="Activity" v={profile.activityLevel} />
        </div>
      </motion.div>

      {/* Personal */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft space-y-2">
        <h3 className="font-display font-bold">Personal details</h3>
        <Row k="Name" v={profile.name || "—"} />
        <Row k="Email" v={profile.email || "—"} />
        <Row k="Age" v={`${profile.age} yrs`} />
        <Row k="Gender" v={profile.gender} />
        <Row k="Goal" v={profile.goal} />
      </motion.div>

      {/* Recent journey */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <p className="font-display font-bold flex items-center gap-2"><Calendar className="h-4 w-4" /> Recent journey</p>
          <Link to="/history" className="text-xs font-bold text-primary flex items-center gap-1">All <ArrowRight className="h-3 w-3" /></Link>
        </div>
        {journey.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-3">No entries yet.</p>
        ) : (
          <div className="space-y-1.5">
            {journey.map((j, i) => {
              const c = bmiCategory(j.bmi);
              return (
                <div key={j.id} className="flex items-center gap-2 text-xs">
                  <div className="grid place-items-center h-6 w-6 rounded-full bg-secondary text-muted-foreground font-bold">{i + 1}</div>
                  <span className="text-muted-foreground">{new Date(j.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${c.gradient}`}>{j.bmi}</span>
                  <span className="text-muted-foreground">{j.weight}kg</span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/goals" className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-brand py-3 text-sm font-semibold text-white shadow-glow active:scale-95">
          <Target className="h-4 w-4" /> Edit goals
        </Link>
        <Link to="/calculator" className="flex items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-sm font-semibold active:scale-95">
          <Sparkles className="h-4 w-4" /> Full calculator
        </Link>
      </div>

      <button onClick={signOut}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive active:scale-95">
        <LogOut className="h-4 w-4" /> Sign out
      </button>

      {/* Edit modal */}
      {createPortal(
        <AnimatePresence>
          {edit && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEdit(false)}
              className="fixed inset-0 z-[100000] grid place-items-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.6, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.7, opacity: 0, y: 30 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
                className="w-full max-w-sm rounded-3xl bg-card shadow-2xl max-h-[85vh] overflow-y-auto border-2 border-primary">
              <div className="relative bg-gradient-brand p-5 text-white sticky top-0 z-10 rounded-t-3xl">
                <button onClick={() => setEdit(false)}
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/20"><X className="h-4 w-4" /></button>
                <p className="font-display text-xl font-bold">Edit profile</p>
                <p className="text-xs opacity-90">Tap save — your changes apply instantly.</p>
              </div>
              <div className="space-y-3 p-5">
                <F l="Name" v={draft.name} on={(v: string) => setDraft({ ...draft, name: v })} />
                <F l="Email" v={draft.email} on={(v: string) => setDraft({ ...draft, email: v })} />
                <div className="grid grid-cols-2 gap-3">
                  <F l="Age" type="number" v={String(draft.age)} on={(v: string) => setDraft({ ...draft, age: +v || 0 })} />
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Gender</label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      {(["male", "female"] as const).map((g) => (
                        <button key={g} onClick={() => setDraft({ ...draft, gender: g })}
                          className={`rounded-xl py-2 text-xs font-semibold capitalize ${draft.gender === g ? "bg-gradient-brand text-white" : "bg-secondary"}`}>{g}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <F l="Height (cm)" type="number" v={String(draft.height)} on={(v: string) => setDraft({ ...draft, height: +v || 0 })} />
                  <F l="Weight (kg)" type="number" v={String(draft.weight)} on={(v: string) => setDraft({ ...draft, weight: +v || 0 })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Goal</label>
                  <div className="mt-1 grid grid-cols-3 gap-2">
                    {(["lose", "maintain", "gain"] as const).map((g) => (
                      <button key={g} onClick={() => setDraft({ ...draft, goal: g })}
                        className={`rounded-xl py-2 text-xs font-semibold capitalize ${draft.goal === g ? "bg-gradient-brand text-white" : "bg-secondary"}`}>{g}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Activity</label>
                  <div className="mt-1 grid grid-cols-3 gap-2">
                    {(["low", "moderate", "high"] as const).map((a) => (
                      <button key={a} onClick={() => setDraft({ ...draft, activityLevel: a })}
                        className={`rounded-xl py-2 text-xs font-semibold capitalize ${draft.activityLevel === a ? "bg-gradient-brand text-white" : "bg-secondary"}`}>{a}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Avatar color</label>
                  <input type="range" min={0} max={360} value={draft.avatarHue}
                    onChange={(e) => setDraft({ ...draft, avatarHue: +e.target.value })}
                    className="w-full mt-1 accent-primary" />
                </div>
                <button onClick={saveEdit}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-brand py-3.5 font-display font-bold text-white shadow-glow">
                  <Check className="h-5 w-5" /> Save changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex items-center justify-between text-sm border-b last:border-0 py-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold capitalize">{v}</span>
    </div>
  );
}
function Metric({ k, v, accent }: { k: string; v: any; accent?: string }) {
  return (
    <div className="rounded-xl bg-secondary p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{k}</p>
      <p className="font-display text-base font-black mt-0.5 capitalize" style={accent ? { color: accent } : undefined}>{v}</p>
    </div>
  );
}
function F({ l, v, on, type = "text" }: any) {
  return (
    <div>
      <label className="text-xs text-muted-foreground font-medium">{l}</label>
      <input type={type} value={v} onChange={(e) => on(e.target.value)}
        className="mt-1 w-full rounded-xl bg-secondary px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary transition" />
    </div>
  );
}

function GenderAvatar({ gender }: { gender: "male" | "female" }) {
  if (gender === "female") {
    return (
      <svg viewBox="0 0 64 64" className="h-14 w-14 drop-shadow">
        {/* head */}
        <circle cx="32" cy="20" r="9" fill="white" />
        {/* hair */}
        <path d="M22 19 C22 11 42 11 42 19 L42 24 L38 22 C38 16 26 16 26 22 L22 24 Z" fill="white" opacity="0.9" />
        {/* triangle dress body */}
        <path d="M32 28 L50 56 L14 56 Z" fill="white" />
        {/* belt */}
        <rect x="22" y="42" width="20" height="2.5" fill="rgba(0,0,0,0.15)" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 drop-shadow">
      {/* head */}
      <circle cx="32" cy="20" r="9" fill="white" />
      {/* hair top */}
      <path d="M23 16 C24 10 40 10 41 16 L41 18 C36 14 28 14 23 18 Z" fill="white" opacity="0.85" />
      {/* shoulders + torso (square-ish) */}
      <path d="M14 56 L14 38 C14 32 22 28 32 28 C42 28 50 32 50 38 L50 56 Z" fill="white" />
      {/* collar */}
      <path d="M28 28 L32 33 L36 28 Z" fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

