import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Home, History, Lightbulb, User, Settings, Bell, Activity, Menu, X, Calculator, Target, BellRing, LogOut, Sparkles, ChevronRight } from "lucide-react";
import { useNotifications, useProfile, calcBMI, bmiCategory } from "@/lib/bmi-store";


const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/history", label: "History", icon: History },
  { to: "/tips", label: "Tips", icon: Lightbulb },
  { to: "/profile", label: "Profile", icon: User },
];

const titles: Record<string, string> = {
  "/home": "BMI Pulse",
  "/result": "Your Result",
  "/history": "History",
  "/tips": "Health Tips",
  "/profile": "Profile",
  "/settings": "Settings",
  "/goals": "Your Goals",
  "/notifications": "Notifications",
  "/calculator": "Full Calculator",
};

// Per-BMI ambient theme + dynamic color tokens (drive whole app)
const themes: Record<string, { a: string; b: string; c: string; tint: string; ring: string }> = {
  under:   { a: "oklch(0.78 0.16 220)", b: "oklch(0.78 0.14 200)", c: "oklch(0.85 0.12 250)", tint: "oklch(0.96 0.04 220)", ring: "oklch(0.62 0.22 220)" },
  healthy: { a: "oklch(0.78 0.18 155)", b: "oklch(0.8 0.14 180)",  c: "oklch(0.85 0.16 130)", tint: "oklch(0.96 0.04 155)", ring: "oklch(0.6 0.18 155)" },
  over:    { a: "oklch(0.82 0.17 75)",  b: "oklch(0.78 0.18 40)",  c: "oklch(0.85 0.14 95)",  tint: "oklch(0.96 0.04 75)",  ring: "oklch(0.65 0.2 60)" },
  obese:   { a: "oklch(0.7 0.22 25)",   b: "oklch(0.7 0.22 350)",  c: "oklch(0.75 0.2 10)",   tint: "oklch(0.96 0.04 25)",  ring: "oklch(0.6 0.24 25)" },
};

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { unread } = useNotifications();
  const { profile, update } = useProfile();
  const title = titles[pathname] ?? "BMI";
  const [drawer, setDrawer] = useState(false);
  const scrollerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    try { window.scrollTo({ top: 0, left: 0 }); } catch {}
  }, [pathname]);

  const cat = useMemo(() => bmiCategory(calcBMI(profile.weight, profile.height)), [profile.weight, profile.height]);
  const theme = themes[cat.key];


  // Dynamic color tokens that cascade into the entire subtree.
  const dynStyle = {
    ["--background" as any]: theme.tint,
    ["--secondary" as any]: `color-mix(in oklab, ${theme.ring} 14%, white)`,
    ["--ring" as any]: theme.ring,
    ["--shadow-soft" as any]: `0 12px 32px -10px color-mix(in oklab, ${theme.ring} 45%, transparent)`,
    ["--shadow-glow" as any]: `0 24px 60px -15px color-mix(in oklab, ${theme.ring} 70%, transparent)`,
  } as React.CSSProperties;

  return (
    <div className="relative h-full w-full overflow-hidden transition-colors duration-700" style={dynStyle}>
      <div className="absolute inset-0 -z-10 bg-background transition-colors duration-700" />
      {/* Soft cooling gradient wash across the whole app */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 transition-all duration-700"
        style={{
          background: `radial-gradient(120% 80% at 0% 0%, color-mix(in oklab, ${theme.a} 32%, transparent) 0%, transparent 55%), radial-gradient(120% 80% at 100% 0%, color-mix(in oklab, ${theme.c} 28%, transparent) 0%, transparent 55%), radial-gradient(140% 90% at 50% 110%, color-mix(in oklab, ${theme.b} 30%, transparent) 0%, transparent 60%), linear-gradient(180deg, color-mix(in oklab, ${theme.tint} 70%, white) 0%, color-mix(in oklab, ${theme.a} 10%, white) 100%)`,
        }}
      />
      {/* Subtle grid overlay for depth */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
        style={{ backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div key={`a-${cat.key}`} initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ duration: 1.2 }}
          className="absolute -top-32 -left-24 h-72 w-72 rounded-full blur-3xl animate-blob"
          style={{ background: theme.a }} />
        <motion.div key={`b-${cat.key}`} initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 1.2 }}
          className="absolute top-1/3 -right-24 h-80 w-80 rounded-full blur-3xl animate-blob"
          style={{ background: theme.b, animationDelay: "2s" }} />
        <motion.div key={`c-${cat.key}`} initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ duration: 1.2 }}
          className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full blur-3xl animate-blob"
          style={{ background: theme.c, animationDelay: "4s" }} />
      </div>

      <div className="mx-auto grid h-full w-full max-w-md grid-rows-[auto_1fr_auto]">
        <header className="z-30 px-4 pt-6">
          <motion.div layout className="glass relative flex items-center justify-between rounded-2xl px-3 py-2.5 shadow-glow ring-1 ring-white/40 overflow-hidden">
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6), inset 0 0 24px color-mix(in oklab, ${theme.ring} 32%, transparent)` }} />
            <span aria-hidden className="pointer-events-none absolute -inset-px rounded-2xl opacity-70"
              style={{ background: `linear-gradient(120deg, transparent 30%, color-mix(in oklab, ${theme.a} 55%, transparent) 50%, transparent 70%)`, mixBlendMode: "overlay" }} />
            <button onClick={() => setDrawer(true)}
              className={`relative grid h-10 w-10 place-items-center rounded-xl text-white shadow-glow active:scale-95 transition ${cat.gradient}`}
              aria-label="Open menu">
              <Menu className="h-5 w-5" strokeWidth={2.6} />
              <motion.span className="absolute inset-0 rounded-xl ring-2 ring-white/50"
                animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 1.8, repeat: Infinity }} />
            </button>
            <AnimatePresence mode="wait">
              <motion.h1 key={title} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }} className="font-display text-lg font-bold tracking-tight">{title}</motion.h1>
            </AnimatePresence>
            <div className="flex items-center gap-1.5">
              <button onClick={() => navigate({ to: "/notifications" })}
                className="relative grid h-10 w-10 place-items-center rounded-xl bg-secondary text-secondary-foreground active:scale-95"
                aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-gradient-fire text-[9px] font-bold text-white animate-pulse">
                    {unread}
                  </span>
                )}
              </button>
              <button onClick={() => navigate({ to: "/settings" })}
                className={`grid h-10 w-10 place-items-center rounded-xl text-white shadow-soft active:scale-95 ${pathname === "/settings" ? cat.gradient : "bg-foreground/85"}`}
                aria-label="Settings">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </header>


        <main ref={scrollerRef as any} className="relative min-h-0 overflow-y-auto px-4 pt-4 pb-4">
          <AnimatePresence mode="wait">
            <motion.div key={pathname}
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="relative z-30 px-3 pb-4 pt-1">
          <motion.span aria-hidden className="pointer-events-none absolute inset-x-2 bottom-2 top-1 rounded-[28px] blur-xl opacity-60"
            style={{ background: `linear-gradient(90deg, ${theme.a}, ${theme.b}, ${theme.c})` }}
            animate={{ opacity: [0.35, 0.7, 0.35] }} transition={{ duration: 4, repeat: Infinity }} />
          <div className="glass relative flex items-center justify-between rounded-3xl p-2 shadow-glow ring-1 ring-white/40 overflow-hidden">
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl"
              style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6), inset 0 0 28px color-mix(in oklab, ${theme.ring} 38%, transparent)` }} />
            {tabs.map((t) => {
              const active = pathname === t.to || (t.to === "/home" && pathname === "/");
              const Icon = t.icon;
              return (
                <Link key={t.to} to={t.to} className="relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-xs font-medium">
                  {active && (
                    <motion.span layoutId="tab-pill" className={`absolute inset-0 rounded-2xl shadow-glow ${cat.gradient}`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                  )}
                  <Icon className={`relative h-5 w-5 transition ${active ? "text-white" : "text-muted-foreground"}`} />
                  <span className={`relative transition ${active ? "text-white" : "text-muted-foreground"}`}>{t.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Drawer-style popup menu (pops in with scale/spring) */}
      <AnimatePresence>
        {drawer && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDrawer(false)}
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/55 backdrop-blur-md p-4">
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.4, opacity: 0, y: -80, rotate: -6 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: -60, rotate: 4 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="w-full max-w-[360px] overflow-hidden rounded-3xl bg-card shadow-glow max-h-[80vh] flex flex-col">
              <div className={`relative p-5 text-white ${cat.gradient}`}>
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                <button onClick={() => setDrawer(false)}
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/25 active:scale-95">
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/25 backdrop-blur">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-85">Hello {profile.name || "friend"}</p>
                    <p className="font-display text-xl font-bold">Quick menu</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto">
                {[
                  { to: "/home", icon: Home, label: "Dashboard", grad: "bg-gradient-brand" },
                  { to: "/calculator", icon: Calculator, label: "Full calculator", grad: "bg-gradient-ocean" },
                  { to: "/result", icon: Sparkles, label: "Last result", grad: "bg-gradient-mint" },
                  { to: "/history", icon: History, label: "History & charts", grad: "bg-gradient-sunset" },
                  { to: "/goals", icon: Target, label: "Goals", grad: "bg-gradient-fire" },
                  { to: "/tips", icon: Lightbulb, label: "Health tips", grad: "bg-gradient-mint" },
                  { to: "/notifications", icon: BellRing, label: "Notifications", grad: "bg-gradient-brand" },
                  { to: "/profile", icon: User, label: "Profile", grad: "bg-gradient-ocean" },
                  { to: "/settings", icon: Settings, label: "Settings", grad: "bg-gradient-sunset" },
                ].map((m, i) => (
                  <motion.button key={m.to}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => { setDrawer(false); navigate({ to: m.to as any }); }}
                    className="flex w-full items-center gap-3 rounded-2xl bg-secondary p-2.5 text-left active:scale-[0.98] transition">
                    <span className={`grid h-9 w-9 place-items-center rounded-xl text-white shadow-soft ${m.grad}`}>
                      <m.icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 font-display font-bold text-sm">{m.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </motion.button>
                ))}
                <button onClick={() => { update({ authed: false }); setDrawer(false); navigate({ to: "/auth" }); }}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 py-3 text-sm font-bold text-destructive active:scale-95">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
