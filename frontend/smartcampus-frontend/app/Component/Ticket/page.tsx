"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
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
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Backend connected. Ready to manage maintenance tickets.");
  const [error, setError] = useState("");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const ticketData = await fetchJson<Ticket[]>(`${API_BASE_URL}/tickets`);
      setTickets(ticketData);
      setMessage("Ticket dashboard synced with backend API.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load backend data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await fetchJson<Ticket>(`${API_BASE_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketForm),
      });

      setTicketForm(defaultTicketForm);
      setMessage("Ticket created successfully.");
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
                        <p>Assigned To: {ticket.assignedTo || "Not assigned"}</p>
                        <p className="md:col-span-2">
                          Resolution Note: {ticket.resolutionNote || "No note yet"}
                        </p>
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
