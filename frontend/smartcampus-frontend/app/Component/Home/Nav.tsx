"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  API_BASE_URL,
  CampusNotification,
  fetchJson,
  getStoredUser,
  StoredUser as SharedStoredUser,
  withActorHeaders,
} from "../shared/campusApi";

function getDashboardByRole(role?: string | null) {
  const normalizedRole = role?.toUpperCase();

  if (normalizedRole === "ADMIN") {
    return "/Component/dashboard/admin";
  }

  if (normalizedRole === "TECHNICIAN") {
    return "/Component/dashboard/technician";
  }

  return "/Component/dashboard/user";
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SharedStoredUser | null>(null);
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const loadNotificationSummary = useCallback(async () => {
    if (!getStoredUser()?.email) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const [notificationData, unreadData] = await Promise.all([
        fetchJson<CampusNotification[]>(`${API_BASE_URL}/notifications`, withActorHeaders()),
        fetchJson<{ count: number }>(`${API_BASE_URL}/notifications/unread-count`, withActorHeaders()),
      ]);

      setNotifications(notificationData.slice(0, 5));
      setUnreadCount(unreadData.count);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setUser(getStoredUser());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!user?.email) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    void loadNotificationSummary();
    const intervalId = window.setInterval(() => {
      void loadNotificationSummary();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [loadNotificationSummary, user?.email]);

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    let aborted = false;
    const email = user.email;

    async function pingPresence() {
      if (aborted) {
        return;
      }

      try {
        await fetch(`${API_BASE_URL}/presence/heartbeat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
          keepalive: true,
        });
      } catch {
        // Best-effort presence updates only.
      }
    }

    void pingPresence();
    const intervalId = window.setInterval(() => {
      void pingPresence();
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void pingPresence();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      aborted = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.email]);

  const navItems = [
    ...(!user ? [{ href: "/", label: "Home" }] : []),
    ...(user ? [{ href: getDashboardByRole(user.role), label: "Dashboard" }] : []),
    { href: "/Component/resources", label: "Resources" },
    { href: "/Component/bookings", label: "Bookings" },
    { href: "/Component/Ticket", label: "Tickets" },
    { href: "/Component/notifications", label: "Updates" },
  ];

  const recentNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  async function markNotificationRead(notificationId: number) {
    try {
      await fetchJson<CampusNotification>(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        withActorHeaders({ method: "PATCH" })
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount((current) => Math.max(current - 1, 0));
    } catch {
      // Keep dropdown usable even if a background mark-read fails.
    }
  }

  function logout() {
    window.localStorage.removeItem("smartcampusUser");
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    router.push("/");
  }

  const bellButton = user ? (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsNotificationOpen((current) => !current)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:border-orange-200 hover:text-orange-900"
        aria-label="Open notifications"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0" />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {isNotificationOpen ? (
        <div className="absolute right-0 top-14 w-80 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Alerts</p>
              <p className="text-sm font-semibold text-stone-900">{unreadCount} unread</p>
            </div>
            <Link
              href="/Component/notifications"
              onClick={() => setIsNotificationOpen(false)}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 transition hover:text-orange-900"
            >
              View all
            </Link>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {recentNotifications.length === 0 ? (
              <div className="px-3 py-6 text-sm text-stone-500">No notifications yet.</div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`mb-2 rounded-2xl border px-3 py-3 last:mb-0 ${
                    notification.read ? "border-stone-100 bg-stone-50" : "border-orange-100 bg-orange-50/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-950">{notification.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-600">{notification.message}</p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-stone-400">
                        {notification.type.replace(/_/g, " ")}
                      </p>
                    </div>
                    {!notification.read ? (
                      <button
                        type="button"
                        onClick={() => void markNotificationRead(notification.id)}
                        className="rounded-full border border-orange-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-orange-800 transition hover:bg-orange-100"
                      >
                        Mark
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="flex w-full flex-col gap-4 border-b border-white/60 bg-white/90 px-5 py-4 shadow-[0_18px_50px_rgba(42,31,17,0.12)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group ml-30">
            <Image
              src="/uni desk logo.png"
              alt="UniDesk logo"
              width={450}
              height={101}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          {user ? (
            <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-orange-800 lg:hidden">
              {user.role || "USER"}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-stone-600">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 transition ${
                  isActive
                    ? "border border-orange-200 bg-orange-100 text-orange-900 shadow-sm"
                    : "hover:bg-stone-100 hover:text-stone-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user ? (
            <>
              {bellButton}
              <div className="hidden rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-right lg:block">
                <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Signed in</p>
                <p className="text-sm font-semibold text-stone-900">
                  {user.fullName || user.email}
                </p>
              </div>
              <Link
                href="/Component/profile"
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="rounded-full bg-[linear-gradient(135deg,#EE9B13,#D78A0F)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-900/25 transition hover:brightness-105"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/Component/Login"
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
              >
                Login
              </Link>
              <Link
                href="/Component/Register"
                className="rounded-full border border-orange-200 bg-orange-100 px-5 py-2 text-sm font-semibold text-orange-900 shadow-sm transition hover:bg-orange-200"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
