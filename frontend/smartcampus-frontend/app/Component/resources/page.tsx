"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { API_BASE_URL, BookingForm, defaultBookingForm, fetchJson, Resource } from "../shared/campusApi";
import { DashboardHero, EmptyState, Panel } from "../shared/CampusUi";
import { SiteFrame } from "../shared/SiteFrame";

export default function ResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Backend connected. Showing live campus resource availability.");
  const [error, setError] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingForm>(defaultBookingForm(0, ""));
  const [bookingError, setBookingError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const resourceData = await fetchJson<Resource[]>(`${API_BASE_URL}/resources`);
      setResources(resourceData);
      setMessage("Availability overview synced with backend API.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load backend data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  function openBookingModal(resourceId: number, resourceName: string) {
    setBookingForm(defaultBookingForm(resourceId, resourceName));
    setBookingError("");
    setIsBookingModalOpen(true);
  }

  function closeBookingModal() {
    setIsBookingModalOpen(false);
    setBookingError("");
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingError("");

    if (!bookingForm.date || !bookingForm.startTime || !bookingForm.endTime || !bookingForm.purpose || !bookingForm.expectedAttendees) {
      setBookingError("Please fill in all fields.");
      return;
    }

    if (bookingForm.date < today) {
      setBookingError("Please select today or a future date.");
      return;
    }

    if (bookingForm.date === today && bookingForm.startTime < currentTime) {
      setBookingError("Please select a start time later than the current time.");
      return;
    }

    if (bookingForm.endTime <= bookingForm.startTime) {
      setBookingError("End time must be later than start time.");
      return;
    }

    try {
      await fetchJson(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingForm,
          expectedAttendees: Number(bookingForm.expectedAttendees),
        }),
      });

      setMessage(`Booking created successfully for ${bookingForm.resourceName}.`);
      closeBookingModal();
      router.push("/Component/bookings");
    } catch (bookError) {
      setBookingError(bookError instanceof Error ? bookError.message : "Failed to create booking.");
    }
  }

  const activeResources = resources.filter((resource) => resource.status === "ACTIVE").length;
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredResources = resources.filter((resource) => {
    if (!normalizedSearchTerm) {
      return true;
    }

    return [resource.name, resource.type, resource.location, resource.description, resource.status, String(resource.capacity)]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearchTerm));
  });

  return (
    <SiteFrame accent="sky">
      <div className="mx-auto max-w-7xl">
        <DashboardHero
          description="Browse current campus resource availability from one clean overview while admin resource management stays inside the admin dashboard."
          eyebrow="UniDesk Resource Desk"
          error={error}
          message={message}
          onRefresh={() => void loadResources()}
          stats={[
            { label: "Resources", value: String(resources.length), tone: "cool" },
            { label: "Active", value: String(activeResources), tone: "warm" },
            { label: "Backend", value: loading ? "Syncing" : "Online", tone: "dark" },
          ]}
          title="Availability overview for campus resources."
        />

        <section className="grid gap-8" suppressHydrationWarning>
          <Panel
            eyebrow="Resources"
            title="Availability overview"
            description="See which labs, rooms, and equipment are currently available."
          >
            <label className="mb-5 block text-sm font-medium text-stone-700">
              Search resources
              <input
                className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, type, location, status, or capacity"
                type="search"
                value={searchTerm}
              />
            </label>

            <div className="space-y-4">
              {resources.length === 0 ? (
                <EmptyState text="No resources are available right now." />
              ) : filteredResources.length === 0 ? (
                <EmptyState text="No resources match your search." />
              ) : (
                filteredResources.map((resource) => (
                  <article
                    key={resource.id}
                    className="rounded-3xl border border-stone-200 bg-stone-50 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-stone-950">{resource.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-stone-600">
                          {resource.description}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-800">
                        {resource.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-stone-600">
                      <p>Type: {resource.type}</p>
                      <p>Capacity: {resource.capacity}</p>
                      <p>Location: {resource.location}</p>
                      <p>
                        Available: {resource.availableFrom} - {resource.availableTo}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                        onClick={() => openBookingModal(resource.id, resource.name)}
                        type="button"
                      >
                        Book
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </Panel>
        </section>

        {isBookingModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="mb-2 text-2xl font-bold text-stone-950">Book Resource</h2>
              <p className="mb-4 text-sm text-stone-600">{bookingForm.resourceName}</p>

              {bookingError ? (
                <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                  {bookingError}
                </div>
              ) : null}

              <form className="space-y-4" onSubmit={submitBooking}>
                <div>
                  <label className="block text-sm font-medium text-stone-700">Date</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-blue-500 focus:outline-none"
                    min={today}
                    type="date"
                    value={bookingForm.date}
                    onChange={(event) =>
                      setBookingForm((current) => ({ ...current, date: event.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Start Time</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-blue-500 focus:outline-none"
                      min={bookingForm.date === today ? currentTime : undefined}
                      type="time"
                      value={bookingForm.startTime}
                      onChange={(event) =>
                        setBookingForm((current) => ({ ...current, startTime: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">End Time</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-blue-500 focus:outline-none"
                      min={bookingForm.startTime || (bookingForm.date === today ? currentTime : undefined)}
                      type="time"
                      value={bookingForm.endTime}
                      onChange={(event) =>
                        setBookingForm((current) => ({ ...current, endTime: event.target.value }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700">Purpose</label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-blue-500 focus:outline-none"
                    rows={3}
                    value={bookingForm.purpose}
                    onChange={(event) =>
                      setBookingForm((current) => ({ ...current, purpose: event.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700">Expected Attendees</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-blue-500 focus:outline-none"
                    type="number"
                    value={bookingForm.expectedAttendees}
                    onChange={(event) =>
                      setBookingForm((current) => ({ ...current, expectedAttendees: event.target.value }))
                    }
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    className="flex-1 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                    type="submit"
                  >
                    Book
                  </button>
                  <button
                    className="flex-1 rounded-full bg-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
                    type="button"
                    onClick={closeBookingModal}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </SiteFrame>
  );
}
