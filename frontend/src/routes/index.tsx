import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Activity, Heart, Zap, Sparkles } from "lucide-react";
import { useProfile, seedNotifications } from "@/lib/bmi-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BMI Pulse — Animated BMI tracker" },
      { name: "description", content: "Colorful, animated BMI calculator with goals, charts and tips." },
    ],
  }),
  component: Splash,
});

const DURATION = 2600;

function Splash() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    seedNotifications();
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / DURATION) * 100);
      setProgress(p);
      if (p >= 100) clearInterval(id);
    }, 30);
    const t = setTimeout(() => {
      if (profile.authed && profile.onboarded) navigate({ to: "/home" });
      else if (profile.authed && !profile.onboarded) navigate({ to: "/onboarding" });
      else navigate({ to: "/auth" });
    }, DURATION);
    return () => { clearTimeout(t); clearInterval(id); };
  }, [navigate, profile]);

  const phase = progress < 33 ? "Warming up the engine" : progress < 66 ? "Loading your health profile" : "Almost ready ✨";

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-gradient-brand text-white">
      <div className="absolute inset-0">
        <div className="absolute -top-20 -left-10 h-80 w-80 rounded-full bg-white/20 blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/15 blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-float" />
        {/* sparkles */}
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-white"
            style={{ left: `${(i * 67) % 100}%`, top: `${(i * 43) % 100}%` }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.4, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.15 }} />
        ))}
      </div>

      <div className="relative flex flex-col items-center text-center px-6 w-full max-w-sm">
        {/* Layered logo */}
        <div className="relative h-40 w-40">
          {/* Outer rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.7), transparent)" }}
            animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
          <div className="absolute inset-1.5 rounded-full bg-gradient-brand" />
          {/* Inner counter-rotating ring */}
          <motion.div
            className="absolute inset-3 rounded-full border-2 border-dashed border-white/40"
            animate={{ rotate: -360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
          {/* Pulse rings */}
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="absolute inset-6 rounded-full border border-white/40"
              animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.7 }} />
          ))}
          {/* Center badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 14 }}
            className="absolute inset-7 grid place-items-center rounded-full bg-white/25 backdrop-blur-xl shadow-glow"
          >
            <motion.div animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}>
              <Activity className="h-14 w-14 drop-shadow-lg" strokeWidth={2.6} />
            </motion.div>
          </motion.div>
          {/* Orbiting icons */}
          {[
            { Icon: Heart, color: "from-rose-300 to-pink-500" },
            { Icon: Zap, color: "from-amber-200 to-orange-500" },
            { Icon: Sparkles, color: "from-cyan-200 to-sky-500" },
          ].map(({ Icon, color }, i) => (
            <motion.div key={i}
              className="absolute inset-0"
              animate={{ rotate: 360 }} transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: "linear" }}>
              <div className="absolute left-1/2 -top-2 -translate-x-1/2">
                <div className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br ${color} shadow-glow`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-8 font-display text-4xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-white via-yellow-100 to-cyan-100 bg-clip-text text-transparent">BMI Pulse</span>
        </motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-2 text-sm font-medium text-white/80">Your body. Your rhythm. Your journey.</motion.p>

        {/* Loading bar */}
        <div className="mt-10 w-full">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/20 backdrop-blur">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white via-cyan-100 to-yellow-100 shadow-glow"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }} />
            <span className="shimmer absolute inset-0" />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-white/85">
            <span>{phase}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
