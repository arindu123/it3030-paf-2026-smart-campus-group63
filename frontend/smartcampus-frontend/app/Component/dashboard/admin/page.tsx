"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  API_BASE_URL,
  AdminUser,
  Booking,
  defaultResourceForm,
  fetchJson,
  Resource,
  ResourceForm,
  resourceStatuses,
  resourceTypes,
  UserRole,
  userRoles,
} from "../../shared/campusApi";
import { Field, Panel, SelectField, TextAreaField } from "../../shared/CampusUi";
import { GlassPanel, MetricTile, PageHero, SiteFrame } from "../../shared/SiteFrame";

type StoredUser = {
  email: string;
  fullName?: string;
  role?: string;
};

function normalizeRole(role?: string | null): UserRole {
  if (!role) {
    return "USER";
  }

  const value = role.toUpperCase();
  if (value === "ADMIN" || value === "TECHNICIAN") {
    return value;
  }

  return "USER";
}

function formatUtcTimestamp(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return `${date.toISOString().replace("T", " ").slice(0, 19)} UTC`;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentAdminEmail, setCurrentAdminEmail] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceForm, setResourceForm] = useState<ResourceForm>(defaultResourceForm);
  const [roleEdits, setRoleEdits] = useState<Record<number, UserRole>>({});
  const [activeUserAction, setActiveUserAction] = useState<number | null>(null);
  const [activeResourceAction, setActiveResourceAction] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Loading admin data...");
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhoneNumber, setNewUserPhoneNumber] = useState("");
  const [newUserDepartment, setNewUserDepartment] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("USER");
  const [newUserProvider, setNewUserProvider] = useState<"LOCAL" | "GOOGLE">("GOOGLE");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingBookingId, setRejectingBookingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeBookingAction, setActiveBookingAction] = useState<number | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approvingBookingId, setApprovingBookingId] = useState<number | null>(null);

  const loadAdminData = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    if (!silent) {
      setLoading(true);
      setError("");
    }

    try {
      const [usersData, resourceData, bookingData] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users`).then((response) => response.json() as Promise<AdminUser[]>),
        fetchJson<Resource[]>(`${API_BASE_URL}/resources`),
        fetchJson<Booking[]>(`${API_BASE_URL}/bookings`),
      ]);

      const normalizedUsers = usersData.map((user) => ({
        ...user,
        role: normalizeRole(user.role),
      }));

      setUsers(normalizedUsers);
      setResources(resourceData);
      setBookings(bookingData);
      setRoleEdits(
        normalizedUsers.reduce<Record<number, UserRole>>((accumulator, user) => {
          accumulator[user.id] = user.role;
          return accumulator;
        }, {})
      );
      setLastUpdatedAt(new Date().toLocaleTimeString());

      if (!silent) {
        setMessage("Admin dashboard synced with users, resources, and bookings.");
      }
    } catch {
      if (!silent) {
        setError("Unable to load admin dashboard data. Check backend connection.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem("smartcampusUser");

    if (!raw) {
      router.replace("/Component/Login");
      return;
    }

    try {
      const currentUser = JSON.parse(raw) as StoredUser;

      if (normalizeRole(currentUser.role) !== "ADMIN") {
        router.replace("/Component/dashboard/user");
        return;
      }

      setCurrentAdminEmail(currentUser.email || "");
      setIsAuthorized(true);
    } catch {
      window.localStorage.removeItem("smartcampusUser");
      router.replace("/Component/Login");
      return;
    }

    void loadAdminData();
  }, [loadAdminData, router]);

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadAdminData({ silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [isAuthorized, loadAdminData]);

  const overview = useMemo(() => {
    const adminCount = users.filter((user) => user.role === "ADMIN").length;
    const technicianCount = users.filter((user) => user.role === "TECHNICIAN").length;
    const onlineCount = users.filter((user) => user.online).length;
    const activeResourceCount = resources.filter((resource) => resource.status === "ACTIVE").length;
    const pendingBookingCount = bookings.filter((booking) => booking.status === "PENDING").length;

    return {
      activeResourceCount,
      adminCount,
      technicianCount,
      onlineCount,
      pendingBookingCount,
    };
  }, [resources, users, bookings]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...users]
      .filter((user) => {
        if (!normalizedSearch) {
          return true;
        }

        return [user.fullName, user.email, user.department, user.role, user.provider]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      })
      .sort((left, right) => Number(right.online) - Number(left.online) || left.fullName.localeCompare(right.fullName));
  }, [searchTerm, users]);

  async function updateUserRole(userId: number) {
    setActiveUserAction(userId);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: roleEdits[userId] }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Role update failed" }));
        throw new Error(body.message || "Role update failed");
      }

      setMessage("User role updated.");
      await loadAdminData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Role update failed");
    } finally {
      setActiveUserAction(null);
    }
  }

  async function deactivateUser(userId: number) {
    setActiveUserAction(userId);
    setError("");

    if (!currentAdminEmail) {
      setError("Admin email is missing. Please sign in again.");
      setActiveUserAction(null);
      return;
    }

    try {
      await fetchJson(`${API_BASE_URL}/admin/users/${userId}/deactivate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": currentAdminEmail,
        },
      });

      setMessage(`User #${userId} deactivated.`);
      await loadAdminData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to deactivate user.");
    } finally {
      setActiveUserAction(null);
    }
  }

  async function activateUser(userId: number) {
    setActiveUserAction(userId);
    setError("");

    if (!currentAdminEmail) {
      setError("Admin email is missing. Please sign in again.");
      setActiveUserAction(null);
      return;
    }

    try {
      await fetchJson(`${API_BASE_URL}/admin/users/${userId}/activate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": currentAdminEmail,
        },
      });

      setMessage(`User #${userId} activated.`);
      await loadAdminData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to activate user.");
    } finally {
      setActiveUserAction(null);
    }
  }

  async function deleteUser(userId: number) {
    setActiveUserAction(userId);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "User delete failed" }));
        throw new Error(body.message || "User delete failed");
      }

      setMessage("User removed successfully.");
      await loadAdminData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "User delete failed");
    } finally {
      setActiveUserAction(null);
    }
  }

  async function createResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await fetchJson<Resource>(`${API_BASE_URL}/resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...resourceForm,
          capacity: Number(resourceForm.capacity),
        }),
      });

      setResourceForm(defaultResourceForm);
      setMessage("Resource created successfully.");
      await loadAdminData();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create resource.");
    }
  }

  async function updateResourceStatus(resourceId: number, status: string) {
    setActiveResourceAction(resourceId);
    setError("");

    try {
      await fetchJson<Resource>(`${API_BASE_URL}/resources/${resourceId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      setMessage(`Resource #${resourceId} updated to ${status}.`);
      await loadAdminData();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update resource status.");
    } finally {
      setActiveResourceAction(null);
    }
  }

  async function deleteResource(resourceId: number) {
    setActiveResourceAction(resourceId);
    setError("");

    try {
      await fetchJson<string>(`${API_BASE_URL}/resources/${resourceId}`, {
        method: "DELETE",
      });

      setMessage(`Resource #${resourceId} deleted.`);
      await loadAdminData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete resource.");
    } finally {
      setActiveResourceAction(null);
    }
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (newUserProvider === "LOCAL" && newUserPassword !== newUserConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newUserProvider === "LOCAL" && !newUserPassword) {
      setError("Password is required for local accounts.");
      return;
    }

    setCreatingUser(true);

    try {
      await fetchJson<AdminUser>(`${API_BASE_URL}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: newUserFullName,
          email: newUserEmail,
          phoneNumber: newUserPhoneNumber,
          department: newUserDepartment,
          role: newUserRole,
          provider: newUserProvider,
          password: newUserProvider === "LOCAL" ? newUserPassword : undefined,
        }),
      });

      setNewUserFullName("");
      setNewUserEmail("");
      setNewUserPhoneNumber("");
      setNewUserDepartment("");
      setNewUserRole("USER");
      setNewUserProvider("GOOGLE");
      setNewUserPassword("");
      setNewUserConfirmPassword("");
      setMessage("User account created successfully.");
      await loadAdminData();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create user account.");
    } finally {
      setCreatingUser(false);
    }
  }

  function openApproveModal(bookingId: number) {
    setApprovingBookingId(bookingId);
    setIsApproveModalOpen(true);
  }

  function closeApproveModal() {
    setIsApproveModalOpen(false);
    setApprovingBookingId(null);
  }

  async function submitApproveBooking() {
    if (!approvingBookingId) {
      return;
    }

    setActiveBookingAction(approvingBookingId);
    setError("");

    try {
      const adminEmail = window.localStorage.getItem("smartcampusUser") 
        ? (JSON.parse(window.localStorage.getItem("smartcampusUser") as string) as { email?: string }).email 
        : "";

      if (!adminEmail) {
        setError("Admin email not found. Please log in again.");
        setActiveBookingAction(null);
        return;
      }

      await fetchJson(`${API_BASE_URL}/bookings/${approvingBookingId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": adminEmail,
        },
      });

      setMessage(`Booking #${approvingBookingId} approved.`);
      closeApproveModal();
      await loadAdminData();
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : "Failed to approve booking.");
    } finally {
      setActiveBookingAction(null);
    }
  }

  function openRejectModal(bookingId: number) {
    setRejectingBookingId(bookingId);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  }

  function closeRejectModal() {
    setIsRejectModalOpen(false);
    setRejectingBookingId(null);
    setRejectionReason("");
  }

  async function submitRejectBooking() {
    if (!rejectingBookingId) {
      return;
    }

    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }

    setActiveBookingAction(rejectingBookingId);
    setError("");

    try {
      const adminEmail = window.localStorage.getItem("smartcampusUser") 
        ? (JSON.parse(window.localStorage.getItem("smartcampusUser") as string) as { email?: string }).email 
        : "";

      if (!adminEmail) {
        setError("Admin email not found. Please log in again.");
        setActiveBookingAction(null);
        return;
      }

      await fetchJson(`${API_BASE_URL}/bookings/${rejectingBookingId}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": adminEmail,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      setMessage(`Booking #${rejectingBookingId} rejected.`);
      closeRejectModal();
      await loadAdminData();
    } catch (rejectError) {
      setError(rejectError instanceof Error ? rejectError.message : "Failed to reject booking.");
    } finally {
      setActiveBookingAction(null);
    }
  }

  return (
    <SiteFrame accent="sky">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <PageHero
          eyebrow="Admin Command Center"
          title="Full campus operations and user access are now manageable from one place."
          description="This dashboard is separate from the regular user view and gives admins direct control over user roles, service queues, and platform activity."
          actions={
            <>
              <button
                type="button"
                onClick={() => void loadAdminData()}
                className="rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Refresh Admin Data
              </button>
              <Link
                href="/Component/notifications"
                className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Open Notifications
              </Link>
            </>
          }
          aside={
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-sky-200">Admin Visibility</p>
              <p className="text-3xl font-semibold">{users.length}</p>
              <p className="text-sm text-slate-200">Registered users currently in the system</p>
              <div className="h-px bg-white/20" />
              <p className="text-sm text-slate-200">{message}</p>
              {lastUpdatedAt ? <p className="text-xs uppercase tracking-[0.24em] text-sky-200">Last synced {lastUpdatedAt}</p> : null}
              {error ? <p className="text-sm text-rose-200">{error}</p> : null}
            </div>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricTile
            label="Total Users"
            value={String(users.length)}
            detail="All accounts currently available in the platform"
          />
          <MetricTile
            label="Admins"
            value={String(overview.adminCount)}
            detail="Users with full dashboard and management access"
          />
          <MetricTile
            label="Technicians"
            value={String(overview.technicianCount)}
            detail="Support team members available for assignments"
          />
          <MetricTile
            label="Online Users"
            value={String(overview.onlineCount)}
            detail="Users active within the last 2 minutes"
          />
          <MetricTile
            label="Active Resources"
            value={String(overview.activeResourceCount)}
            detail="Resources currently available to campus users"
          />
          <MetricTile
            label="Pending Bookings"
            value={String(overview.pendingBookingCount)}
            detail="Resource bookings awaiting admin approval"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Panel
            eyebrow="Resource Form"
            title="Register a campus resource"
            description="Create and manage resource availability directly from the admin dashboard."
          >
            <form className="grid gap-4" onSubmit={createResource}>
              <Field
                label="Resource Name"
                onChange={(value) => setResourceForm((current) => ({ ...current, name: value }))}
                placeholder="Computer Lab A"
                value={resourceForm.name}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Type"
                  onChange={(value) => setResourceForm((current) => ({ ...current, type: value }))}
                  options={resourceTypes}
                  value={resourceForm.type}
                />
                <Field
                  label="Capacity"
                  onChange={(value) => setResourceForm((current) => ({ ...current, capacity: value }))}
                  placeholder="40"
                  type="number"
                  value={resourceForm.capacity}
                />
              </div>

              <Field
                label="Location"
                onChange={(value) => setResourceForm((current) => ({ ...current, location: value }))}
                placeholder="Block A"
                value={resourceForm.location}
              />

              <TextAreaField
                label="Description"
                onChange={(value) => setResourceForm((current) => ({ ...current, description: value }))}
                placeholder="Main programming lab"
                value={resourceForm.description}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Available From"
                  onChange={(value) => setResourceForm((current) => ({ ...current, availableFrom: value }))}
                  type="time"
                  value={resourceForm.availableFrom}
                />
                <Field
                  label="Available To"
                  onChange={(value) => setResourceForm((current) => ({ ...current, availableTo: value }))}
                  type="time"
                  value={resourceForm.availableTo}
                />
              </div>

              <SelectField
                label="Status"
                onChange={(value) => setResourceForm((current) => ({ ...current, status: value }))}
                options={resourceStatuses}
                value={resourceForm.status}
              />

              <button
                className="mt-2 rounded-full bg-[linear-gradient(135deg,#d97706,#b45309)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105"
                type="submit"
              >
                Save Resource
              </button>
            </form>
          </Panel>

          <Panel
            eyebrow="Resources"
            title="Resource management"
            description="Update status or remove resources without leaving the dashboard."
          >
            <div className="space-y-4">
              {resources.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-stone-200 px-6 py-8 text-center text-sm text-stone-500">
                  No resources yet. Create one from the form on this page.
                </div>
              ) : (
                resources.map((resource) => (
                  <article
                    key={resource.id}
                    className="rounded-3xl border border-stone-200 bg-stone-50 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-stone-950">{resource.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-stone-600">{resource.description}</p>
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
                        className="rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={activeResourceAction === resource.id}
                        onClick={() => void updateResourceStatus(resource.id, "ACTIVE")}
                        type="button"
                      >
                        Set Active
                      </button>
                      <button
                        className="rounded-full bg-stone-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-600 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={activeResourceAction === resource.id}
                        onClick={() => void updateResourceStatus(resource.id, "OUT_OF_SERVICE")}
                        type="button"
                      >
                        Set Out of Service
                      </button>
                      <button
                        className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={activeResourceAction === resource.id}
                        onClick={() => void deleteResource(resource.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6">
          <Panel
            eyebrow="Booking Approvals"
            title="Manage resource booking requests"
            description="Review and approve or reject pending booking requests from users."
          >
            <div className="space-y-4">
              {bookings.filter((b) => b.status === "PENDING").length === 0 ? (
                <div className="rounded-3xl border border-dashed border-stone-200 px-6 py-8 text-center text-sm text-stone-500">
                  No pending bookings. All requests have been reviewed.
                </div>
              ) : (
                bookings
                  .filter((booking) => booking.status === "PENDING")
                  .map((booking) => (
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
                          PENDING
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 text-sm text-stone-600">
                        <p>Requested by: {booking.createdBy}</p>
                        <p>Date: {booking.date}</p>
                        <p>Time: {booking.startTime} - {booking.endTime}</p>
                        <p>Expected Attendees: {booking.expectedAttendees}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={activeBookingAction === booking.id}
                          onClick={() => openApproveModal(booking.id)}
                          type="button"
                        >
                          Approve
                        </button>
                        <button
                          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={activeBookingAction === booking.id}
                          onClick={() => openRejectModal(booking.id)}
                          type="button"
                        >
                          Reject
                        </button>
                      </div>
                    </article>
                  ))
              )}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6">
          <GlassPanel>
            <div className="rounded-3xl border border-stone-200 bg-stone-50/80 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Create Access</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-stone-950">
                    Add admin or technician account
                  </h2>
                  <p className="mt-2 text-sm text-stone-600">
                    Pre-create a Google account here so the technician can use Continue with Google and land in the technician dashboard.
                  </p>
                </div>
              </div>

              <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={createUser}>
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Full Name
                  <input
                    value={newUserFullName}
                    onChange={(event) => setNewUserFullName(event.target.value)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Email
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(event) => setNewUserEmail(event.target.value)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Phone Number
                  <input
                    value={newUserPhoneNumber}
                    onChange={(event) => setNewUserPhoneNumber(event.target.value)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Department
                  <input
                    value={newUserDepartment}
                    onChange={(event) => setNewUserDepartment(event.target.value)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Role
                  <select
                    value={newUserRole}
                    onChange={(event) => setNewUserRole(normalizeRole(event.target.value))}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  >
                    {userRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Sign-in Provider
                  <select
                    value={newUserProvider}
                    onChange={(event) => setNewUserProvider(event.target.value as "LOCAL" | "GOOGLE")}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="GOOGLE">GOOGLE</option>
                    <option value="LOCAL">LOCAL</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-700 md:col-span-2 xl:col-span-1">
                  Password
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(event) => setNewUserPassword(event.target.value)}
                    placeholder={newUserProvider === "GOOGLE" ? "Optional for Google accounts" : "Required for local accounts"}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-700 md:col-span-2 xl:col-span-1">
                  Confirm Password
                  <input
                    type="password"
                    value={newUserConfirmPassword}
                    onChange={(event) => setNewUserConfirmPassword(event.target.value)}
                    placeholder={newUserProvider === "GOOGLE" ? "Optional for Google accounts" : "Required for local accounts"}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                </label>

                <div className="flex items-end md:col-span-2 xl:col-span-3">
                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="rounded-full bg-[linear-gradient(135deg,#EE9B13,#D78A0F)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {creatingUser ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">User Management</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-stone-950">
                  Registered users list
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  Search, review, update roles, or remove registered accounts from one clean table.
                </p>
              </div>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Search users
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Name, email, role, department"
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 sm:w-80"
                />
              </label>
            </div>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200">
              <table className="min-w-full divide-y divide-stone-200 text-sm">
                <thead className="bg-stone-100/80">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-stone-700">User</th>
                    <th className="px-4 py-3 text-left font-semibold text-stone-700">Department</th>
                    <th className="px-4 py-3 text-left font-semibold text-stone-700">Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-stone-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-stone-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 align-top">
                        <p className="font-semibold text-stone-900">{user.fullName}</p>
                        <p className="text-xs text-stone-500">{user.email}</p>
                        <p className="text-xs text-stone-400">{user.provider || "LOCAL"}</p>
                      </td>
                      <td className="px-4 py-3 text-stone-700">{user.department || "General"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={roleEdits[user.id] || user.role}
                          onChange={(event) =>
                            setRoleEdits((current) => ({
                              ...current,
                              [user.id]: normalizeRole(event.target.value),
                            }))
                          }
                          className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        >
                          {userRoles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={activeUserAction === user.id || roleEdits[user.id] === user.role}
                            onClick={() => void updateUserRole(user.id)}
                            className="rounded-full bg-[linear-gradient(135deg,#d97706,#b45309)] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Save Role
                          </button>
                          <button
                            type="button"
                            disabled={activeUserAction === user.id || !currentAdminEmail}
                            onClick={() =>
                              void (
                                user.status?.toUpperCase() === "DEACTIVATED"
                                  ? activateUser(user.id)
                                  : deactivateUser(user.id)
                              )
                            }
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${user.status?.toUpperCase() === "DEACTIVATED" ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"}`}
                          >
                            {user.status?.toUpperCase() === "DEACTIVATED" ? "Activate" : "Deactivate"}
                          </button>
                          <button
                            type="button"
                            disabled={activeUserAction === user.id}
                            onClick={() => void deleteUser(user.id)}
                            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex w-fit rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${user.online ? "bg-orange-100 text-orange-800" : "bg-stone-100 text-stone-500"}`}>
                            {user.online ? "Online" : "Offline"}
                          </span>
                          <span className={`inline-flex w-fit rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${user.status?.toUpperCase() === "DEACTIVATED" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {user.status?.toUpperCase() === "DEACTIVATED" ? "Deactivated" : "Active"}
                          </span>
                          <p className="text-xs text-stone-500">
                            Last login: {formatUtcTimestamp(user.lastLoginAt)}
                          </p>
                          <p className="text-xs text-stone-500">
                            Last seen: {formatUtcTimestamp(user.lastSeenAt)}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && filteredUsers.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-stone-500">
                  No registered users match your search.
                </div>
              ) : null}
            </div>
          </GlassPanel>
        </section>

        {isApproveModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="mb-2 text-2xl font-bold text-stone-950">Confirm Approval</h2>
              <p className="mb-4 text-sm text-stone-600">
                Are you sure you want to approve booking #{approvingBookingId}?
              </p>

              {error && !error.includes("Admin email") ? (
                <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="mt-6 flex gap-3">
                <button
                  className="flex-1 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={activeBookingAction === approvingBookingId}
                  onClick={() => void submitApproveBooking()}
                >
                  {activeBookingAction === approvingBookingId ? "Approving..." : "Approve"}
                </button>
                <button
                  className="flex-1 rounded-full bg-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={activeBookingAction === approvingBookingId}
                  onClick={closeApproveModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isRejectModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="mb-2 text-2xl font-bold text-stone-950">Reject Booking</h2>
              <p className="mb-4 text-sm text-stone-600">
                Booking #{rejectingBookingId} - Please provide a reason for rejection
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700">
                  Rejection Reason
                  <textarea
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    rows={4}
                    placeholder="Explain why this booking is being rejected..."
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                  />
                </label>
              </div>

              {error && !error.includes("Admin email") ? (
                <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="mt-6 flex gap-3">
                <button
                  className="flex-1 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                  type="button"
                  onClick={() => void submitRejectBooking()}
                >
                  Reject Booking
                </button>
                <button
                  className="flex-1 rounded-full bg-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
                  type="button"
                  onClick={closeRejectModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </SiteFrame>
  );
}
