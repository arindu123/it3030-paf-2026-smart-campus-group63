"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL, AdminUser, UserRole, userRoles } from "../../shared/campusApi";
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
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roleEdits, setRoleEdits] = useState<Record<number, UserRole>>({});
  const [activeUserAction, setActiveUserAction] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Loading admin data...");
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadAdminData = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    if (!silent) {
      setLoading(true);
      setError("");
    }

    try {
      const usersData = await fetch(`${API_BASE_URL}/admin/users`).then((response) =>
        response.json() as Promise<AdminUser[]>
      );

      const normalizedUsers = usersData.map((user) => ({
        ...user,
        role: normalizeRole(user.role),
      }));

      setUsers(normalizedUsers);
      setRoleEdits(
        normalizedUsers.reduce<Record<number, UserRole>>((accumulator, user) => {
          accumulator[user.id] = user.role;
          return accumulator;
        }, {})
      );
      setLastUpdatedAt(new Date().toLocaleTimeString());

      if (!silent) {
        setMessage("Registered users loaded successfully.");
      }
    } catch {
      if (!silent) {
        setError("Unable to load registered users. Check backend connection.");
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

    return {
      adminCount,
      technicianCount,
      onlineCount,
    };
  }, [users]);

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

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        </section>

        <section className="grid gap-6">
          <GlassPanel>
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
      </div>
    </SiteFrame>
  );
}
