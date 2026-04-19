"use client";

import { useCallback, useEffect, useState } from "react";
import Footer from "../Home/Footer";
import Nav from "../Home/Nav";
import {
  API_BASE_URL,
  Booking,
  fetchJson,
} from "../shared/campusApi";
import {
  DashboardHero,
  EmptyState,
  Panel,
} from "../shared/CampusUi";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Your resource bookings dashboard");
  const [error, setError] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const bookingData = await fetchJson<Booking[]>(`${API_BASE_URL}/bookings`);
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
  }, [loadBookings]);

  async function cancelBooking(id: number) {
    setError("");

    try {
      await fetchJson(`${API_BASE_URL}/bookings/${id}`, {
        method: "DELETE",
      });

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
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <EmptyState text="No bookings yet." />
              ) : (
                bookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-3xl border border-stone-200 bg-stone-50 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-stone-950">
                          {booking.resourceName || "Resource Booking"}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-stone-600">
                          {booking.purpose}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-800">
                        {booking.status || "PENDING"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-stone-600">
                      <p>Date: {booking.date}</p>
                      <p>Time: {booking.startTime} - {booking.endTime}</p>
                      <p>Expected Attendees: {booking.expectedAttendees}</p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                        onClick={() => void cancelBooking(booking.id)}
                        type="button"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  </article>
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
