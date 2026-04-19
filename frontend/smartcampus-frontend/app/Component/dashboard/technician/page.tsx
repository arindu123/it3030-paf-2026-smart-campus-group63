"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  API_BASE_URL,
  fetchJson,
  getStoredUser,
  normalizeRole,
  Ticket,
  TicketStatus,
  withActorHeaders,
  UserRole,
} from "../../shared/campusApi";
import {
  DashboardHero,
  EmptyState,
  Panel,
  SelectField,
  TextAreaField,
} from "../../shared/CampusUi";

type TechnicianMenuItem = {
  href: string;
  label: string;
  description: string;
};

type TicketActivity = {
  id: string;
  ticketId: number;
  title: string;
  type: "COMMENT" | "PROGRESS";
  author: string;
  createdAt?: string | null;
  message: string;
};

const technicianMenu: TechnicianMenuItem[] = [
  { href: "#overview", label: "Dashboard", description: "Summary and workload" },
  { href: "#assigned-tickets", label: "Assigned Tickets", description: "Current queue" },
  { href: "#workbench", label: "Update Status", description: "Work on selected ticket" },
  { href: "#comments", label: "Comments", description: "Discussion thread" },
  { href: "#notifications", label: "Notifications", description: "Recent activity" },
  { href: "#profile", label: "Profile", description: "Technician info" },
];

function toDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateTime(value?: string | null) {
  const date = toDate(value);

  if (!date) {
    return "-";
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatAge(value?: string | null) {
  const date = toDate(value);

  if (!date) {
    return "-";
  }

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatDuration(from?: string | null, to?: string | null) {
  const start = toDate(from);
  const end = toDate(to) ?? new Date();

  if (!start) {
    return "-";
  }

  const diffMinutes = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
  const days = Math.floor(diffMinutes / 1440);
  const hours = Math.floor((diffMinutes % 1440) / 60);
  const minutes = diffMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function isSameDay(left?: string | null, right = new Date()) {
  const leftDate = toDate(left);

  if (!leftDate) {
    return false;
  }

  return (
    leftDate.getFullYear() === right.getFullYear() &&
    leftDate.getMonth() === right.getMonth() &&
    leftDate.getDate() === right.getDate()
  );
}

function isSameMonth(left?: string | null, right = new Date()) {
  const leftDate = toDate(left);

  if (!leftDate) {
    return false;
  }

  return (
    leftDate.getFullYear() === right.getFullYear() &&
    leftDate.getMonth() === right.getMonth()
  );
}

function getPriorityBadgeClass(priority?: string) {
  switch ((priority || "").toUpperCase()) {
    case "HIGH":
      return "border-rose-200 bg-rose-100 text-rose-800";
    case "MEDIUM":
      return "border-orange-200 bg-orange-100 text-orange-800";
    default:
      return "border-emerald-200 bg-emerald-100 text-emerald-800";
  }
}

function getStatusBadgeClass(status?: string) {
  switch ((status || "").toUpperCase()) {
    case "OPEN":
      return "border-orange-200 bg-orange-100 text-orange-800";
    case "IN_PROGRESS":
      return "border-blue-200 bg-blue-100 text-blue-800";
    case "RESOLVED":
      return "border-emerald-200 bg-emerald-100 text-emerald-800";
    case "CLOSED":
      return "border-stone-200 bg-stone-100 text-stone-700";
    case "REJECTED":
      return "border-rose-200 bg-rose-100 text-rose-800";
    default:
      return "border-stone-200 bg-stone-100 text-stone-700";
  }
}

export default function TechnicianDashboardPage() {
  const router = useRouter();
  const [actorEmail, setActorEmail] = useState("");
  const [actorName, setActorName] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | TicketStatus>("ALL");
  const [progressDraft, setProgressDraft] = useState("");
  const [resolutionDraft, setResolutionDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Technician workspace is ready.");
  const [error, setError] = useState("");

  const authFetchJson = useCallback(
    async <T,>(url: string, init?: RequestInit) => {
      return fetchJson<T>(url, withActorHeaders(init));
    },
    []
  );

  useEffect(() => {
    const user = getStoredUser();

    if (!user?.email) {
      router.replace("/Component/Login");
      return;
    }

    const role = normalizeRole(user.role);
    if (role !== "TECHNICIAN") {
      router.replace(role === "ADMIN" ? "/Component/dashboard/admin" : "/Component/dashboard/user");
      return;
    }

    setActorEmail(user.email);
    setActorName(user.fullName || user.email);
  }, [router]);

  const loadTickets = useCallback(async () => {
    if (!actorEmail) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const allTickets = await authFetchJson<Ticket[]>(`${API_BASE_URL}/tickets`);
      const assignedTickets = allTickets.filter(
        (ticket) => ticket.assignedTo?.toLowerCase() === actorEmail.toLowerCase()
      );

      setTickets(assignedTickets);
      setMessage(
        assignedTickets.length > 0
          ? "Assigned tickets synced from backend."
          : "No tickets are assigned to this technician yet."
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load assigned tickets.");
    } finally {
      setLoading(false);
    }
  }, [actorEmail, authFetchJson]);

  useEffect(() => {
    if (!actorEmail) {
      return;
    }

    void loadTickets();
  }, [actorEmail, loadTickets]);

  useEffect(() => {
    if (selectedTicketId && tickets.some((ticket) => ticket.id === selectedTicketId)) {
      return;
    }

    setSelectedTicketId(tickets[0]?.id ?? null);
  }, [selectedTicketId, tickets]);

  const assignedTickets = useMemo(() => tickets, [tickets]);

  const visibleTickets = useMemo(() => {
    if (statusFilter === "ALL") {
      return assignedTickets;
    }

    return assignedTickets.filter((ticket) => ticket.status === statusFilter);
  }, [assignedTickets, statusFilter]);

  const selectedTicket = useMemo(
    () => assignedTickets.find((ticket) => ticket.id === selectedTicketId) ?? null,
    [assignedTickets, selectedTicketId]
  );

  useEffect(() => {
    setResolutionDraft(selectedTicket?.resolutionNote || "");
    setProgressDraft("");
    setCommentDraft("");
  }, [selectedTicket?.id]);

  const pendingUrgentTickets = useMemo(
    () =>
      assignedTickets.filter(
        (ticket) => ticket.status === "OPEN" && String(ticket.priority).toUpperCase() === "HIGH"
      ),
    [assignedTickets]
  );

  const totalAssignedTickets = assignedTickets.length;
  const inProgressTickets = assignedTickets.filter((ticket) => ticket.status === "IN_PROGRESS").length;
  const resolvedTodayTickets = assignedTickets.filter(
    (ticket) => ticket.status === "RESOLVED" && isSameDay(ticket.updatedAt)
  ).length;
  const highPriorityTickets = assignedTickets.filter(
    (ticket) => String(ticket.priority).toUpperCase() === "HIGH"
  ).length;

  const resolvedThisMonth = assignedTickets.filter(
    (ticket) => ticket.status === "RESOLVED" && isSameMonth(ticket.updatedAt)
  ).length;

  const averageResolutionMinutes = useMemo(() => {
    const resolvedDurations = assignedTickets
      .filter((ticket) => ticket.status === "RESOLVED")
      .map((ticket) => {
        const created = toDate(ticket.createdAt);
        const updated = toDate(ticket.updatedAt) ?? new Date();

        if (!created) {
          return null;
        }

        return Math.max(0, Math.floor((updated.getTime() - created.getTime()) / 60000));
      })
      .filter((value): value is number => value !== null);

    if (resolvedDurations.length === 0) {
      return null;
    }

    return Math.round(resolvedDurations.reduce((sum, value) => sum + value, 0) / resolvedDurations.length);
  }, [assignedTickets]);

  const recentActivity = useMemo<TicketActivity[]>(() => {
    const items: TicketActivity[] = [];

    for (const ticket of assignedTickets) {
      for (const comment of ticket.comments ?? []) {
        items.push({
          id: `comment-${ticket.id}-${comment.id}`,
          ticketId: ticket.id,
          title: ticket.title,
          type: "COMMENT",
          author: comment.owner,
          createdAt: comment.createdAt,
          message: comment.commentText,
        });
      }

      for (const update of ticket.progressUpdates ?? []) {
        items.push({
          id: `progress-${ticket.id}-${update.id}`,
          ticketId: ticket.id,
          title: ticket.title,
          type: "PROGRESS",
          author: update.updatedBy,
          createdAt: update.createdAt,
          message: update.updateText,
        });
      }
    }

    return items
      .sort((left, right) => (toDate(right.createdAt)?.getTime() ?? 0) - (toDate(left.createdAt)?.getTime() ?? 0))
      .slice(0, 8);
  }, [assignedTickets]);

  function focusTicket(ticketId: number) {
    setSelectedTicketId(ticketId);
    const workbench = document.getElementById("workbench");
    workbench?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function updateTicketStatus(ticketId: number, status: TicketStatus) {
    setError("");

    try {
      await authFetchJson<Ticket>(`${API_BASE_URL}/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      setMessage(`Ticket #${ticketId} moved to ${status}.`);
      await loadTickets();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update ticket status.");
    }
  }

  async function addProgressUpdate() {
    if (!selectedTicket) {
      setError("Select a ticket first.");
      return;
    }

    const updateText = progressDraft.trim();
    if (!updateText) {
      setError("Type a progress update first.");
      return;
    }

    setError("");

    try {
      await authFetchJson(`${API_BASE_URL}/tickets/${selectedTicket.id}/progress-updates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updateText }),
      });

      setProgressDraft("");
      setMessage(`Progress update added to ticket #${selectedTicket.id}.`);
      await loadTickets();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to add progress update.");
    }
  }

  async function saveResolutionNote() {
    if (!selectedTicket) {
      setError("Select a ticket first.");
      return;
    }

    const note = resolutionDraft.trim();
    if (!note) {
      setError("Add a resolution note before saving.");
      return;
    }

    setError("");

    try {
      await authFetchJson<Ticket>(`${API_BASE_URL}/tickets/${selectedTicket.id}/resolution`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resolutionNote: note }),
      });

      setMessage(`Resolution note saved for ticket #${selectedTicket.id}.`);
      await loadTickets();
    } catch (noteError) {
      setError(noteError instanceof Error ? noteError.message : "Failed to update note.");
    }
  }

  async function addComment() {
    if (!selectedTicket) {
      setError("Select a ticket first.");
      return;
    }

    const commentText = commentDraft.trim();
    if (!commentText) {
      setError("Comment text is required.");
      return;
    }

    setError("");

    try {
      await authFetchJson(`${API_BASE_URL}/tickets/${selectedTicket.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentText }),
      });

      setCommentDraft("");
      setMessage(`Comment added to ticket #${selectedTicket.id}.`);
      await loadTickets();
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : "Failed to add comment.");
    }
  }

  function logout() {
    window.localStorage.removeItem("smartcampusUser");
    router.push("/");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(238,155,19,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.75),_transparent_32%),linear-gradient(180deg,_#fafaf9_0%,_#f5f5f4_52%,_#e7e5e4_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),transparent)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-24 h-64 w-64 rounded-full bg-white/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 right-[-6rem] h-72 w-72 rounded-full bg-black/5 blur-3xl" />

      <div id="overview" className="relative z-10 ml-[340px] flex w-[calc(100%-340px)] flex-col gap-8 px-4 pb-14 pt-8 sm:px-6 lg:px-10">
        <DashboardHero
          eyebrow="Technician Dashboard"
          title="Track assigned tickets, update status, and close issues with discipline."
          description="This workspace is built for Module C maintenance and incident handling, with a dedicated technician flow for progress updates, comments, resolution notes, and service visibility."
          stats={[
            { label: "Assigned Tickets", value: String(totalAssignedTickets), tone: "warm" },
            { label: "In Progress", value: String(inProgressTickets), tone: "cool" },
            { label: "Resolved Today", value: String(resolvedTodayTickets), tone: "cool" },
            { label: "High Priority", value: String(highPriorityTickets), tone: "dark" },
          ]}
          message={message}
          error={error}
          onRefresh={() => void loadTickets()}
        />

        <div className="relative">
          <aside className="fixed left-0 top-0 z-40 m-0 flex h-screen w-[320px] flex-col overflow-hidden rounded-none border-r border-white/60 bg-white/95 px-3 py-3 shadow-[0_18px_55px_rgba(50,36,16,0.12)] backdrop-blur">
            <div className="rounded-[1.25rem] bg-[linear-gradient(135deg,#0A2B6B,#0F3C8A)] p-3 text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-orange-300">Technician Control</p>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em]">{actorName || "Technician"}</h2>
              <p className="mt-1 text-xs text-slate-200">{actorEmail || "No account loaded"}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-sky-200">Role: TECHNICIAN</p>
            </div>

            <nav className="mt-3 grid gap-1">
              {technicianMenu.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-2 transition hover:border-orange-200 hover:bg-orange-50"
                >
                  <p className="text-sm font-semibold leading-tight text-stone-900">{item.label}</p>
                  <p className="text-[11px] leading-tight text-stone-500">{item.description}</p>
                </a>
              ))}
            </nav>

            <div className="mt-auto grid gap-2 pt-3">
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-[linear-gradient(135deg,#EE9B13,#D78A0F)] px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:brightness-105"
              >
                Logout
              </button>
            </div>
          </aside>

          <div className="grid min-w-0 gap-8">
            <section id="assigned-tickets">
              <Panel
                eyebrow="Assigned Tickets"
                title="Current technician queue"
                description="Review the tickets assigned to your account, filter them by status, and open the workbench when it is time to act."
              >
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Ticket Queue</p>
                    <p className="mt-2 text-sm leading-7 text-stone-600">
                      High priority work appears first in the technician workflow, while the table below keeps the full assigned list searchable by status.
                    </p>
                  </div>
                  <SelectField
                    label="Filter by Status"
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value as "ALL" | TicketStatus)}
                    options={(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"] as const).map((status) => status)}
                  />
                </div>

                <div className="overflow-x-auto rounded-3xl border border-stone-200 bg-white">
                  <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-stone-100/80">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-stone-700">Ticket</th>
                        <th className="px-4 py-3 text-left font-semibold text-stone-700">Resource / Location</th>
                        <th className="px-4 py-3 text-left font-semibold text-stone-700">Category</th>
                        <th className="px-4 py-3 text-left font-semibold text-stone-700">Priority</th>
                        <th className="px-4 py-3 text-left font-semibold text-stone-700">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-stone-700">Created</th>
                        <th className="px-4 py-3 text-left font-semibold text-stone-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {visibleTickets.map((ticket) => (
                        <tr key={ticket.id} className={selectedTicket?.id === ticket.id ? "bg-orange-50/60" : ""}>
                          <td className="px-4 py-4 align-top">
                            <p className="font-semibold text-stone-900">#{ticket.id}</p>
                            <p className="max-w-xs text-xs text-stone-500">{ticket.title}</p>
                            <p className="mt-1 text-[11px] text-stone-400">Timer: {formatDuration(ticket.createdAt, ticket.status === "RESOLVED" ? ticket.updatedAt : undefined)}</p>
                          </td>
                          <td className="px-4 py-4 text-stone-700">
                            <p>{ticket.relatedResource || "Unspecified"}</p>
                            <p className="text-xs text-stone-500">{ticket.relatedLocation || "No location provided"}</p>
                          </td>
                          <td className="px-4 py-4 text-stone-700">{ticket.category}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${getPriorityBadgeClass(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${getStatusBadgeClass(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-stone-600">{formatDateTime(ticket.createdAt)}</td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => focusTicket(ticket.id)}
                              className="rounded-full bg-[linear-gradient(135deg,#EE9B13,#D78A0F)] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-105"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!loading && visibleTickets.length === 0 ? (
                    <div className="px-4 py-8">
                      <EmptyState text="No assigned tickets match the selected status filter." />
                    </div>
                  ) : null}
                </div>
              </Panel>
            </section>

            <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
              <Panel
                eyebrow="Urgent Queue"
                title="Pending urgent tickets"
                description="High priority open incidents that need immediate attention."
              >
                <div className="grid gap-4">
                  {pendingUrgentTickets.length > 0 ? (
                    pendingUrgentTickets.map((ticket) => (
                      <div key={ticket.id} className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-rose-700">Urgent</p>
                            <h3 className="mt-2 text-lg font-semibold text-stone-950">{ticket.title}</h3>
                            <p className="mt-1 text-sm text-stone-600">{ticket.relatedResource || ticket.relatedLocation || "No resource or location listed"}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => focusTicket(ticket.id)}
                            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100"
                          >
                            Open Workbench
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState text="No urgent open tickets right now." />
                  )}
                </div>
              </Panel>

              <Panel
                eyebrow="Workbench"
                title="Update status and notes"
                description="Open a ticket from the queue, move it through the lifecycle, write resolution notes, and keep the discussion thread updated."
              >
                {selectedTicket ? (
                  <div id="workbench" className="grid gap-6">
                    <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Selected Ticket</p>
                          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-stone-950">
                            #{selectedTicket.id} - {selectedTicket.title}
                          </h3>
                          <p className="mt-2 text-sm text-stone-600">
                            Created by {selectedTicket.createdBy || "Unknown"} · {formatDateTime(selectedTicket.createdAt)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${getPriorityBadgeClass(selectedTicket.priority)}`}>
                            {selectedTicket.priority}
                          </span>
                          <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${getStatusBadgeClass(selectedTicket.status)}`}>
                            {selectedTicket.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-stone-50 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Resource</p>
                          <p className="mt-2 font-semibold text-stone-950">{selectedTicket.relatedResource || "Unspecified"}</p>
                          <p className="mt-1 text-sm text-stone-600">{selectedTicket.relatedLocation || "No location provided"}</p>
                        </div>
                        <div className="rounded-2xl bg-stone-50 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Service Timer</p>
                          <p className="mt-2 font-semibold text-stone-950">
                            {selectedTicket.status === "RESOLVED"
                              ? `Resolved in ${formatDuration(selectedTicket.createdAt, selectedTicket.updatedAt)}`
                              : `Open for ${formatDuration(selectedTicket.createdAt)}`}
                          </p>
                          <p className="mt-1 text-sm text-stone-600">Last updated: {formatDateTime(selectedTicket.updatedAt)}</p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Issue Description</p>
                          <p className="mt-2 text-sm leading-7 text-stone-700">{selectedTicket.description}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Contact Details</p>
                          <p className="mt-2 text-sm leading-7 text-stone-700">
                            {selectedTicket.preferredContactDetails || "No preferred contact details provided."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Attachments</p>
                          <div className="mt-3 grid gap-2">
                            {selectedTicket.attachments?.length ? (
                              selectedTicket.attachments.map((attachment) => (
                                <a
                                  key={attachment.id}
                                  href={attachment.downloadUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 transition hover:border-orange-200 hover:bg-orange-50"
                                >
                                  {attachment.fileName}
                                </a>
                              ))
                            ) : (
                              <p className="text-sm text-stone-500">No attachments uploaded.</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Assigned Technician</p>
                          <p className="mt-2 text-sm font-semibold text-stone-950">{selectedTicket.assignedTo || actorEmail}</p>
                          <p className="mt-1 text-sm text-stone-600">Use the buttons below to move the ticket through its maintenance lifecycle.</p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={selectedTicket.status !== "OPEN"}
                          onClick={() => void updateTicketStatus(selectedTicket.id, "IN_PROGRESS")}
                          className="rounded-full bg-[linear-gradient(135deg,#0A2B6B,#0F3C8A)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Start Work
                        </button>
                        <button
                          type="button"
                          disabled={selectedTicket.status !== "IN_PROGRESS"}
                          onClick={() => void updateTicketStatus(selectedTicket.id, "RESOLVED")}
                          className="rounded-full bg-[linear-gradient(135deg,#EE9B13,#D78A0F)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Mark as Resolved
                        </button>
                        <button
                          type="button"
                          onClick={() => void saveResolutionNote()}
                          className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                        >
                          Save Resolution Note
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                      <div>
                        <TextAreaField
                          label="Resolution Notes"
                          value={resolutionDraft}
                          onChange={setResolutionDraft}
                          placeholder="What issue was found, what action was taken, and what the final resolution was"
                        />
                        <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-600">
                          Example: Projector HDMI port replaced successfully and signal tested on the main display.
                        </div>
                      </div>

                      <div id="comments">
                        <TextAreaField
                          label="Comments / Discussion"
                          value={commentDraft}
                          onChange={setCommentDraft}
                          placeholder="Write a note for the user or admin team"
                        />
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => void addProgressUpdate()}
                            className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                          >
                            Add Progress Update
                          </button>
                          <button
                            type="button"
                            onClick={() => void addComment()}
                            className="rounded-full bg-[linear-gradient(135deg,#EE9B13,#D78A0F)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105"
                          >
                            Post Comment
                          </button>
                        </div>

                        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Current Notes</p>
                          <p className="mt-3 text-sm leading-7 text-stone-700">
                            {selectedTicket.resolutionNote || "No resolution note saved yet."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState text="Select a ticket from the queue to open the technician workbench." />
                )}
              </Panel>
            </section>

            <section id="notifications">
              <Panel
                eyebrow="Notifications"
                title="Recent discussion and progress activity"
                description="A live-style feed of the latest comments and technician updates from your assigned tickets."
              >
                <div className="grid gap-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${activity.type === "COMMENT" ? "border-orange-200 bg-orange-100 text-orange-800" : "border-blue-200 bg-blue-100 text-blue-800"}`}>
                            {activity.type}
                          </span>
                          <span className="text-sm font-semibold text-stone-900">Ticket #{activity.ticketId}</span>
                          <span className="text-sm text-stone-500">{activity.title}</span>
                          <span className="text-xs text-stone-400">{formatAge(activity.createdAt)}</span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-stone-700">{activity.message}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-400">By {activity.author}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState text="No recent comments or progress updates yet." />
                  )}
                </div>
              </Panel>
            </section>

            <section id="profile">
              <Panel
                eyebrow="Profile"
                title="Technician details and performance stats"
                description="This area keeps the technician identity visible while showing how efficiently the maintenance queue is moving."
              >
                <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                  <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Account</p>
                    <div className="mt-4 grid gap-3 text-sm text-stone-700">
                      <p><span className="font-semibold text-stone-950">Name:</span> {actorName || "Technician"}</p>
                      <p><span className="font-semibold text-stone-950">Email:</span> {actorEmail || "-"}</p>
                      <p><span className="font-semibold text-stone-950">Role:</span> TECHNICIAN</p>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={logout}
                        className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
                      >
                        Logout
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Resolved This Month</p>
                      <p className="mt-3 text-3xl font-semibold text-stone-950">{resolvedThisMonth}</p>
                      <p className="mt-2 text-sm text-stone-600">Tickets completed during the current month.</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Average Resolution Time</p>
                      <p className="mt-3 text-3xl font-semibold text-stone-950">
                        {averageResolutionMinutes === null ? "-" : `${averageResolutionMinutes}m`}
                      </p>
                      <p className="mt-2 text-sm text-stone-600">Average time from creation to resolution.</p>
                    </div>
                  </div>
                </div>
              </Panel>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}