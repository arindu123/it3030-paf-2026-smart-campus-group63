"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  API_BASE_URL,
  Booking,
  fetchJson,
  getStoredUser,
  normalizeRole,
  UserRole,
  withActorHeaders,
} from "../shared/campusApi";
import { DashboardHero, EmptyState, Panel } from "../shared/CampusUi";
import { SiteFrame } from "../shared/SiteFrame";
import { AdminOperationsSidebar } from "../shared/AdminOperationsSidebar";

type BookingStatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Your resource bookings dashboard");
  const [error, setError] = useState("");
  const [actorRole, setActorRole] = useState<UserRole>("USER");
  const [actorName, setActorName] = useState("Campus Admin");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("ALL");

  const loadBookings = useCallback(async () => {
    const user = getStoredUser();
    if (!user?.email) {
      router.replace("/Component/Login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const bookingData = await fetchJson<Booking[]>(`${API_BASE_URL}/bookings`, withActorHeaders());
      setBookings(bookingData);
      setMessage("Bookings synced with backend API.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.email) {
      return;
    }

    setActorRole(normalizeRole(user.role));
    setActorName(user.fullName?.trim() || user.email);
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  async function cancelBooking(id: number) {
    setError("");

    try {
      await fetchJson(`${API_BASE_URL}/bookings/${id}`, withActorHeaders({ method: "DELETE" }));

      setMessage(`Booking #${id} cancelled.`);
      await loadBookings();
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Failed to cancel booking.");
    }
  }

  const isAdmin = actorRole === "ADMIN";
  const pendingBookings = bookings.filter((booking) => booking.status === "PENDING").length;
  const approvedBookings = bookings.filter((booking) => booking.status === "APPROVED").length;
  const rejectedBookings = bookings.filter((booking) => booking.status === "REJECTED").length;
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (statusFilter !== "ALL" && booking.status !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        booking.resourceName,
        booking.purpose,
        booking.createdBy,
        booking.status,
        booking.date,
        booking.rejectionReason,
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [bookings, normalizedSearch, statusFilter]);

  return (
    <SiteFrame accent={isAdmin ? "sky" : "sky"}>
      <div className={`mx-auto w-full ${isAdmin ? "max-w-[1520px]" : "max-w-7xl"}`}>
        <div className={isAdmin ? "grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]" : ""}>
          {isAdmin ? <AdminOperationsSidebar actorName={actorName} activeSection="bookings" /> : null}

          <div className={isAdmin ? "space-y-6" : ""}>
            {isAdmin ? (
              <>
                <section className="rounded-[2rem] bg-[linear-gradient(135deg,#252d83_0%,#1f2677_100%)] px-7 py-8 text-white shadow-[0_24px_70px_rgba(27,33,100,0.30)]">
                  <h1 className="text-4xl font-semibold tracking-[-0.03em]">Admin Booking Management</h1>
                  <p className="mt-3 max-w-3xl text-base text-blue-100">
                    Review booking requests, track approval flow, and monitor resource demand from one workspace.
                  </p>
                  <button
                    type="button"
                    onClick={() => void loadBookings()}
                    className="mt-6 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    Refresh Bookings
                  </button>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total Bookings</p>
                    <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#1f2677]">{bookings.length}</p>
                  </div>
                  <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pending</p>
                    <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#1f2677]">{pendingBookings}</p>
                  </div>
                  <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Approved</p>
                    <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#1f2677]">{approvedBookings}</p>
                  </div>
                  <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Rejected</p>
                    <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#1f2677]">{rejectedBookings}</p>
                  </div>
                </section>

                <section className="rounded-[1.7rem] border border-white/70 bg-white/90 p-6 shadow-sm">
                  <h2 className="text-4xl font-semibold tracking-[-0.03em] text-[#1f2677]">Filter and Search</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Search bookings by resource, purpose, owner, or date and narrow by booking status.
                  </p>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Search
                      <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search bookings..."
                        className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#1f2677]/40 focus:ring-4 focus:ring-[#1f2677]/10"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Status
                      <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value as BookingStatusFilter)}
                        className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#1f2677]/40 focus:ring-4 focus:ring-[#1f2677]/10"
                      >
                        <option value="ALL">ALL</option>
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </label>
                  </div>
                </section>
              </>
            ) : (
              <DashboardHero
                description="View and manage all your resource bookings. Track pending requests and upcoming reservations."
                eyebrow="UniDesk Booking Desk"
                error={error}
                message={message}
                onRefresh={() => void loadBookings()}
                stats={[
                  { label: "Bookings", value: String(bookings.length), tone: "cool" },
                  { label: "Pending", value: String(pendingBookings), tone: "warm" },
                  { label: "Backend", value: loading ? "Syncing" : "Online", tone: "dark" },
                ]}
                title="Track all your resource bookings."
              />
            )}

            <Panel
              eyebrow="Bookings"
              title="Your bookings overview"
              description="View all booked resources with their status and details."
            >
              {!isAdmin ? (
                <label className="mb-5 block text-sm font-medium text-stone-700">
                  Search bookings
                  <input
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by resource, purpose, or status"
                    type="search"
                    value={searchTerm}
                  />
                </label>
              ) : null}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bookings.length === 0 ? (
                  <div className="md:col-span-2 lg:col-span-3">
                    <EmptyState text="No bookings yet." />
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="md:col-span-2 lg:col-span-3">
                    <EmptyState text="No bookings match your filters." />
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-stone-300 hover:shadow-lg"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-stone-950 group-hover:text-stone-900">
                            {booking.resourceName || "Resource Booking"}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                            {booking.purpose}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${
                            booking.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : booking.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : booking.status === "CANCELLED"
                                  ? "bg-stone-200 text-stone-700"
                                  : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {booking.status || "PENDING"}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-stone-600">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{booking.expectedAttendees} attendees</span>
                        </div>
                      </div>

                      {booking.rejectionReason ? (
                        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                          <p className="font-medium">Rejection Reason:</p>
                          <p>{booking.rejectionReason}</p>
                        </div>
                      ) : null}

                      <div className="mt-6 flex justify-end">
                        <button
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50"
                          onClick={() => void cancelBooking(booking.id)}
                          type="button"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </SiteFrame>
  );
}
