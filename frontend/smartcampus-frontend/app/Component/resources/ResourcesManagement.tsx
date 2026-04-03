"use client";

import { FormEvent, useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8081/api";
const resourceTypes = ["ROOM", "LAB", "EQUIPMENT"] as const;
const resourceStatuses = ["ACTIVE", "OUT_OF_SERVICE"] as const;

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

export default function ResourcesManagement() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceForm, setResourceForm] = useState<ResourceForm>(defaultResourceForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Backend connected. Ready to manage resources.");
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

  async function loadResources() {
    setLoading(true);
    setError("");

    try {
      const resourceData = await fetchJson<Resource[]>(`${API_BASE_URL}/resources`);
      setResources(resourceData);
      setMessage("Resources synced with backend API.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      await loadResources();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create resource.");
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
      await loadResources();
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Failed to update resource status."
      );
    }
  }

  async function deleteResource(id: number) {
    setError("");

    try {
      await fetchJson<string>(`${API_BASE_URL}/resources/${id}`, {
        method: "DELETE",
      });

      setMessage(`Resource #${id} deleted.`);
      await loadResources();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete resource.");
    }
  }

  return (
    <main
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_40%),linear-gradient(180deg,_#f5f0e8_0%,_#efe6d5_48%,_#e3d3b1_100%)] px-4 py-8 text-stone-900 sm:px-6 lg:px-8"
      suppressHydrationWarning
    >
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-stone-900/10 bg-white/80 p-6 shadow-[0_20px_70px_rgba(75,55,22,0.14)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
                Smart Campus Resource Center
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950 md:text-5xl">
                Register and manage campus resources from one place.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 md:text-base">
                This page keeps the same resource registration UI and availability management flow,
                now moved under the Resources section.
              </p>
            </div>

            <button
              className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              onClick={() => void loadResources()}
              type="button"
            >
              Refresh Data
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <StatusCard label="Resources" value={String(resources.length)} tone="cool" />
            <StatusCard label="Backend" value={loading ? "Syncing" : "Online"} tone="dark" />
          </div>

          <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
            {error ? <span className="text-red-700">{error}</span> : message}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]" suppressHydrationWarning>
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
  tone: "cool" | "dark";
}>) {
  const toneClass = tone === "cool" ? "bg-sky-100 text-sky-900" : "bg-stone-900 text-white";

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
