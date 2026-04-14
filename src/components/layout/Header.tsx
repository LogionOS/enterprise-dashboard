"use client";

import {
  Bell,
  Search,
  LogOut,
  Menu,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Shield,
  Info,
  BellRing,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Notification } from "@/lib/types";

function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString();
}

function notificationTypeIcon(type: string) {
  const t = type.toLowerCase();
  if (/incident|error|fail|critical/.test(t))
    return { Icon: AlertTriangle, className: "text-amber-400" };
  if (/warn/.test(t)) return { Icon: AlertCircle, className: "text-orange-400" };
  if (/success|resolved|ok|complete/.test(t))
    return { Icon: CheckCircle2, className: "text-emerald-400" };
  if (/policy|rule|pack/.test(t)) return { Icon: Shield, className: "text-indigo-400" };
  if (/info|notice|system/.test(t)) return { Icon: Info, className: "text-sky-400" };
  return { Icon: BellRing, className: "text-gray-400" };
}

type HeaderProps = {
  showMobileNavToggle?: boolean;
  onMobileNavToggle?: () => void;
};

export default function Header({
  showMobileNavToggle = false,
  onMobileNavToggle,
}: HeaderProps) {
  const router = useRouter();
  const [connected, setConnected] = useState<boolean | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const baseUrl =
      localStorage.getItem("logionos_api_url") ||
      "https://logionos-api.onrender.com";
    const key = localStorage.getItem("logionos_api_key");
    fetch(`${baseUrl}/v1/health`, {
      headers: key ? { Authorization: `Bearer ${key}` } : {},
    })
      .then((r) => setConnected(r.ok))
      .catch(() => setConnected(false));
  }, []);

  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await api.notifications(10, true);
      setNotifications(res.notifications ?? []);
      setUnreadCount(res.unread_count ?? 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
    const id = window.setInterval(() => void loadNotifications(), 60_000);
    return () => window.clearInterval(id);
  }, [loadNotifications]);

  useEffect(() => {
    if (!notificationsOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const el = notifWrapRef.current;
      if (el && !el.contains(e.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [notificationsOpen]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const toggleNotifications = () => {
    setNotificationsOpen((o) => !o);
    if (!notificationsOpen) void loadNotifications();
  };

  const handleMarkOneRead = async (n: Notification) => {
    if (n.is_read) return;
    try {
      await api.markNotificationRead(n.id);
      setNotifications((prev) => prev.filter((x) => x.id !== n.id));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  return (
    <header className="h-16 bg-[#0d1117]/80 backdrop-blur-md border-b border-[#1e293b] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 max-w-md min-w-0">
        {showMobileNavToggle && (
          <button
            type="button"
            onClick={onMobileNavToggle}
            className="md:hidden flex-shrink-0 p-2 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Search className="w-4 h-4 text-gray-500 hidden sm:block flex-shrink-0" />
        <input
          type="text"
          placeholder="Search rules, events, policies..."
          className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-full"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              connected === null
                ? "bg-gray-500 animate-pulse"
                : connected
                  ? "bg-emerald-400"
                  : "bg-red-400"
            }`}
          />
          <span className="text-xs text-gray-500">
            {connected === null
              ? "Connecting..."
              : connected
                ? "API Connected"
                : "Disconnected"}
          </span>
        </div>

        <div className="relative" ref={notifWrapRef}>
          <button
            type="button"
            onClick={toggleNotifications}
            className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-expanded={notificationsOpen}
            aria-haspopup="true"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-[#1e293b] bg-[#111827] shadow-xl z-50 overflow-hidden flex flex-col max-h-[min(70vh,24rem)]"
              role="dialog"
              aria-label="Notifications"
            >
              <div className="px-3 py-2.5 border-b border-[#1e293b] flex items-center justify-between shrink-0">
                <span className="text-sm font-medium text-gray-200">Notifications</span>
                {notifLoading && (
                  <span className="text-[10px] text-gray-500">Updating…</span>
                )}
              </div>
              <div className="overflow-y-auto flex-1 min-h-0">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No unread notifications
                  </div>
                ) : (
                  <ul className="py-1">
                    {notifications.map((n) => {
                      const { Icon, className } = notificationTypeIcon(n.type);
                      return (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => void handleMarkOneRead(n)}
                            className="w-full text-left px-3 py-2.5 flex gap-3 hover:bg-white/5 transition-colors border-b border-[#1e293b]/60 last:border-0"
                          >
                            <div
                              className={`mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-[#0d1117] border border-[#1e293b] flex items-center justify-center ${className}`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-200 truncate">
                                {n.title}
                              </div>
                              <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                {n.message}
                              </div>
                              <div className="text-[10px] text-gray-600 mt-1">
                                {formatTimeAgo(n.created_at)}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-2 border-t border-[#1e293b] shrink-0">
                  <button
                    type="button"
                    onClick={() => void handleMarkAllRead()}
                    className="w-full py-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
