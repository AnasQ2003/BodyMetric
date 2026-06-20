import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { LogIn, UserPlus, Mail, Lock, User, X, Sparkles, Activity, Heart, TrendingUp, Shield, Apple, FileText, Lock as LockIcon, ChevronRight, Flame } from "lucide-react";
import { useProfile } from "@/lib/bmi-store";

export const Route = createFileRoute("/auth")({ component: AuthPage });

type Mode = "login" | "register" | "terms" | "privacy" | null;


const features = [
  { icon: Activity, title: "Live BMI engine", desc: "Real‑time scoring with risk meter", grad: "from-fuchsia-400 to-pink-500" },
  { icon: TrendingUp, title: "Smart insights", desc: "Track weight & BMI side by side", grad: "from-sky-400 to-cyan-500" },
  { icon: Apple, title: "Personalized tips", desc: "Tailored to your category", grad: "from-emerald-400 to-teal-500" },
  { icon: Shield, title: "Private & local", desc: "Your data stays on device", grad: "from-amber-400 to-orange-500" },
];

function AuthPage() {
  const navigate = useNavigate();
  const { profile, update } = useProfile();
  const [mode, setMode] = useState<Mode>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = () => {
    if (mode === "register") {
      update({ name: form.name || "Friend", email: form.email, authed: true, onboarded: false });
      navigate({ to: "/onboarding" });
    } else {
      update({
        name: profile.name || form.email.split("@")[0] || "Friend",
        email: form.email,
        authed: true,
        onboarded: profile.onboarded,
      });
      navigate({ to: profile.onboarded ? "/home" : "/onboarding" });
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-brand text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-10 h-80 w-80 rounded-full bg-white/20 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-10 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-300/25 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col px-6 pt-12 pb-8">
        <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-white/20 backdrop-blur-xl shadow-glow">
          <Activity className="h-10 w-10" strokeWidth={2.5} />
        </motion.div>

        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          className="mt-5 text-center font-display text-3xl font-black leading-tight">Welcome to <span className="block bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">BMI Pulse</span></motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
          className="mt-2 text-center text-sm text-white/85 max-w-xs mx-auto">Your private, beautifully animated health companion.</motion.p>

        {/* Feature cards fill the screen */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}
          className="mt-6 grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08, type: "spring", stiffness: 220, damping: 18 }}
              className="rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 p-3 shadow-glow">
              <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${f.grad} text-white shadow-soft`}>
                <f.icon className="h-4 w-4" />
              </div>
              <p className="font-display font-bold text-sm mt-2">{f.title}</p>
              <p className="text-[11px] text-white/75 mt-0.5 leading-snug">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust strip */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
          className="mt-4 flex items-center justify-around rounded-2xl bg-white/10 backdrop-blur border border-white/15 p-3 text-center">
          {[{ n: "12k+", l: "Users" }, { n: "4.9★", l: "Rating" }, { n: "100%", l: "Private" }].map((s) => (
            <div key={s.l}>
              <p className="font-display font-black text-lg">{s.n}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/70">{s.l}</p>
            </div>
          ))}
        </motion.div>

        {/* Live BMI preview ticker — interactive teaser */}
        <LivePreview />

        <div className="mt-4 space-y-3">
          <motion.button
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setMode("register")}
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white py-4 font-display font-bold text-foreground shadow-glow">
            <UserPlus className="h-5 w-5" /> Create free account
            <span className="absolute inset-0 shimmer opacity-50 pointer-events-none" />
          </motion.button>
          <motion.button
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setMode("login")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 py-4 font-display font-bold backdrop-blur">
            <LogIn className="h-5 w-5" /> I already have an account
          </motion.button>
          <p className="text-center text-[11px] text-white/80 pt-1">
            By continuing you agree to our{" "}
            <button onClick={() => setMode("terms")} className="underline font-semibold hover:text-white">Terms</button>
            {" "}&{" "}
            <button onClick={() => setMode("privacy")} className="underline font-semibold hover:text-white">Privacy</button>.
          </p>
        </div>
      </div>


      <AnimatePresence>
        {(mode === "login" || mode === "register") && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMode(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 backdrop-blur-md p-5">
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.5, opacity: 0, y: 60, rotate: -4 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.6, opacity: 0, y: 40, rotate: 4 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              className="w-full max-w-sm overflow-hidden rounded-3xl bg-card text-foreground shadow-glow">
              <div className="relative bg-gradient-brand p-5 text-white">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                <button onClick={() => setMode(null)}
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/20 active:scale-95">
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/25 backdrop-blur">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-80">{mode === "login" ? "Welcome back" : "New here"}</p>
                    <p className="font-display text-xl font-bold">{mode === "login" ? "Log in" : "Create account"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-5">
                {mode === "register" && (
                  <FormField icon={User} placeholder="Your name" value={form.name}
                    onChange={(v: string) => setForm({ ...form, name: v })} />
                )}
                <FormField icon={Mail} placeholder="Email" type="email" value={form.email}
                  onChange={(v: string) => setForm({ ...form, email: v })} />
                <FormField icon={Lock} placeholder="Password" type="password" value={form.password}
                  onChange={(v: string) => setForm({ ...form, password: v })} />

                <motion.button whileTap={{ scale: 0.96 }} onClick={submit}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-brand py-3.5 font-display font-bold text-white shadow-glow">
                  <Heart className="h-4 w-4" />
                  {mode === "login" ? "Log in" : "Continue"}
                </motion.button>

                <button onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="block w-full text-center text-xs text-muted-foreground pt-1">
                  {mode === "login" ? "No account? Create one" : "Already have an account? Log in"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {(mode === "terms" || mode === "privacy") && (
          <InfoModal kind={mode} onClose={() => setMode(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function LivePreview() {
  const samples = [
    { name: "Aisha", bmi: 22.1, status: "Healthy", grad: "from-emerald-400 to-teal-500" },
    { name: "Leo", bmi: 19.4, status: "Healthy", grad: "from-cyan-400 to-sky-500" },
    { name: "Mira", bmi: 26.7, status: "Overweight", grad: "from-amber-400 to-orange-500" },
    { name: "Kai", bmi: 23.8, status: "Healthy", grad: "from-fuchsia-400 to-pink-500" },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % samples.length), 2200);
    return () => clearInterval(t);
  }, []);
  const s = samples[idx];
  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.75 }}
      className="mt-4 rounded-2xl bg-white/12 backdrop-blur-xl border border-white/20 p-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-fire">
            <Flame className="h-3.5 w-3.5" />
          </span>
          <p className="text-[11px] uppercase tracking-widest text-white/80 font-bold">Live · {samples.length}k tracking now</p>
        </div>
        <span className="flex h-2 w-2">
          <span className="absolute h-2 w-2 rounded-full bg-emerald-300 animate-ping opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={s.name}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4 }}
          className="mt-2 flex items-center gap-3">
          <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${s.grad} font-display font-black text-sm shadow-soft`}>
            {s.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm leading-tight">{s.name} just logged BMI</p>
            <p className="text-[11px] text-white/75">{s.status} zone · stay tuned for streaks</p>
          </div>
          <div className="text-right">
            <p className="font-display font-black text-lg leading-none">{s.bmi}</p>
            <p className="text-[9px] uppercase tracking-wider text-white/70">bmi</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-2.5 flex gap-1">
        {samples.map((_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full transition ${i === idx ? "bg-white" : "bg-white/25"}`} />
        ))}
      </div>
    </motion.div>
  );
}

function InfoModal({ kind, onClose }: { kind: "terms" | "privacy"; onClose: () => void }) {
  const isTerms = kind === "terms";
  const sections = isTerms
    ? [
        { t: "Acceptance", b: "By using BMI Pulse, you agree to use it as a personal wellness companion — not as medical advice." },
        { t: "Your account", b: "Keep your credentials safe. You're responsible for activity on your account." },
        { t: "Health disclaimer", b: "BMI is a general indicator, not a diagnosis. Consult a professional for medical guidance." },
        { t: "Data ownership", b: "Your measurements belong to you. Export or delete them any time from Settings." },
      ]
    : [
        { t: "Local-first", b: "All measurements live on your device. We don't ship them anywhere by default." },
        { t: "No tracking", b: "No third-party analytics, no ads, no fingerprinting. Period." },
        { t: "Encryption", b: "Account sync (when enabled) uses end-to-end encryption with your key." },
        { t: "Your control", b: "Wipe everything in one tap from Settings → Data Storage." },
      ];
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 backdrop-blur-md p-5">
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.5, opacity: 0, y: 60 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.6, opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-card text-foreground shadow-glow max-h-[80vh] flex flex-col">
        <div className={`relative p-5 text-white ${isTerms ? "bg-gradient-sunset" : "bg-gradient-ocean"}`}>
          <button onClick={onClose}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/25 active:scale-95">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/25 backdrop-blur">
              {isTerms ? <FileText className="h-6 w-6" /> : <LockIcon className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-80">Last updated · 2026</p>
              <p className="font-display text-xl font-bold">{isTerms ? "Terms of use" : "Privacy policy"}</p>
            </div>
          </div>
        </div>
        <div className="overflow-y-auto p-5 space-y-3">
          {sections.map((s, i) => (
            <motion.div key={s.t}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl bg-secondary p-3">
              <p className="flex items-center gap-2 font-display font-bold text-sm">
                <ChevronRight className="h-4 w-4 text-primary" />
                {s.t}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed pl-6">{s.b}</p>
            </motion.div>
          ))}
          <button onClick={onClose}
            className="w-full rounded-2xl bg-gradient-brand py-3 font-display font-bold text-white shadow-glow">
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}


function FormField({ icon: Icon, ...p }: any) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        {...p}
        onChange={(e: any) => p.onChange(e.target.value)}
        className="w-full rounded-2xl bg-secondary py-3 pl-10 pr-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary transition"
      />
    </div>
  );
}
