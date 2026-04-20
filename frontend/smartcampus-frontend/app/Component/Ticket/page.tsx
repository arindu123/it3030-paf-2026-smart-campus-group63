"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminUser,
  API_BASE_URL,
  BACKEND_BASE_URL,
  defaultTicketForm,
  fetchJson,
  getStoredUser,
  normalizeRole,
  Ticket,
  TicketComment,
  TicketForm,
  ticketCategories,
  ticketPriorities,
  ticketStatuses,
  TicketStatus,
  UserRole,
  withActorHeaders,
  Resource,
} from "../shared/campusApi";
import {
  DashboardHero,
  EmptyState,
  Field,
  Panel,
  SelectField,
  TextAreaField,
} from "../shared/CampusUi";
import { SiteFrame } from "../shared/SiteFrame";

export default function TicketPage() {
  const router = useRouter();
  const [actorEmail, setActorEmail] = useState<string>("");
  const [actorRole, setActorRole] = useState<UserRole>("USER");
  const [actorName, setActorName] = useState<string>("Campus Admin");

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | TicketStatus>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | (typeof ticketPriorities)[number]>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [technicians, setTechnicians] = useState<AdminUser[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  const [ticketForm, setTicketForm] = useState<TicketForm>(defaultTicketForm);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [commentDraftByTicket, setCommentDraftByTicket] = useState<Record<number, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const [progressDraftByTicket, setProgressDraftByTicket] = useState<Record<number, string>>({});
  const [resolutionDraftByTicket, setResolutionDraftByTicket] = useState<Record<number, string>>({});
  const [rejectionReasonByTicket, setRejectionReasonByTicket] = useState<Record<number, string>>({});
  const [assignmentByTicket, setAssignmentByTicket] = useState<Record<number, string>>({});

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Ticket desk is ready.");
  const [error, setError] = useState("");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>("");
  const [previewImageName, setPreviewImageName] = useState<string>("");

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

    setActorEmail(user.email);
    setActorRole(normalizeRole(user.role));
    setActorName(user.fullName?.trim() || user.email);
  }, [router]);

  const loadTickets = useCallback(async (selectedStatus: "ALL" | TicketStatus = statusFilter) => {
    if (!actorEmail) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const suffix =
        selectedStatus === "ALL"
          ? ""
          : `?status=${encodeURIComponent(selectedStatus)}`;
      const ticketData = await authFetchJson<Ticket[]>(`${API_BASE_URL}/tickets${suffix}`);
      setTickets(ticketData);
      setMessage("Ticket dashboard synced with backend API.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load backend data.");
    } finally {
      setLoading(false);
    }
  }, [actorEmail, authFetchJson, statusFilter]);

  const loadResources = useCallback(async () => {
    if (!actorEmail) {
      return;
    }

    try {
      const resourceData = await authFetchJson<Resource[]>(`${API_BASE_URL}/resources`);
      setResources(resourceData.sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      setResources([]);
    }
  }, [actorEmail, authFetchJson]);

  useEffect(() => {
    if (!actorEmail) {
      return;
    }
    void loadTickets();
    void loadResources();
  }, [actorEmail, loadTickets, loadResources]);

  useEffect(() => {
    if (actorRole !== "ADMIN" || !actorEmail) {
      return;
    }

    async function loadTechnicians() {
      try {
        const users = await authFetchJson<AdminUser[]>(`${API_BASE_URL}/admin/users`);
        const techs = users.filter((user) => normalizeRole(user.role) === "TECHNICIAN");
        setTechnicians(techs);
      } catch {
        setTechnicians([]);
      }
    }

    void loadTechnicians();
  }, [actorRole, actorEmail, authFetchJson]);

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 3) {
      setError("You can upload up to 3 photos per ticket.");
      setSelectedFiles(files.slice(0, 3));
      return;
    }

    setError("");
    setSelectedFiles(files);
  }

  async function uploadSelectedFiles(ticketId: number, files: File[]) {
    if (files.length === 0) {
      return;
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/attachments`, withActorHeaders({
      method: "POST",
      body: formData,
    }));

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to upload ticket attachments.");
    }
  }

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const createdTicket = await authFetchJson<Ticket>(`${API_BASE_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: ticketForm.title,
          description: ticketForm.description,
          category: ticketForm.category,
          priority: ticketForm.priority,
          preferredContactDetails: ticketForm.preferredContactDetails,
          relatedResourceId: ticketForm.relatedResourceId
            ? Number(ticketForm.relatedResourceId)
            : undefined,
          relatedResource: ticketForm.relatedResource || undefined,
          relatedLocation: ticketForm.relatedLocation || undefined,
        }),
      });

      if (selectedFiles.length > 0) {
        await uploadSelectedFiles(createdTicket.id, selectedFiles);
      }

      setTicketForm(defaultTicketForm);
      setSelectedFiles([]);
      setIsTicketModalOpen(false);
      setMessage(
        selectedFiles.length > 0
          ? "Ticket created successfully with attachments."
          : "Ticket created successfully."
      );
      await loadTickets(statusFilter);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create ticket.");
    }
  }

  async function updateTicketStatus(id: number, status: TicketStatus) {
    setError("");

    try {
      await authFetchJson<Ticket>(`${API_BASE_URL}/tickets/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      setMessage(`Ticket #${id} updated to ${status}.`);
      await loadTickets(statusFilter);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update ticket status.");
    }
  }

  async function assignTech(id: number) {
    const technicianEmail = assignmentByTicket[id]?.trim();
    if (!technicianEmail) {
      setError("Select a technician first.");
      return;
    }

    setError("");

    try {
      await authFetchJson<Ticket>(`${API_BASE_URL}/tickets/${id}/assign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ technicianEmail }),
      });

      setMessage(`Technician assigned to ticket #${id}.`);
      await loadTickets(statusFilter);
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : "Failed to assign technician.");
    }
  }

  async function addResolutionNote(id: number) {
    const note = resolutionDraftByTicket[id]?.trim();
    if (!note) {
      setError("Add a resolution note before saving.");
      return;
    }

    setError("");

    try {
      await authFetchJson<Ticket>(`${API_BASE_URL}/tickets/${id}/resolution`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resolutionNote: note }),
      });

      setResolutionDraftByTicket((current) => ({ ...current, [id]: "" }));
      setMessage(`Resolution note added to ticket #${id}.`);
      await loadTickets(statusFilter);
    } catch (noteError) {
      setError(noteError instanceof Error ? noteError.message : "Failed to update note.");
    }
  }

  async function rejectTicket(id: number) {
    const reason = rejectionReasonByTicket[id]?.trim();
    if (!reason) {
      setError("Provide a rejection reason.");
      return;
    }

    setError("");

    try {
      await authFetchJson<Ticket>(`${API_BASE_URL}/tickets/${id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      setRejectionReasonByTicket((current) => ({ ...current, [id]: "" }));
      setMessage(`Ticket #${id} rejected.`);
      await loadTickets(statusFilter);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to reject ticket.");
    }
  }

  async function addProgressUpdate(ticketId: number) {
    const updateText = progressDraftByTicket[ticketId]?.trim();
    if (!updateText) {
      setError("Type a progress update first.");
      return;
    }

    setError("");

    try {
      await authFetchJson(`${API_BASE_URL}/tickets/${ticketId}/progress-updates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updateText }),
      });

      setProgressDraftByTicket((current) => ({ ...current, [ticketId]: "" }));
      setMessage(`Progress update added to ticket #${ticketId}.`);
      await loadTickets(statusFilter);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to add progress update.");
    }
  }

  async function addComment(ticketId: number) {
    const commentText = commentDraftByTicket[ticketId]?.trim();
    if (!commentText) {
      setError("Comment text is required.");
      return;
    }

    setError("");

    try {
      await authFetchJson(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentText }),
      });

      setCommentDraftByTicket((current) => ({ ...current, [ticketId]: "" }));
      setMessage(`Comment added to ticket #${ticketId}.`);
      await loadTickets(statusFilter);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to add comment.");
    }
  }

  async function saveEditedComment(commentId: number) {
    const commentText = editingCommentText.trim();
    if (!commentText) {
      setError("Comment text is required.");
      return;
    }

    setError("");

    try {
      await authFetchJson(`${API_BASE_URL}/tickets/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentText }),
      });

      setEditingCommentId(null);
      setEditingCommentText("");
      setMessage("Comment updated.");
      await loadTickets(statusFilter);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to update comment.");
    }
  }

  async function deleteComment(commentId: number) {
    setError("");

    try {
      await authFetchJson(`${API_BASE_URL}/tickets/comments/${commentId}`, {
        method: "DELETE",
      });

      setMessage("Comment deleted.");
      await loadTickets(statusFilter);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to delete comment.");
    }
  }

  async function deleteTicket(id: number) {
    setError("");

    try {
      await authFetchJson<void>(`${API_BASE_URL}/tickets/${id}`, {
        method: "DELETE",
      });

      setMessage(`Ticket #${id} deleted.`);
      await loadTickets(statusFilter);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete ticket.");
    }
  }

  const resolvedTickets = tickets.filter((ticket) => ticket.status === "RESOLVED").length;
  const openTickets = tickets.filter((ticket) => ticket.status === "OPEN").length;
  const inProgressTickets = tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length;
  const resolvedOrClosedTickets = tickets.filter(
    (ticket) => ticket.status === "RESOLVED" || ticket.status === "CLOSED"
  ).length;

  const statusOptions = useMemo(() => ["ALL", ...ticketStatuses] as const, []);
  const priorityOptions = useMemo(() => ["ALL", ...ticketPriorities] as const, []);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesPriority = priorityFilter === "ALL" || ticket.priority === priorityFilter;
      if (!matchesPriority) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchFields = [
        String(ticket.id),
        ticket.title,
        ticket.description,
        ticket.category,
        ticket.priority,
        ticket.status,
        ticket.createdBy,
        ticket.assignedTo,
        ticket.relatedResource,
        ticket.relatedLocation,
      ].filter((value): value is string => Boolean(value));

      return searchFields.some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [tickets, searchTerm, priorityFilter]);

  const actorInitials = useMemo(() => {
    const cleanedName = actorName.trim();
    if (!cleanedName) {
      return "AD";
    }

    const words = cleanedName.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }

    return cleanedName.slice(0, 2).toUpperCase();
  }, [actorName]);

  function canManageTicket(ticket: Ticket) {
    if (actorRole === "ADMIN") {
      return true;
    }

    return actorRole === "TECHNICIAN" && ticket.assignedTo === actorEmail;
  }

  function canManageComment(comment: TicketComment) {
    if (actorRole === "ADMIN") {
      return true;
    }

    return comment.owner.toLowerCase() === actorEmail.toLowerCase();
  }

  const closeTicketModal = () => setIsTicketModalOpen(false);
  const closePreview = () => setIsPreviewOpen(false);

  const ticketFormModal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8"
      onClick={closeTicketModal}
    >
      <div
        className="w-full max-w-4xl rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_rgba(45,32,15,0.18)] backdrop-blur"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
              Ticket Form
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-stone-950">
              Create a new ticket
            </h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Capture maintenance issues quickly and push them straight to the backend.
            </p>
          </div>
          <button
            type="button"
            onClick={closeTicketModal}
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Close
          </button>
        </div>

        <Panel
          eyebrow="Ticket Form"
          title="Create a new ticket"
          description="Capture maintenance issues quickly and push them straight to the backend."
        >
          <form className="grid gap-4" onSubmit={createTicket}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Title"
                onChange={(value) => setTicketForm((current) => ({ ...current, title: value }))}
                placeholder="Projector not working"
                value={ticketForm.title}
              />
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Created By
                <input
                  className="rounded-2xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-700 outline-none"
                  readOnly
                  value={actorEmail}
                />
              </label>
            </div>

            <TextAreaField
              label="Description"
              onChange={(value) =>
                setTicketForm((current) => ({ ...current, description: value }))
              }
              placeholder="Describe the issue clearly"
              value={ticketForm.description}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Related Resource
                <select
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none"
                  value={ticketForm.relatedResourceId}
                  onChange={(event) => {
                    const value = event.target.value;
                    const resource = resources.find((item) => String(item.id) === value);
                    setTicketForm((current) => ({
                      ...current,
                      relatedResourceId: value,
                      relatedResource: resource?.name || "",
                    }));
                  }}
                >
                  <option value="">Choose a resource</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} ({resource.type})
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="Location"
                onChange={(value) =>
                  setTicketForm((current) => ({ ...current, relatedLocation: value }))
                }
                placeholder="Block A - 2nd Floor"
                value={ticketForm.relatedLocation}
              />
            </div>

            <Field
              label="Related Resource ID (optional)"
              onChange={(value) =>
                setTicketForm((current) => ({ ...current, relatedResourceId: value }))
              }
              placeholder="e.g. 12"
              value={ticketForm.relatedResourceId}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Priority"
                onChange={(value) =>
                  setTicketForm((current) => ({
                    ...current,
                    priority: value as (typeof ticketPriorities)[number],
                  }))
                }
                options={ticketPriorities}
                value={ticketForm.priority}
              />
              <SelectField
                label="Category"
                onChange={(value) =>
                  setTicketForm((current) => ({
                    ...current,
                    category: value as (typeof ticketCategories)[number],
                  }))
                }
                options={ticketCategories}
                value={ticketForm.category}
              />
            </div>

            <TextAreaField
              label="Preferred Contact Details"
              onChange={(value) =>
                setTicketForm((current) => ({ ...current, preferredContactDetails: value }))
              }
              placeholder="Mobile / email / best time to call"
              value={ticketForm.preferredContactDetails}
            />

            <label className="grid gap-2 text-sm font-medium text-stone-700">
              Photos (max 3)
              <input
                accept="image/*"
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 file:mr-3 file:rounded-full file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-stone-700 hover:file:bg-stone-200"
                multiple
                onChange={handleFileSelection}
                type="file"
              />
            </label>

            {selectedFiles.length > 0 ? (
              <p className="text-xs text-stone-600">
                Selected: {selectedFiles.map((file) => file.name).join(", ")}
              </p>
            ) : null}

            <button
              className="mt-2 rounded-full border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-200"
              type="submit"
            >
              Save Ticket
            </button>
          </form>
        </Panel>
      </div>
    </div>
  );

  return (
    <SiteFrame accent={actorRole === "ADMIN" ? "sky" : "amber"}>
      <div className={`mx-auto w-full ${actorRole === "ADMIN" ? "max-w-[1520px]" : "max-w-7xl"}`}>
        <div className={actorRole === "ADMIN" ? "grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]" : ""}>
          {actorRole === "ADMIN" ? (
            <aside className="rounded-[2rem] bg-[linear-gradient(180deg,#1f2677_0%,#1b2164_100%)] p-6 text-white shadow-[0_22px_55px_rgba(23,31,103,0.28)]">
              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-100">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[radial-gradient(circle,#ffb703_18%,#ff006e_48%,#3a86ff_78%)]" />
                VertexOne
              </div>

              <div className="mt-8 text-center">
                <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#f3bda1] text-xl font-semibold text-[#262869]">
                  {actorInitials}
                </div>
                <p className="mt-3 text-lg font-semibold leading-tight">{actorName}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-blue-200">ADMIN</p>
              </div>

              <div className="mt-10">
                <p className="text-3xl font-bold leading-tight text-[#f0c979]">Admin Panel</p>
                <p className="text-3xl font-bold leading-tight text-white">Operations</p>
              </div>

              <div className="mt-8 space-y-3">
                <Link
                  href="/Component/dashboard/admin"
                  className="block rounded-full bg-white/10 px-5 py-3 text-lg font-semibold text-blue-100 transition hover:bg-white/20"
                >
                  Dashboard
                </Link>
                <Link
                  href="/Component/dashboard/admin"
                  className="block rounded-full bg-white/10 px-5 py-3 text-lg font-semibold text-blue-100 transition hover:bg-white/20"
                >
                  Users
                </Link>
                <Link
                  href="/Component/resources"
                  className="block rounded-full bg-white/10 px-5 py-3 text-lg font-semibold text-blue-100 transition hover:bg-white/20"
                >
                  Resources
                </Link>
                <Link
                  href="/Component/bookings"
                  className="block rounded-full bg-white/10 px-5 py-3 text-lg font-semibold text-blue-100 transition hover:bg-white/20"
                >
                  Bookings
                </Link>
                <Link
                  href="/Component/Ticket"
                  className="block rounded-full bg-white px-5 py-3 text-lg font-semibold text-[#1f2677] shadow-sm"
                >
                  Tickets
                </Link>
              </div>
            </aside>
          ) : null}

          <div className={actorRole === "ADMIN" ? "space-y-6" : ""}>
            {actorRole === "ADMIN" ? (
              <>
                <section className="rounded-[2rem] bg-[linear-gradient(135deg,#252d83_0%,#1f2677_100%)] px-7 py-8 text-white shadow-[0_24px_70px_rgba(27,33,100,0.30)]">
                  <h1 className="text-4xl font-semibold tracking-[-0.03em]">Admin Ticket Management</h1>
                  <p className="mt-3 max-w-3xl text-base text-blue-100">
                    Review all maintenance tickets, monitor workflow, and open next actions for assignment and status handling.
                  </p>
                  <button
                    type="button"
                    onClick={() => void loadTickets(statusFilter)}
                    className="mt-6 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    Refresh Tickets
                  </button>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total Tickets</p>
                    <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#1f2677]">{tickets.length}</p>
                  </div>
                  <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Open</p>
                    <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#1f2677]">{openTickets}</p>
                  </div>
                  <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">In Progress</p>
                    <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#1f2677]">{inProgressTickets}</p>
                  </div>
                  <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Resolved / Closed</p>
                    <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#1f2677]">{resolvedOrClosedTickets}</p>
                  </div>
                </section>

                <section className="rounded-[1.7rem] border border-white/70 bg-white/90 p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-4xl font-semibold tracking-[-0.03em] text-[#1f2677]">Filter and Search</h2>
                      <p className="mt-2 text-sm text-slate-600">
                        Search by ticket id, title, description, or category and narrow the list by status and priority.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTicketModalOpen(true)}
                      className="rounded-2xl border border-[#1f2677]/15 bg-[#1f2677] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#27329b]"
                    >
                      Raise Ticket
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-1">
                      Search
                      <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search tickets..."
                        className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#1f2677]/40 focus:ring-4 focus:ring-[#1f2677]/10"
                      />
                    </label>
                    <SelectField
                      label="Status"
                      onChange={(value) => {
                        const selected = value as "ALL" | TicketStatus;
                        setStatusFilter(selected);
                        void loadTickets(selected);
                      }}
                      options={statusOptions}
                      value={statusFilter}
                    />
                    <SelectField
                      label="Priority"
                      onChange={(value) => setPriorityFilter(value as "ALL" | (typeof ticketPriorities)[number])}
                      options={priorityOptions}
                      value={priorityFilter}
                    />
                  </div>
                </section>
              </>
            ) : (
              <DashboardHero
                description="This ticket desk is wired to your Spring Boot backend on port 8089 so you can create, review, assign, and resolve maintenance issues without leaving the frontend."
                eyebrow="UniDesk Ticket Desk"
                error={error}
                message={message}
                onRefresh={() => void loadTickets()}
                action={
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                  >
                    Raise a ticket
                  </button>
                }
                stats={[
                  { label: "Tickets", value: String(tickets.length), tone: "warm" },
                  { label: "Open", value: String(openTickets), tone: "cool" },
                  { label: "Resolved", value: String(resolvedTickets), tone: "cool" },
                  { label: "Backend", value: loading ? "Syncing" : "Online", tone: "dark" },
                ]}
                title="Manage campus tickets from one focused workspace."
              />
            )}

            <section className="grid gap-8" suppressHydrationWarning>
            <Panel
              eyebrow="Tickets"
              title="Current ticket queue"
              description="View full details, comments, progress updates, assignment, and workflow transitions."
            >
              {actorRole !== "ADMIN" ? (
                <div className="mb-4 grid gap-4 md:grid-cols-3">
                  <SelectField
                    label="Filter by status"
                    onChange={(value) => {
                      const selected = value as "ALL" | TicketStatus;
                      setStatusFilter(selected);
                      void loadTickets(selected);
                    }}
                    options={statusOptions}
                    value={statusFilter}
                  />
                  <SelectField
                    label="Filter by priority"
                    onChange={(value) => setPriorityFilter(value as "ALL" | (typeof ticketPriorities)[number])}
                    options={priorityOptions}
                    value={priorityFilter}
                  />
                  <label className="grid gap-2 text-sm font-medium text-stone-700">
                    Search tickets
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search by title, status, category"
                      className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                  </label>
                </div>
              ) : null}

              <div className="space-y-4">
                {filteredTickets.length === 0 ? (
                  <EmptyState text="No tickets yet. Create your first one from the form on this page." />
                ) : (
                  filteredTickets.map((ticket) => (
                    <article
                      key={ticket.id}
                      className="rounded-3xl border border-stone-200 bg-stone-50 p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-stone-950">{ticket.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            {ticket.description}
                          </p>
                        </div>
                        <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-800">
                          {ticket.status}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 text-sm text-stone-600 md:grid-cols-2">
                        <p>Priority: {ticket.priority || "N/A"}</p>
                        <p>Category: {ticket.category || "N/A"}</p>
                        <p>Created By: {ticket.createdBy || "N/A"}</p>
                        <p>Resource: {ticket.relatedResource || "N/A"}</p>
                        <p>Location: {ticket.relatedLocation || "N/A"}</p>
                        <p>Contact: {ticket.preferredContactDetails || "N/A"}</p>
                        <p>Assigned To: {ticket.assignedTo || "Not assigned"}</p>
                        <p>Created At: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "N/A"}</p>
                        <p className="md:col-span-2">
                          Resolution Note: {ticket.resolutionNote || "No note yet"}
                        </p>
                        <p className="md:col-span-2">
                          Rejection Reason: {ticket.rejectionReason || "N/A"}
                        </p>
                        <div className="md:col-span-2">
                          <p className="font-medium text-stone-700">Photos:</p>
                          {ticket.attachments?.length ? (
                            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {ticket.attachments.map((attachment) => (
                                <button
                                  key={attachment.id}
                                  type="button"
                                  onClick={() => {
                                    setPreviewImageUrl(`${BACKEND_BASE_URL}${attachment.downloadUrl}`);
                                    setPreviewImageName(attachment.fileName);
                                    setIsPreviewOpen(true);
                                  }}
                                  className="group overflow-hidden rounded-3xl border border-stone-200 bg-white p-0 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                                >
                                  <div className="relative overflow-hidden bg-stone-100">
                                    <img
                                      alt={attachment.fileName}
                                      className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
                                      src={`${BACKEND_BASE_URL}${attachment.downloadUrl}`}
                                    />
                                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                                  </div>
                                  <div className="px-3 py-2">
                                    <p className="truncate text-sm font-medium text-stone-900">
                                      {attachment.fileName}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p>No photos uploaded</p>
                          )}
                        </div>

                        <div className="md:col-span-2 rounded-2xl border border-stone-200 bg-white p-3">
                          <p className="font-medium text-stone-700">Progress Updates</p>
                          {ticket.progressUpdates?.length ? (
                            <ul className="mt-2 space-y-2 text-xs">
                              {ticket.progressUpdates.map((update) => (
                                <li key={update.id} className="rounded-xl bg-stone-50 p-2">
                                  <p className="font-semibold text-stone-800">{update.updateText}</p>
                                  <p className="text-stone-500">
                                    {update.updatedBy} ({update.updatedByRole}) at{" "}
                                    {new Date(update.createdAt).toLocaleString()}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 text-xs text-stone-500">No progress updates yet.</p>
                          )}

                          {canManageTicket(ticket) ? (
                            <div className="mt-3 flex gap-2">
                              <input
                                value={progressDraftByTicket[ticket.id] || ""}
                                onChange={(event) =>
                                  setProgressDraftByTicket((current) => ({
                                    ...current,
                                    [ticket.id]: event.target.value,
                                  }))
                                }
                                placeholder="Add a technician progress update"
                                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => void addProgressUpdate(ticket.id)}
                                className="rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                              >
                                Add
                              </button>
                            </div>
                          ) : null}
                        </div>

                        <div className="md:col-span-2 rounded-2xl border border-stone-200 bg-white p-3">
                          <p className="font-medium text-stone-700">Comments</p>
                          {ticket.comments?.length ? (
                            <ul className="mt-2 space-y-2 text-xs">
                              {ticket.comments.map((comment) => (
                                <li key={comment.id} className="rounded-xl bg-stone-50 p-2">
                                  {editingCommentId === comment.id ? (
                                    <div className="space-y-2">
                                      <textarea
                                        value={editingCommentText}
                                        onChange={(event) => setEditingCommentText(event.target.value)}
                                        className="w-full rounded-lg border border-stone-200 px-2 py-1 text-xs"
                                        rows={3}
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => void saveEditedComment(comment.id)}
                                          className="rounded-full bg-slate-900 px-3 py-1 text-white"
                                        >
                                          Save
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingCommentId(null);
                                            setEditingCommentText("");
                                          }}
                                          className="rounded-full border border-stone-300 px-3 py-1"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="font-semibold text-stone-800">{comment.commentText}</p>
                                      <p className="text-stone-500">
                                        {comment.owner} ({comment.ownerRole}) at{" "}
                                        {new Date(comment.createdAt).toLocaleString()}
                                      </p>
                                      {canManageComment(comment) ? (
                                        <div className="mt-1 flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingCommentId(comment.id);
                                              setEditingCommentText(comment.commentText);
                                            }}
                                            className="rounded-full border border-stone-300 px-3 py-1"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => void deleteComment(comment.id)}
                                            className="rounded-full border border-rose-300 px-3 py-1 text-rose-700"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      ) : null}
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 text-xs text-stone-500">No comments yet.</p>
                          )}

                          <div className="mt-3 flex gap-2">
                            <input
                              value={commentDraftByTicket[ticket.id] || ""}
                              onChange={(event) =>
                                setCommentDraftByTicket((current) => ({
                                  ...current,
                                  [ticket.id]: event.target.value,
                                }))
                              }
                              placeholder="Add a comment"
                              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => void addComment(ticket.id)}
                              className="rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        {canManageTicket(ticket) && ticket.status === "OPEN" ? (
                          <button
                            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                            onClick={() => void updateTicketStatus(ticket.id, "IN_PROGRESS")}
                            type="button"
                          >
                            Start Progress
                          </button>
                        ) : null}

                        {canManageTicket(ticket) && ticket.status === "IN_PROGRESS" ? (
                          <button
                            className="rounded-full border border-emerald-300 bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
                            onClick={() => void updateTicketStatus(ticket.id, "RESOLVED")}
                            type="button"
                          >
                            Mark Resolved
                          </button>
                        ) : null}

                        {actorRole === "ADMIN" && ticket.status === "RESOLVED" ? (
                          <button
                            className="rounded-full border border-emerald-300 bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
                            onClick={() => void updateTicketStatus(ticket.id, "CLOSED")}
                            type="button"
                          >
                            Close Ticket
                          </button>
                        ) : null}

                        {actorRole === "ADMIN" ? (
                          <div className="flex flex-wrap items-center gap-2 rounded-full border border-stone-200 px-2 py-1">
                            <select
                              value={assignmentByTicket[ticket.id] || ""}
                              onChange={(event) =>
                                setAssignmentByTicket((current) => ({
                                  ...current,
                                  [ticket.id]: event.target.value,
                                }))
                              }
                              className="rounded-full border border-stone-200 px-3 py-1 text-xs"
                            >
                              <option value="">Select technician</option>
                              {technicians.map((technician) => (
                                <option key={technician.id} value={technician.email}>
                                  {technician.fullName} ({technician.email})
                                </option>
                              ))}
                            </select>
                            <button
                              className="rounded-full border border-emerald-300 bg-emerald-100 px-4 py-2 text-xs font-medium text-emerald-800 transition hover:bg-emerald-50"
                              onClick={() => void assignTech(ticket.id)}
                              type="button"
                            >
                              Assign
                            </button>
                          </div>
                        ) : null}

                        {canManageTicket(ticket) ? (
                          <div className="flex w-full items-center gap-2">
                            <input
                              value={resolutionDraftByTicket[ticket.id] || ""}
                              onChange={(event) =>
                                setResolutionDraftByTicket((current) => ({
                                  ...current,
                                  [ticket.id]: event.target.value,
                                }))
                              }
                              placeholder="Resolution notes"
                              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs"
                            />
                            <button
                              className="rounded-full border border-orange-300 bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-800 transition hover:bg-orange-50"
                              onClick={() => void addResolutionNote(ticket.id)}
                              type="button"
                            >
                              Save Note
                            </button>
                          </div>
                        ) : null}

                        {actorRole === "ADMIN" && (ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") ? (
                          <div className="flex w-full items-center gap-2">
                            <input
                              value={rejectionReasonByTicket[ticket.id] || ""}
                              onChange={(event) =>
                                setRejectionReasonByTicket((current) => ({
                                  ...current,
                                  [ticket.id]: event.target.value,
                                }))
                              }
                              placeholder="Rejection reason"
                              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs"
                            />
                            <button
                              className="rounded-full border border-rose-300 bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                              onClick={() => void rejectTicket(ticket.id)}
                              type="button"
                            >
                              Reject
                            </button>
                          </div>
                        ) : null}

                        {(actorRole === "ADMIN" || (ticket.createdBy === actorEmail && ticket.status === "OPEN")) ? (
                          <button
                            className="rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                            onClick={() => void deleteTicket(ticket.id)}
                            type="button"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </Panel>
          </section>
          </div>
        </div>
          {isPreviewOpen ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
              onClick={closePreview}
            >
              <div
                className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[2rem] bg-stone-950"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={closePreview}
                  className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-sm transition hover:bg-white"
                >
                  X
                </button>
                <img
                  alt={previewImageName}
                  src={previewImageUrl}
                  className="h-[80vh] w-full object-contain bg-black"
                />
                <div className="border-t border-white/10 bg-white/95 px-4 py-3 text-sm text-stone-700">
                  {previewImageName}
                </div>
              </div>
            </div>
          ) : null}
          {isTicketModalOpen ? ticketFormModal : null}
      </div>
    </SiteFrame>
  );
}

