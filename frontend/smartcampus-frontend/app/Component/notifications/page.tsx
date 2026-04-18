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
  fetchJson,
  getStoredUser,
  TicketNotification,
  withActorHeaders,
} from "../shared/campusApi";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<TicketNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("Loading notifications...");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchJson<TicketNotification[]>(
        `${API_BASE_URL}/tickets/notifications`,
        withActorHeaders()
      );
      setNotifications(data);
      setMessage("Notification feed synced.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load notifications.");
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

  async function markAsRead(notificationId: number) {
    try {
      await fetchJson<TicketNotification>(
        `${API_BASE_URL}/tickets/notifications/${notificationId}/read`,
        withActorHeaders({
          method: "PATCH",
        })
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
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

  return (
    <SiteFrame accent="mint">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <PageHero
          eyebrow="Notifications"
          title="Ticket status changes and comment alerts in one notification feed."
          description="Users receive updates whenever ticket status changes or new comments are added to their tickets."
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

        <section className="grid gap-4 md:grid-cols-3">
          <MetricTile label="Total" value={String(notifications.length)} detail="All ticket-related notifications for the signed-in user" />
          <MetricTile label="Unread" value={String(unreadCount)} detail="Status updates and new comments not yet acknowledged" />
          <MetricTile label="Channel" value="Ticketing" detail="Maintenance and incident workflow notifications only" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <GlassPanel>
            <SectionHeading
              eyebrow="Notification Strategy"
              title="Actionable ticket updates for end users."
              description={message}
            />
            {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          </GlassPanel>

          <div className="grid gap-4">
            {notifications.length === 0 && !loading ? (
              <GlassPanel>
                <p className="text-sm text-stone-600">
                  No notifications yet. Once someone comments on your ticket or updates its status,
                  alerts will appear here.
                </p>
              </GlassPanel>
            ) : null}

            {notifications.map((notification) => (
              <GlassPanel key={notification.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.03em] text-stone-950">
                      Ticket #{notification.ticketId}{" "}
                      <span className="text-base font-medium text-stone-500">
                        ({notification.type.replace("_", " ")})
                      </span>
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{notification.message}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone-400">
                      {new Date(notification.createdAt).toLocaleString()}
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
                        Mark Read
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
