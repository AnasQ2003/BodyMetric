import { useEffect, useState, useCallback } from "react";

export type BmiEntry = {
  id: string;
  date: string;
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female";
  bmi: number;
  category: string;
};

export type Activity = {
  id: string;
  date: string;
  type: string;
  minutes: number;
  calories: number;
};

export type AppNotification = {
  id: string;
  date: string;
  title: string;
  body: string;
  kind: "tip" | "goal" | "reminder" | "achievement";
  route: string;
  read: boolean;
};

export type Profile = {
  name: string;
  email: string;
  age: number;
  gender: "male" | "female";
  height: number;
  weight: number;
  goal: "lose" | "maintain" | "gain";
  targetWeight: number;
  activityLevel: "low" | "moderate" | "high";
  avatarHue: number;
  onboarded: boolean;
  authed: boolean;
};

export const defaultProfile: Profile = {
  name: "",
  email: "",
  age: 25,
  gender: "male",
  height: 172,
  weight: 68,
  goal: "maintain",
  targetWeight: 68,
  activityLevel: "moderate",
  avatarHue: 295,
  onboarded: false,
  authed: false,
};

const KEYS = {
  history: "bmi:history",
  profile: "bmi:profile",
  last: "bmi:last",
  activities: "bmi:activities",
  notifs: "bmi:notifs",
};

export function calcBMI(weightKg: number, heightCm: number) {
  const h = heightCm / 100;
  if (!h) return 0;
  return +(weightKg / (h * h)).toFixed(1);
}

export type Category = {
  key: "under" | "healthy" | "over" | "obese";
  label: string;
  gradient: string;
  color: string;
  ring: string;
  tone: string;
  risk: "safe" | "watch" | "warn" | "danger";
  message: string;
};

export function bmiCategory(bmi: number): Category {
  if (bmi < 18.5)
    return {
      key: "under",
      label: "Underweight",
      gradient: "bg-gradient-ocean",
      color: "var(--brand-2)",
      ring: "ring-sky-400",
      tone: "sky",
      risk: "watch",
      message: "Below healthy range — focus on nutrient-dense meals.",
    };
  if (bmi < 25)
    return {
      key: "healthy",
      label: "Healthy",
      gradient: "bg-gradient-mint",
      color: "var(--success)",
      ring: "ring-emerald-400",
      tone: "emerald",
      risk: "safe",
      message: "You're in the healthy range. Keep it steady!",
    };
  if (bmi < 30)
    return {
      key: "over",
      label: "Overweight",
      gradient: "bg-gradient-sunset",
      color: "var(--warn)",
      ring: "ring-amber-400",
      tone: "amber",
      risk: "warn",
      message: "Above healthy — small habits make big shifts.",
    };
  return {
    key: "obese",
    label: "Obese",
    gradient: "bg-gradient-fire",
    color: "var(--danger)",
    ring: "ring-rose-500",
    tone: "rose",
    risk: "danger",
    message: "Health risk zone — consult a professional.",
  };
}

export function suggestGoalWeight(p: Pick<Profile, "height" | "goal" | "weight">) {
  const ideal = 22 * (p.height / 100) ** 2;
  if (p.goal === "lose") return Math.round(Math.min(p.weight - 1, ideal));
  if (p.goal === "gain") return Math.round(Math.max(p.weight + 1, ideal));
  return Math.round(ideal);
}

function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setV({ ...(initial as any), ...JSON.parse(raw) });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [v, setV] as const;
}

function useList<T extends { id: string }>(key: string) {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, [key]);
  const save = (n: T[]) => {
    setItems(n);
    localStorage.setItem(key, JSON.stringify(n));
  };
  return {
    items,
    add: (e: T) => save([e, ...items].slice(0, 200)),
    remove: (id: string) => save(items.filter((i) => i.id !== id)),
    update: (id: string, patch: Partial<T>) =>
      save(items.map((i) => (i.id === id ? { ...i, ...patch } : i))),
    clear: () => save([]),
    replace: save,
  };
}

export function useHistory() {
  return useList<BmiEntry>(KEYS.history);
}
export function useActivities() {
  return useList<Activity>(KEYS.activities);
}
export function useNotifications() {
  const l = useList<AppNotification>(KEYS.notifs);
  return {
    ...l,
    unread: l.items.filter((i) => !i.read).length,
    markRead: (id: string) => l.update(id, { read: true } as any),
    markAllRead: () => l.replace(l.items.map((i) => ({ ...i, read: true }))),
  };
}

export function useProfile() {
  const [profile, setProfile] = usePersisted<Profile>(KEYS.profile, defaultProfile);
  const update = useCallback(
    (p: Partial<Profile>) => {
      setProfile((prev) => {
        const next = { ...prev, ...p };
        try {
          localStorage.setItem(KEYS.profile, JSON.stringify(next));
          window.dispatchEvent(new CustomEvent("bmi:profile-updated", { detail: next }));
        } catch {}
        return next;
      });
    },
    [setProfile],
  );
  useEffect(() => {
    const onUpd = (e: any) => {
      if (e?.detail) setProfile(e.detail);
    };
    window.addEventListener("bmi:profile-updated", onUpd);
    return () => window.removeEventListener("bmi:profile-updated", onUpd);
  }, [setProfile]);
  return { profile, update };
}

export function useLastResult() {
  const [last, setLast] = useState<BmiEntry | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEYS.last);
      if (raw) setLast(JSON.parse(raw));
    } catch {}
  }, []);
  return {
    last,
    set: (e: BmiEntry) => {
      setLast(e);
      localStorage.setItem(KEYS.last, JSON.stringify(e));
    },
  };
}

export function seedNotifications() {
  try {
    const raw = localStorage.getItem(KEYS.notifs);
    if (raw && JSON.parse(raw).length) return;
    const seed: AppNotification[] = [
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        title: "Welcome to BMI Pulse 🎉",
        body: "Tap to log your first measurement.",
        kind: "reminder",
        route: "/home",
        read: false,
      },
      {
        id: crypto.randomUUID(),
        date: new Date(Date.now() - 3600e3).toISOString(),
        title: "Daily tip ready",
        body: "Hydrate — 2L of water boosts metabolism.",
        kind: "tip",
        route: "/tips",
        read: false,
      },
      {
        id: crypto.randomUUID(),
        date: new Date(Date.now() - 86400e3).toISOString(),
        title: "Goal progress",
        body: "You're 18% closer to your target. Keep going!",
        kind: "goal",
        route: "/goals",
        read: true,
      },
    ];
    localStorage.setItem(KEYS.notifs, JSON.stringify(seed));
  } catch {}
}
