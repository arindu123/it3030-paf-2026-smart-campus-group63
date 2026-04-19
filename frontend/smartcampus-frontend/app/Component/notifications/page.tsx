"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GlassPanel,
  MetricTile,
  PageHero,
  SectionHeading,
  SiteFrame,
} from "../shared/SiteFrame";
import {
  API_BASE_URL,
  CampusNotification,
  fetchJson,
  getStoredUser,
  withActorHeaders,
} from "../shared/campusApi";

const filters = ["all", "unread", "tickets", "bookings"] as const;

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("Loading unified notifications...");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchJson<CampusNotification[]>(
        `${API_BASE_URL}/notifications`,
        withActorHeaders()
      );
      setNotifications(data);
      setMessage("Notification inbox synced with backend API.");
    } catch (caught) {
      const fallbackMessage =
        caught instanceof Error && caught.message.toLowerCase().includes("failed to fetch")
          ? "Backend is not reachable at http://localhost:8089. Start the backend before opening notifications."
          : caught instanceof Error
            ? caught.message
            : "Unable to load notifications.";

      setError(fallbackMessage);
      setMessage("Notifications could not sync right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.email) {
      router.replace("/Component/Login");
      return;
    }

    void loadNotifications();
  }, [loadNotifications, router]);

  useEffect(() => {
    if (!getStoredUser()?.email) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [loadNotifications]);

  async function markAsRead(notificationId: number) {
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
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to mark notification as read.");
    }
  }

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case "unread":
        return notifications.filter((notification) => !notification.read);
      case "tickets":
        return notifications.filter((notification) => notification.relatedType === "TICKET");
      case "bookings":
        return notifications.filter((notification) => notification.relatedType === "BOOKING");
      default:
        return notifications;
    }
  }, [filter, notifications]);

  const bookingCount = useMemo(
    () => notifications.filter((notification) => notification.relatedType === "BOOKING").length,
    [notifications]
  );

  const ticketCount = useMemo(
    () => notifications.filter((notification) => notification.relatedType === "TICKET").length,
    [notifications]
  );

  return (
    <SiteFrame accent="mint">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <PageHero
          eyebrow="Notifications"
          title="One inbox for booking approvals, ticket updates, and comment activity."
          description="Track role-specific alerts across USER, ADMIN, and TECHNICIAN workflows without leaving the dashboard shell."
          aside={
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-green-200">Unread</p>
                <p className="mt-3 text-3xl font-semibold">{unreadCount}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-green-200">Feed Status</p>
                <p className="mt-3 text-lg font-semibold">{loading ? "Syncing..." : "Live"}</p>
              </div>
            </div>
          }
        />

        <section className="grid gap-4 md:grid-cols-4">
          <MetricTile label="Total" value={String(notifications.length)} detail="All inbox entries for the signed-in user" />
          <MetricTile label="Unread" value={String(unreadCount)} detail="Notifications waiting for acknowledgment" />
          <MetricTile label="Bookings" value={String(bookingCount)} detail="Approval, rejection, and cancellation updates" />
          <MetricTile label="Tickets" value={String(ticketCount)} detail="Status changes, comments, assignments, and resolution notes" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <GlassPanel>
            <SectionHeading
              eyebrow="Inbox Strategy"
              title="Professional notification stream for all campus workflows."
              description={message}
            />
            {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

            <div className="mt-6 flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    filter === item
                      ? "bg-stone-950 text-white"
                      : "border border-stone-200 bg-white text-stone-600 hover:border-orange-200 hover:text-orange-900"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </GlassPanel>

          <div className="grid gap-4">
            {filteredNotifications.length === 0 && !loading ? (
              <GlassPanel>
                <p className="text-sm text-stone-600">
                  No notifications match this filter. When bookings, tickets, or comments change,
                  they will appear here.
                </p>
              </GlassPanel>
            ) : null}

            {filteredNotifications.map((notification) => (
              <GlassPanel key={notification.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold tracking-[-0.03em] text-stone-950">
                        {notification.title}
                      </h3>
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                        {notification.relatedType}
                      </span>
                      <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-800">
                        {notification.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{notification.message}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone-400">
                      {notification.recipientRole} • {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                        notification.read
                          ? "bg-stone-100 text-stone-500"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {notification.read ? "Read" : "Unread"}
                    </span>
                    {!notification.read ? (
                      <button
                        type="button"
                        onClick={() => void markAsRead(notification.id)}
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                      >
                        Mark read
                      </button>
                    ) : null}
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </section>
      </div>
    </SiteFrame>
  );
}
