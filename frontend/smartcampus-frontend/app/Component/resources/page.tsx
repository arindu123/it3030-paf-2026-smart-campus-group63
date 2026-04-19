"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  API_BASE_URL,
  BookingForm,
  defaultBookingForm,
  fetchJson,
  getStoredUser,
  normalizeRole,
  Resource,
  UserRole,
} from "../shared/campusApi";
import { DashboardHero, EmptyState, Panel } from "../shared/CampusUi";
import { SiteFrame } from "../shared/SiteFrame";
import { AdminOperationsSidebar } from "../shared/AdminOperationsSidebar";

type ResourceStatusFilter = "ALL" | "ACTIVE" | "OUT_OF_SERVICE";

type BookedSlot = {
  startTime: string;
  endTime: string;
};

export default function ResourcesPage() {
  const router = useRouter();
  const [actorRole, setActorRole] = useState<UserRole>("USER");
  const [actorName, setActorName] = useState("Campus Admin");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Backend connected. Showing live campus resource availability.");
  const [error, setError] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingForm>(defaultBookingForm(0, ""));
  const [bookingError, setBookingError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResourceStatusFilter>("ALL");

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
    const storedUser = getStoredUser();
    if (!storedUser?.email) {
      return;
    }

    setActorRole(normalizeRole(storedUser.role));
    setActorName(storedUser.fullName?.trim() || storedUser.email);
  }, []);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  function openBookingModal(resourceId: number, resourceName: string) {
    setBookingForm(defaultBookingForm(resourceId, resourceName));
    setBookingError("");
    setSelectedResourceId(resourceId);
    setBookedSlots([]);
    setIsBookingModalOpen(true);
  }

  async function loadBookedSlots(resourceId: number, date: string) {
    try {
      const allBookings = await fetchJson<Array<{ id: number; resourceName: string; date: string; startTime: string; endTime: string; status: string }>>
        (`${API_BASE_URL}/bookings`);
      
      const selectedResource = resources.find((r) => r.id === resourceId);
      const approvedBookings = allBookings.filter(
        (booking) =>
          booking.resourceName === selectedResource?.name &&
          booking.date === date &&
          booking.status === "APPROVED"
      );
      
      const slots = approvedBookings.map((booking) => ({
        startTime: booking.startTime,
        endTime: booking.endTime,
      }));
      
      setBookedSlots(slots);
    } catch {
      setBookedSlots([]);
    }
  }

  function isTimeSlotConflict(startTime: string, endTime: string): boolean {
    if (!startTime || !endTime) return false;
    
    return bookedSlots.some((slot) => {
      const newStart = startTime;
      const newEnd = endTime;
      const bookedStart = slot.startTime;
      const bookedEnd = slot.endTime;
      
      return newStart < bookedEnd && newEnd > bookedStart;
    });
  }

  function closeBookingModal() {
    setIsBookingModalOpen(false);
    setBookingError("");
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingError("");

    if (
      !bookingForm.date ||
      !bookingForm.startTime ||
      !bookingForm.endTime ||
      !bookingForm.purpose ||
      !bookingForm.expectedAttendees
    ) {
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

    if (isTimeSlotConflict(bookingForm.startTime, bookingForm.endTime)) {
      setBookingError("This time slot is already booked. Please select a different time.");
      return;
    }

    try {
      const userJson = window.localStorage.getItem("smartcampusUser");
      const userEmail = userJson ? (JSON.parse(userJson) as { email?: string }).email : "";

      if (!userEmail) {
        setBookingError("User email not found. Please log in again.");
        return;
      }

      await fetchJson(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": userEmail,
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

  const isAdmin = actorRole === "ADMIN";
  const activeResources = resources.filter((resource) => resource.status === "ACTIVE").length;
  const outOfServiceResources = resources.filter((resource) => resource.status === "OUT_OF_SERVICE").length;
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredResources = resources.filter((resource) => {
    const normalizedStatus = resource.status?.toUpperCase() || "";
    if (statusFilter !== "ALL" && normalizedStatus !== statusFilter) {
      return false;
    }

    if (!normalizedSearchTerm) {
      return true;
    }

    return [resource.name, resource.type, resource.location, resource.description, resource.status]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(normalizedSearchTerm));
  });

  return (
    <SiteFrame accent={isAdmin ? "sky" : "sky"}>
      <div className={`mx-auto w-full ${isAdmin ? "max-w-[1520px]" : "max-w-7xl"}`}>
        <div className={isAdmin ? "grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]" : ""}>
          {isAdmin ? <AdminOperationsSidebar actorName={actorName} activeSection="resources" /> : null}

          <div className={isAdmin ? "space-y-6" : ""}>
            {isAdmin ? (
              <>
                <section className="rounded-[2rem] bg-[linear-gradient(135deg,#252d83_0%,#1f2677_100%)] px-7 py-8 text-white shadow-[0_24px_70px_rgba(27,33,100,0.30)]">
                  <h1 className="text-4xl font-semibold tracking-[-0.03em]">Admin Resource Management</h1>
                  <p className="mt-3 max-w-3xl text-base text-blue-100">
                    Review all campus resources, track current availability, and monitor operational status from one panel.
                  </p>
                  <button
                    type="button"
                    onClick={() => void loadResources()}
                    className="mt-6 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    Refresh Resources
                  </button>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total Resources</p>
                    <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#1f2677]">{resources.length}</p>
                  </div>
                  <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Active</p>
                    <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#1f2677]">{activeResources}</p>
                  </div>
                  <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Out of Service</p>
                    <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#1f2677]">{outOfServiceResources}</p>
                  </div>
                  <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Backend</p>
                    <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#1f2677]">
                      {loading ? "Syncing" : "Online"}
                    </p>
                  </div>
                </section>

                <section className="rounded-[1.7rem] border border-white/70 bg-white/90 p-6 shadow-sm">
                  <h2 className="text-4xl font-semibold tracking-[-0.03em] text-[#1f2677]">Filter and Search</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Search resources by name, type, location, or description and narrow by current status.
                  </p>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Search
                      <input
                        className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#1f2677]/40 focus:ring-4 focus:ring-[#1f2677]/10"
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search resources..."
                        type="search"
                        value={searchTerm}
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Status
                      <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value as ResourceStatusFilter)}
                        className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#1f2677]/40 focus:ring-4 focus:ring-[#1f2677]/10"
                      >
                        <option value="ALL">ALL</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                      </select>
                    </label>
                  </div>
                </section>
              </>
            ) : (
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
            )}

            <section className="grid gap-8" suppressHydrationWarning>
              <Panel
                eyebrow="Resources"
                title="Availability overview"
                description="See which labs, rooms, and equipment are currently available."
              >
                {!isAdmin ? (
                  <label className="mb-5 block text-sm font-medium text-stone-700">
                    Search resources
                    <input
                      className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search by name, type, location, or status"
                      type="search"
                      value={searchTerm}
                    />
                  </label>
                ) : null}

                <div className="space-y-4">
                  {resources.length === 0 ? (
                    <EmptyState text="No resources are available right now." />
                  ) : filteredResources.length === 0 ? (
                    <EmptyState text="No resources match your filters." />
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
          </div>
        </div>

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
                    onChange={(event) => {
                      setBookingForm((current) => ({ ...current, date: event.target.value }));
                      if (selectedResourceId && event.target.value) {
                        void loadBookedSlots(selectedResourceId, event.target.value);
                      }
                    }}
                  />
                </div>

                {bookedSlots.length > 0 ? (
                  <div className="rounded-lg bg-amber-50 p-3 text-sm">
                    <p className="font-medium text-amber-900">Booked time slots for this date:</p>
                    <ul className="mt-2 space-y-1">
                      {bookedSlots.map((slot, index) => (
                        <li key={index} className="text-amber-800">
                          {slot.startTime} - {slot.endTime}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : bookingForm.date ? (
                  <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
                    All time slots are available for this date.
                  </div>
                ) : null}

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
