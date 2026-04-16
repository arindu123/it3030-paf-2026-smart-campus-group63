"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import {
  Attachment,
  API_BASE_URL,
  defaultTicketForm,
  fetchJson,
  Ticket,
  TicketForm,
  ticketCategories,
  ticketPriorities,
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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketForm, setTicketForm] = useState<TicketForm>(defaultTicketForm);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [attachmentsByTicket, setAttachmentsByTicket] = useState<Record<number, Attachment[]>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Backend connected. Ready to manage maintenance tickets.");
  const [error, setError] = useState("");

  const loadTicketAttachments = useCallback(async (ticketList: Ticket[]) => {
    const attachmentEntries = await Promise.all(
      ticketList.map(async (ticket) => {
        try {
          const attachments = await fetchJson<Attachment[]>(`${API_BASE_URL}/attachments/${ticket.id}`);
          return [ticket.id, attachments] as const;
        } catch {
          return [ticket.id, []] as const;
        }
      })
    );

    const attachmentMap: Record<number, Attachment[]> = {};
    for (const [ticketId, attachmentList] of attachmentEntries) {
      attachmentMap[ticketId] = attachmentList;
    }

    setAttachmentsByTicket(attachmentMap);
  }, []);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const ticketData = await fetchJson<Ticket[]>(`${API_BASE_URL}/tickets`);
      setTickets(ticketData);
      await loadTicketAttachments(ticketData);
      setMessage("Ticket dashboard synced with backend API.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load backend data.");
      setAttachmentsByTicket({});
    } finally {
      setLoading(false);
    }
  }, [loadTicketAttachments]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

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
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/attachments/${ticketId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to upload attachment: ${file.name}`);
      }
    }
  }

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const createdTicket = await fetchJson<Ticket>(`${API_BASE_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketForm),
      });

      if (selectedFiles.length > 0) {
        await uploadSelectedFiles(createdTicket.id, selectedFiles);
      }

      setTicketForm(defaultTicketForm);
      setSelectedFiles([]);
      setMessage(
        selectedFiles.length > 0
          ? "Ticket created successfully with attachments."
          : "Ticket created successfully."
      );
      await loadTickets();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create ticket.");
    }
  }

  async function updateTicketStatus(id: number, status: string) {
    setError("");

    try {
      await fetchJson<Ticket>(`${API_BASE_URL}/tickets/${id}/status?status=${status}`, {
        method: "PUT",
      });

      setMessage(`Ticket #${id} updated to ${status}.`);
      await loadTickets();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update ticket status.");
    }
  }

  async function assignTech(id: number) {
    const techName = window.prompt("Enter technician name", "tech1");
    if (!techName) {
      return;
    }

    setError("");

    try {
      await fetchJson<Ticket>(
        `${API_BASE_URL}/tickets/${id}/assign?tech=${encodeURIComponent(techName)}`,
        {
          method: "PUT",
        }
      );

      setMessage(`Technician assigned to ticket #${id}.`);
      await loadTickets();
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : "Failed to assign technician.");
    }
  }

  async function addResolutionNote(id: number) {
    const note = window.prompt("Enter resolution note");
    if (!note) {
      return;
    }

    setError("");

    try {
      await fetchJson<Ticket>(
        `${API_BASE_URL}/tickets/${id}/resolution-note?note=${encodeURIComponent(note)}`,
        {
          method: "PUT",
        }
      );

      setMessage(`Resolution note added to ticket #${id}.`);
      await loadTickets();
    } catch (noteError) {
      setError(noteError instanceof Error ? noteError.message : "Failed to update note.");
    }
  }

  async function deleteTicket(id: number) {
    setError("");

    try {
      await fetchJson<void>(`${API_BASE_URL}/tickets/${id}`, {
        method: "DELETE",
      });

      setMessage(`Ticket #${id} deleted.`);
      await loadTickets();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete ticket.");
    }
  }

  const resolvedTickets = tickets.filter((ticket) => ticket.status === "RESOLVED").length;

  return (
    <SiteFrame accent="amber">
      <div className="mx-auto max-w-7xl">
          <DashboardHero
            description="This ticket desk is wired to your Spring Boot backend on port 8089 so you can create, review, assign, and resolve maintenance issues without leaving the frontend."
            eyebrow="Smart Campus Ticket Desk"
            error={error}
            message={message}
            onRefresh={() => void loadTickets()}
            stats={[
              { label: "Tickets", value: String(tickets.length), tone: "warm" },
              { label: "Resolved", value: String(resolvedTickets), tone: "cool" },
              { label: "Backend", value: loading ? "Syncing" : "Online", tone: "dark" },
            ]}
            title="Manage campus tickets from one focused workspace."
          />

          <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]" suppressHydrationWarning>
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
                  <Field
                    label="Created By"
                    onChange={(value) =>
                      setTicketForm((current) => ({ ...current, createdBy: value }))
                    }
                    placeholder="student1"
                    value={ticketForm.createdBy}
                  />
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
                  <Field
                    label="Resource"
                    onChange={(value) =>
                      setTicketForm((current) => ({ ...current, resource: value }))
                    }
                    placeholder="Projector / Lab 3"
                    value={ticketForm.resource}
                  />
                  <Field
                    label="Location"
                    onChange={(value) =>
                      setTicketForm((current) => ({ ...current, location: value }))
                    }
                    placeholder="Block A - 2nd Floor"
                    value={ticketForm.location}
                  />
                </div>

                <Field
                  label="Contact Number"
                  onChange={(value) =>
                    setTicketForm((current) => ({ ...current, contactNumber: value }))
                  }
                  placeholder="0771234567"
                  value={ticketForm.contactNumber}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField
                    label="Priority"
                    onChange={(value) =>
                      setTicketForm((current) => ({ ...current, priority: value }))
                    }
                    options={ticketPriorities}
                    value={ticketForm.priority}
                  />
                  <SelectField
                    label="Category"
                    onChange={(value) =>
                      setTicketForm((current) => ({ ...current, category: value }))
                    }
                    options={ticketCategories}
                    value={ticketForm.category}
                  />
                </div>

                <TextAreaField
                  label="Comments"
                  onChange={(value) =>
                    setTicketForm((current) => ({ ...current, comments: value }))
                  }
                  placeholder="Any extra details or admin/user comments"
                  value={ticketForm.comments}
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
                  className="mt-2 rounded-full bg-[linear-gradient(135deg,#d97706,#b45309)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105"
                  type="submit"
                >
                  Save Ticket
                </button>
              </form>
            </Panel>

            <Panel
              eyebrow="Tickets"
              title="Current ticket queue"
              description="Update statuses, assign technicians, and attach a resolution note from here."
            >
              <div className="space-y-4">
                {tickets.length === 0 ? (
                  <EmptyState text="No tickets yet. Create your first one from the form on this page." />
                ) : (
                  tickets.map((ticket) => (
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
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-800">
                          {ticket.status}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 text-sm text-stone-600 md:grid-cols-2">
                        <p>Priority: {ticket.priority || "N/A"}</p>
                        <p>Category: {ticket.category || "N/A"}</p>
                        <p>Created By: {ticket.createdBy || "N/A"}</p>
                        <p>Resource: {ticket.resource || "N/A"}</p>
                        <p>Location: {ticket.location || "N/A"}</p>
                        <p>Contact: {ticket.contactNumber || "N/A"}</p>
                        <p>Assigned To: {ticket.assignedTo || "Not assigned"}</p>
                        <p className="md:col-span-2">
                          Comments: {ticket.comments || "No comments yet"}
                        </p>
                        <p className="md:col-span-2">
                          Resolution Note: {ticket.resolutionNote || "No note yet"}
                        </p>
                        <div className="md:col-span-2">
                          <p className="font-medium text-stone-700">Photos:</p>
                          {attachmentsByTicket[ticket.id]?.length ? (
                            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {attachmentsByTicket[ticket.id].map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="overflow-hidden rounded-xl border border-stone-200 bg-white"
                                >
                                  <img
                                    alt={attachment.fileName}
                                    className="h-28 w-full bg-stone-100 object-cover"
                                    src={`${API_BASE_URL}/attachments/file/${attachment.id}`}
                                  />
                                  <p className="truncate px-2 py-1 text-xs text-stone-600" title={attachment.fileName}>
                                    {attachment.fileName}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>No photos uploaded</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
                          onClick={() => void updateTicketStatus(ticket.id, "IN_PROGRESS")}
                          type="button"
                        >
                          Mark In Progress
                        </button>
                        <button
                          className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600"
                          onClick={() => void updateTicketStatus(ticket.id, "RESOLVED")}
                          type="button"
                        >
                          Mark Resolved
                        </button>
                        <button
                          className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                          onClick={() => void assignTech(ticket.id)}
                          type="button"
                        >
                          Assign Tech
                        </button>
                        <button
                          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-400"
                          onClick={() => void addResolutionNote(ticket.id)}
                          type="button"
                        >
                          Add Note
                        </button>
                        <button
                          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                          onClick={() => void deleteTicket(ticket.id)}
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
      </div>
    </SiteFrame>
  );
}
