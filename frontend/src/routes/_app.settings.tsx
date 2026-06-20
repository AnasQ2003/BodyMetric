import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Bell, Moon, Globe, Shield, Info, ChevronRight, Sun, Palette, Target, X, Check, Heart, Lock, Database, FileText, Mail, Star, Sparkles, Trash2 } from "lucide-react";
import { useProfile, useHistory, useActivities, useNotifications } from "@/lib/bmi-store";

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage });

type SheetKey = null | "privacy" | "about" | "data" | "rate";

function SettingsPage() {
  const { profile, update } = useProfile();
  const history = useHistory();
  const acts = useActivities();
  const notifs = useNotifications();
  const [dark, setDark] = useState(false);
  const [notif, setNotif] = useState(true);
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [sheet, setSheet] = useState<SheetKey>(null);

  useEffect(() => {
    const stored = localStorage.getItem("bmi:dark") === "1";
    setDark(stored);
    document.documentElement.classList.toggle("dark", stored);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("bmi:dark", dark ? "1" : "0");
  }, [dark]);

  const clearAll = () => {
    history.clear(); acts.clear(); notifs.clear();
    setSheet(null);
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-ocean p-5 text-white shadow-glow relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <p className="text-xs uppercase tracking-widest opacity-80">Preferences</p>
        <h2 className="font-display text-2xl font-bold mt-1">Make it yours</h2>
        <p className="text-xs opacity-85 mt-1">Theme, privacy, units — all in one place.</p>
      </motion.div>

      <div className="rounded-3xl bg-card shadow-soft overflow-hidden divide-y">
        <Toggle icon={dark ? Moon : Sun} grad="bg-gradient-brand" label="Dark mode" desc="Easy on the eyes" value={dark} onChange={setDark} />
        <Toggle icon={Bell} grad="bg-gradient-sunset" label="Notifications" desc="Daily reminders" value={notif} onChange={setNotif} />

        <div className="flex items-center gap-3 p-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-mint text-white shadow-soft">
            <Globe className="h-5 w-5" />
          </div>
          <div className="flex-1"><p className="font-semibold">Units</p><p className="text-xs text-muted-foreground">Metric or imperial</p></div>
          <div className="flex gap-1 bg-secondary rounded-xl p-1">
            {(["metric", "imperial"] as const).map((u) => (
              <button key={u} onClick={() => setUnits(u)}
                className={`relative rounded-lg px-3 py-1.5 text-xs font-bold transition ${units === u ? "text-white" : "text-muted-foreground"}`}>
                {units === u && <motion.span layoutId="unit-pill" className="absolute inset-0 rounded-lg bg-gradient-brand" />}
                <span className="relative capitalize">{u}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-fire text-white shadow-soft">
            <Palette className="h-5 w-5" />
          </div>
          <div className="flex-1"><p className="font-semibold">Theme color</p><p className="text-xs text-muted-foreground">Tint avatars &amp; gradients</p></div>
          <input type="range" min={0} max={360} value={profile.avatarHue}
            onChange={(e) => update({ avatarHue: +e.target.value })}
            className="w-32 accent-primary" />
        </div>

        <Link to="/goals" className="flex w-full items-center gap-3 p-4 active:bg-secondary/50">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-brand text-white shadow-soft">
            <Target className="h-5 w-5" />
          </div>
          <div className="flex-1"><p className="font-semibold">Goals</p><p className="text-xs text-muted-foreground">Adjust target weight</p></div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>

        <RowBtn icon={Shield} grad="bg-gradient-fire" label="Privacy" desc="Your data, your control" onClick={() => setSheet("privacy")} />
        <RowBtn icon={Database} grad="bg-gradient-mint" label="Data &amp; storage" desc={`${history.items.length} logs · ${acts.items.length} activities`} onClick={() => setSheet("data")} />
        <RowBtn icon={Star} grad="bg-gradient-sunset" label="Rate BMI Pulse" desc="Help us improve" onClick={() => setSheet("rate")} />
        <RowBtn icon={Info} grad="bg-gradient-ocean" label="About BMI Pulse" desc="v1.0.0" onClick={() => setSheet("about")} />
      </div>

      <AnimatePresence>
        {sheet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSheet(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-md p-5">
            <motion.div onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.6, opacity: 0, y: 40, rotate: -4 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              className="w-full max-w-sm overflow-hidden rounded-3xl bg-card shadow-glow">
              {sheet === "privacy" && <PrivacySheet onClose={() => setSheet(null)} />}
              {sheet === "about" && <AboutSheet onClose={() => setSheet(null)} />}
              {sheet === "data" && <DataSheet onClose={() => setSheet(null)} onClear={clearAll} history={history.items.length} acts={acts.items.length} />}
              {sheet === "rate" && <RateSheet onClose={() => setSheet(null)} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SheetHead({ title, subtitle, grad, Icon, onClose }: any) {
  return (
    <div className={`relative p-5 text-white ${grad}`}>
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
      <button onClick={onClose} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/20 active:scale-95">
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/25 backdrop-blur"><Icon className="h-6 w-6" /></div>
        <div>
          <p className="font-display text-xl font-bold">{title}</p>
          <p className="text-xs opacity-90">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function PrivacySheet({ onClose }: { onClose: () => void }) {
  const items = [
    { Icon: Lock, t: "Local-first", d: "All measurements stay on your device storage." },
    { Icon: Database, t: "No accounts required", d: "Use BMI Pulse without signing up to anything." },
    { Icon: Heart, t: "No tracking", d: "We don't ship analytics or third-party trackers." },
    { Icon: FileText, t: "Exportable", d: "Generate a PDF report any time from History." },
  ];
  return (
    <>
      <SheetHead title="Privacy" subtitle="Your data, your rules" grad="bg-gradient-fire" Icon={Shield} onClose={onClose} />
      <div className="p-5 space-y-3">
        {items.map((it, i) => (
          <motion.div key={it.t} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}
            className="flex gap-3 rounded-2xl bg-secondary p-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-fire text-white shadow-soft shrink-0">
              <it.Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{it.t}</p>
              <p className="text-xs text-muted-foreground leading-snug">{it.d}</p>
            </div>
          </motion.div>
        ))}
        <button onClick={onClose} className="w-full rounded-2xl bg-gradient-fire py-3 font-display font-bold text-white shadow-glow">Got it</button>
      </div>
    </>
  );
}

function AboutSheet({ onClose }: { onClose: () => void }) {
  return (
    <>
      <SheetHead title="BMI Pulse" subtitle="v1.0.0 · made with ❤️" grad="bg-gradient-brand" Icon={Sparkles} onClose={onClose} />
      <div className="p-5 space-y-3 text-sm">
        <p className="text-muted-foreground leading-relaxed">A beautifully animated BMI tracker with goals, history, charts, tips and personalized reports — all running locally on your device.</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[{ k: "Screens", v: "10+" }, { k: "Charts", v: "6" }, { k: "Themes", v: "Live" }].map((s) => (
            <div key={s.k} className="rounded-2xl bg-secondary p-3">
              <p className="font-display font-black text-lg">{s.v}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.k}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-secondary p-3 text-xs">
          <Mail className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">hello@bmipulse.app</span>
        </div>
        <button onClick={onClose} className="w-full rounded-2xl bg-gradient-brand py-3 font-display font-bold text-white shadow-glow">Close</button>
      </div>
    </>
  );
}

function DataSheet({ onClose, onClear, history, acts }: any) {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <SheetHead title="Data &amp; storage" subtitle="Everything stored locally" grad="bg-gradient-mint" Icon={Database} onClose={onClose} />
      <div className="p-5 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-secondary p-3"><p className="font-display font-black text-xl">{history}</p><p className="text-[10px] uppercase text-muted-foreground tracking-wider">BMI logs</p></div>
          <div className="rounded-2xl bg-secondary p-3"><p className="font-display font-black text-xl">{acts}</p><p className="text-[10px] uppercase text-muted-foreground tracking-wider">Activities</p></div>
        </div>
        {!confirm ? (
          <button onClick={() => setConfirm(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 py-3 font-semibold text-destructive">
            <Trash2 className="h-4 w-4" /> Clear all data
          </button>
        ) : (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3 space-y-2">
            <p className="text-xs text-destructive font-semibold">This permanently deletes all logs &amp; activities.</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setConfirm(false)} className="rounded-xl bg-secondary py-2 text-xs font-semibold">Cancel</button>
              <button onClick={onClear} className="rounded-xl bg-destructive py-2 text-xs font-bold text-white">Yes, delete</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function RateSheet({ onClose }: { onClose: () => void }) {
  const [stars, setStars] = useState(0);
  return (
    <>
      <SheetHead title="Rate the app" subtitle="Your feedback shapes BMI Pulse" grad="bg-gradient-sunset" Icon={Star} onClose={onClose} />
      <div className="p-5 space-y-4">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <motion.button key={n} whileTap={{ scale: 0.85 }} onClick={() => setStars(n)}
              className="grid h-12 w-12 place-items-center">
              <Star className={`h-9 w-9 transition ${n <= stars ? "fill-amber-400 text-amber-400 drop-shadow" : "text-muted-foreground"}`} />
            </motion.button>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">{stars > 0 ? `Thanks for the ${stars}★ — keep tracking!` : "Tap to rate"}</p>
        <button disabled={!stars} onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-sunset py-3 font-display font-bold text-white shadow-glow disabled:opacity-50">
          <Check className="h-5 w-5" /> Submit
        </button>
      </div>
    </>
  );
}

function Toggle({ icon: Icon, grad, label, desc, value, onChange }: any) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className={`grid h-11 w-11 place-items-center rounded-2xl text-white shadow-soft ${grad}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1"><p className="font-semibold">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
      <button onClick={() => onChange(!value)}
        className={`relative h-7 w-12 rounded-full transition ${value ? "bg-gradient-brand" : "bg-secondary"}`}>
        <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-soft"
          style={{ left: value ? "calc(100% - 1.625rem)" : "0.125rem" }} />
      </button>
    </div>
  );
}

function RowBtn({ icon: Icon, grad, label, desc, onClick }: any) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 p-4 text-left active:bg-secondary/50 transition">
      <div className={`grid h-11 w-11 place-items-center rounded-2xl text-white shadow-soft ${grad}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1"><p className="font-semibold">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  );
}
