"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../Home/Footer";
import Nav from "../Home/Nav";
import {
  API_BASE_URL,
  Booking,
  fetchJson,
  getStoredUser,
  withActorHeaders,
} from "../shared/campusApi";
import {
  DashboardHero,
  EmptyState,
  Panel,
} from "../shared/CampusUi";

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Your resource bookings dashboard");
  const [error, setError] = useState("");

  const loadBookings = useCallback(async () => {
    if (!getStoredUser()?.email) {
      router.replace("/Component/Login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const bookingData = await fetchJson<Booking[]>(
        `${API_BASE_URL}/bookings`,
        withActorHeaders()
      );
      setBookings(bookingData);
      setMessage("Bookings synced with backend API.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings, router]);

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

  const pendingBookings = bookings.filter((booking) => booking.status === "PENDING").length;

  return (
    <div>
      <Nav />
      <main
        className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_40%),linear-gradient(180deg,_#eef6ff_0%,_#ddeefe_48%,_#c8dff7_100%)] px-4 pb-8 pt-28 text-stone-900 sm:px-6 lg:px-8"
        suppressHydrationWarning
      >
        <div className="mx-auto max-w-7xl">
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

          <Panel
            eyebrow="Bookings"
            title="Your bookings overview"
            description="View all your booked resources with their status and details."
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bookings.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3">
                  <EmptyState text="No bookings yet." />
                </div>
              ) : (
                bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-lg hover:border-stone-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-stone-950 group-hover:text-stone-900">
                          {booking.resourceName || "Resource Booking"}
                        </h3>
                        <p className="mt-1 text-sm text-stone-600 line-clamp-2">
                          {booking.purpose}
                        </p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${
                        booking.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : booking.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
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

                    {booking.rejectionReason && (
                      <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        <p className="font-medium">Rejection Reason:</p>
                        <p>{booking.rejectionReason}</p>
                      </div>
                    )}

                    <div className="mt-6 flex justify-end">
                      <button
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 hover:border-red-300"
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
      </main>
      <Footer />
    </div>
  );
}
