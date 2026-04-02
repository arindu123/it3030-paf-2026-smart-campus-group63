"use client";

import { FormEvent, useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8081/api";

const ticketStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"] as const;
const ticketPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const ticketCategories = ["ELECTRICAL", "NETWORK", "EQUIPMENT", "CLEANING", "OTHER"] as const;
const resourceTypes = ["ROOM", "LAB", "EQUIPMENT"] as const;
const resourceStatuses = ["ACTIVE", "OUT_OF_SERVICE"] as const;

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdBy: string;
  createdAt?: string;
  assignedTo?: string;
  resolutionNote?: string;
};

type Resource = {
  id: number;
  name: string;
  type: string;
  capacity: number;
  location: string;
  description: string;
  availableFrom: string;
  availableTo: string;
  status: string;
};

type TicketForm = {
  title: string;
  description: string;
  priority: string;
  category: string;
  createdBy: string;
};

type ResourceForm = {
  name: string;
  type: string;
  capacity: string;
  location: string;
  description: string;
  availableFrom: string;
  availableTo: string;
  status: string;
};

const defaultTicketForm: TicketForm = {
  title: "",
  description: "",
  priority: "HIGH",
  category: "EQUIPMENT",
  createdBy: "student1",
};

const defaultResourceForm: ResourceForm = {
  name: "",
  type: "LAB",
  capacity: "",
  location: "",
  description: "",
  availableFrom: "08:00:00",
  availableTo: "17:00:00",
  status: "ACTIVE",
};

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [ticketForm, setTicketForm] = useState<TicketForm>(defaultTicketForm);
  const [resourceForm, setResourceForm] = useState<ResourceForm>(defaultResourceForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Backend connected. Ready to manage tickets and resources.");
  const [error, setError] = useState("");

  async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, init);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [ticketData, resourceData] = await Promise.all([
        fetchJson<Ticket[]>(`${API_BASE_URL}/tickets`),
        fetchJson<Resource[]>(`${API_BASE_URL}/resources`),
      ]);

      setTickets(ticketData);
      setResources(resourceData);
      setMessage("Dashboard synced with backend API.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load backend data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

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
      await loadDashboard();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create ticket.");
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
      await loadDashboard();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create resource.");
    }
  }

  async function updateTicketStatus(id: number, status: string) {
    setError("");

    try {
      await fetchJson<Ticket>(`${API_BASE_URL}/tickets/${id}/status?status=${status}`, {
        method: "PUT",
      });

      setMessage(`Ticket #${id} updated to ${status}.`);
      await loadDashboard();
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
      await loadDashboard();
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
      await loadDashboard();
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
      await loadDashboard();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete ticket.");
    }
  }

  async function updateResourceStatus(id: number, status: string) {
    setError("");

    try {
      await fetchJson<Resource>(`${API_BASE_URL}/resources/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      setMessage(`Resource #${id} updated to ${status}.`);
      await loadDashboard();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update resource status.");
    }
  }

  async function deleteResource(id: number) {
    setError("");

    try {
      await fetchJson<string>(`${API_BASE_URL}/resources/${id}`, {
        method: "DELETE",
      });

      setMessage(`Resource #${id} deleted.`);
      await loadDashboard();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete resource.");
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_40%),linear-gradient(180deg,_#f5f0e8_0%,_#efe6d5_48%,_#e3d3b1_100%)] px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-stone-900/10 bg-white/80 p-6 shadow-[0_20px_70px_rgba(75,55,22,0.14)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
                Smart Campus Control Desk
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950 md:text-5xl">
                Manage tickets and resources from one simple frontend.
                                Manage tickets and resources from one simple frontend.

              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 md:text-base">
                This dashboard is wired to your Spring Boot backend on port 8081 and gives you a
                straightforward way to create, review, update, and remove campus data.
              </p>
            </div>

            <button
              className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              onClick={() => void loadDashboard()}
              type="button"
            >
              Refresh Data
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <StatusCard label="Tickets" value={String(tickets.length)} tone="warm" />
            <StatusCard label="Resources" value={String(resources.length)} tone="cool" />
            <StatusCard label="Backend" value={loading ? "Syncing" : "Online"} tone="dark" />
          </div>

          <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
            {error ? <span className="text-red-700">{error}</span> : message}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <Panel
              eyebrow="Ticket Form"
              title="Create a new ticket"
              description="Capture maintenance issues quickly and push them straight to the backend."
            >
              <form className="grid gap-4" onSubmit={createTicket}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Title"
                    value={ticketForm.title}
                    onChange={(value) => setTicketForm((current) => ({ ...current, title: value }))}
                    placeholder="Projector not working"
                  />
                  <Field
                    label="Created By"
                    value={ticketForm.createdBy}
                    onChange={(value) =>
                      setTicketForm((current) => ({ ...current, createdBy: value }))
                    }
                    placeholder="student1"
                  />
                </div>

                <TextAreaField
                  label="Description"
                  value={ticketForm.description}
                  onChange={(value) =>
                    setTicketForm((current) => ({ ...current, description: value }))
                  }
                  placeholder="Describe the issue clearly"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField
                    label="Priority"
                    value={ticketForm.priority}
                    onChange={(value) =>
                      setTicketForm((current) => ({ ...current, priority: value }))
                    }
                    options={ticketPriorities}
                  />
                  <SelectField
                    label="Category"
                    value={ticketForm.category}
                    onChange={(value) =>
                      setTicketForm((current) => ({ ...current, category: value }))
                    }
                    options={ticketCategories}
                  />
                </div>

                <button
                  className="mt-2 rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-500"
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
                  <EmptyState text="No tickets yet. Create your first one from the form above." />
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
                        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
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
                          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
                          onClick={() => void updateTicketStatus(ticket.id, "RESOLVED")}
                          type="button"
                        >
                          Mark Resolved
                        </button>
                        <button
                          className="rounded-full bg-sky-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
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
          </div>

          <div className="space-y-8">
            <Panel
              eyebrow="Resource Form"
              title="Register a campus resource"
              description="Add labs, rooms, and equipment with opening hours and live availability."
            >
              <form className="grid gap-4" onSubmit={createResource}>
                <Field
                  label="Resource Name"
                  value={resourceForm.name}
                  onChange={(value) => setResourceForm((current) => ({ ...current, name: value }))}
                  placeholder="Computer Lab A"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField
                    label="Type"
                    value={resourceForm.type}
                    onChange={(value) => setResourceForm((current) => ({ ...current, type: value }))}
                    options={resourceTypes}
                  />
                  <Field
                    label="Capacity"
                    value={resourceForm.capacity}
                    onChange={(value) =>
                      setResourceForm((current) => ({ ...current, capacity: value }))
                    }
                    placeholder="40"
                    type="number"
                  />
                </div>

                <Field
                  label="Location"
                  value={resourceForm.location}
                  onChange={(value) =>
                    setResourceForm((current) => ({ ...current, location: value }))
                  }
                  placeholder="Block A"
                />

                <TextAreaField
                  label="Description"
                  value={resourceForm.description}
                  onChange={(value) =>
                    setResourceForm((current) => ({ ...current, description: value }))
                  }
                  placeholder="Main programming lab"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Available From"
                    value={resourceForm.availableFrom}
                    onChange={(value) =>
                      setResourceForm((current) => ({ ...current, availableFrom: value }))
                    }
                    type="time"
                  />
                  <Field
                    label="Available To"
                    value={resourceForm.availableTo}
                    onChange={(value) =>
                      setResourceForm((current) => ({ ...current, availableTo: value }))
                    }
                    type="time"
                  />
                </div>

                <SelectField
                  label="Status"
                  value={resourceForm.status}
                  onChange={(value) =>
                    setResourceForm((current) => ({ ...current, status: value }))
                  }
                  options={resourceStatuses}
                />

                <button
                  className="mt-2 rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
                  type="submit"
                >
                  Save Resource
                </button>
              </form>
            </Panel>

            <Panel
              eyebrow="Resources"
              title="Availability overview"
              description="See what is active right now and flip resource status in one click."
            >
              <div className="space-y-4">
                {resources.length === 0 ? (
                  <EmptyState text="No resources yet. Add one from the form above." />
                ) : (
                  resources.map((resource) => (
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
                        <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-800">
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
                          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
                          onClick={() => void updateResourceStatus(resource.id, "ACTIVE")}
                          type="button"
                        >
                          Set Active
                        </button>
                        <button
                          className="rounded-full bg-stone-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-600"
                          onClick={() => void updateResourceStatus(resource.id, "OUT_OF_SERVICE")}
                          type="button"
                        >
                          Set Out of Service
                        </button>
                        <button
                          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
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
          </div>
        </section>
      </div>
    </main>
  );
}

function Panel({
  eyebrow,
  title,
  description,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="rounded-[2rem] border border-stone-900/10 bg-white/85 p-6 shadow-[0_16px_50px_rgba(82,58,22,0.12)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold text-stone-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function StatusCard({
  label,
  value,
  tone,
}: Readonly<{
  label: string;
  value: string;
  tone: "warm" | "cool" | "dark";
}>) {
  const toneClass =
    tone === "warm"
      ? "bg-amber-100 text-amber-900"
      : tone === "cool"
        ? "bg-sky-100 text-sky-900"
        : "bg-stone-900 text-white";

  return (
    <div className={`rounded-3xl px-5 py-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-70">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}>) {
  return (
    <label className="grid gap-2 text-sm font-medium text-stone-700">
      {label}
      <input
        className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}>) {
  return (
    <label className="grid gap-2 text-sm font-medium text-stone-700">
      {label}
      <textarea
        className="min-h-28 rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}>) {
  return (
    <label className="grid gap-2 text-sm font-medium text-stone-700">
      {label}
      <select
        className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({ text }: Readonly<{ text: string }>) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
      {text}
    </div>
  );
}
