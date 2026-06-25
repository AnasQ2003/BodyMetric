import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Lightbulb, Target, Award, BellRing, Check } from "lucide-react";
import { useNotifications } from "@/lib/bmi-store";

export const Route = createFileRoute("/_app/notifications")({ component: NotificationsPage });

const iconFor = {
  tip: Lightbulb,
  goal: Target,
  reminder: BellRing,
  achievement: Award,
} as const;

const gradFor = {
  tip: "bg-gradient-mint",
  goal: "bg-gradient-brand",
  reminder: "bg-gradient-ocean",
  achievement: "bg-gradient-sunset",
} as const;

function NotificationsPage() {
  const { items, remove, markRead, markAllRead, unread } = useNotifications();
  const navigate = useNavigate();

  const open = (id: string, route: string) => {
    markRead(id);
    navigate({ to: route as any });
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-brand p-5 text-white shadow-glow relative overflow-hidden"
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-80">Inbox</p>
            <h2 className="font-display text-2xl font-bold mt-1">{unread} unread</h2>
          </div>
          <Bell className="h-10 w-10 opacity-80" />
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-bold backdrop-blur"
          >
            <Check className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </motion.div>

      {items.length === 0 ? (
        <div className="rounded-3xl bg-card p-10 text-center shadow-soft">
          <Bell className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="font-display font-bold mt-2">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {items.map((n, i) => {
              const Icon = iconFor[n.kind];
              return (
                <motion.button
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => open(n.id, n.route)}
                  className={`relative flex w-full items-start gap-3 rounded-2xl p-3 text-left shadow-soft active:scale-[0.98] transition ${n.read ? "bg-card" : "bg-card ring-2 ring-primary/40"}`}
                >
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white ${gradFor[n.kind]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.date).toLocaleString()}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-gradient-fire animate-pulse" />
                  )}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(n.id);
                    }}
                    className="text-[10px] text-muted-foreground self-end px-1"
                  >
                    ✕
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
