"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Footer from "../Home/Footer";
import Nav from "../Home/Nav";
import {
  API_BASE_URL,
  defaultResourceForm,
  fetchJson,
  Resource,
  ResourceForm,
  resourceStatuses,
  resourceTypes,
} from "../shared/campusApi";
import {
  DashboardHero,
  EmptyState,
  Field,
  Panel,
  SelectField,
  TextAreaField,
} from "../shared/CampusUi";

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceForm, setResourceForm] = useState<ResourceForm>(defaultResourceForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Backend connected. Ready to manage campus resources.");
  const [error, setError] = useState("");

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const resourceData = await fetchJson<Resource[]>(`${API_BASE_URL}/resources`);
      setResources(resourceData);
      setMessage("Resource dashboard synced with backend API.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load backend data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

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
      await loadResources();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete resource.");
    }
  }

  const activeResources = resources.filter((resource) => resource.status === "ACTIVE").length;

  return (
    <div>
      <Nav />
      <main
        className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_40%),linear-gradient(180deg,_#eef6ff_0%,_#ddeefe_48%,_#c8dff7_100%)] px-4 py-8 text-stone-900 sm:px-6 lg:px-8"
        suppressHydrationWarning
      >
        <div className="mx-auto max-w-7xl">
          <DashboardHero
            description="This resource workspace is wired to your Spring Boot backend on port 8081 so you can register labs, rooms, and equipment, then update live availability from one page."
            eyebrow="Smart Campus Resource Desk"
            error={error}
            message={message}
            onRefresh={() => void loadResources()}
            stats={[
              { label: "Resources", value: String(resources.length), tone: "cool" },
              { label: "Active", value: String(activeResources), tone: "warm" },
              { label: "Backend", value: loading ? "Syncing" : "Online", tone: "dark" },
            ]}
            title="Register and manage campus resources in a dedicated workspace."
          />

          <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]" suppressHydrationWarning>
            <Panel
              eyebrow="Resource Form"
              title="Register a campus resource"
              description="Add labs, rooms, and equipment with opening hours and live availability."
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
                    onChange={(value) =>
                      setResourceForm((current) => ({ ...current, capacity: value }))
                    }
                    placeholder="40"
                    type="number"
                    value={resourceForm.capacity}
                  />
                </div>

                <Field
                  label="Location"
                  onChange={(value) =>
                    setResourceForm((current) => ({ ...current, location: value }))
                  }
                  placeholder="Block A"
                  value={resourceForm.location}
                />

                <TextAreaField
                  label="Description"
                  onChange={(value) =>
                    setResourceForm((current) => ({ ...current, description: value }))
                  }
                  placeholder="Main programming lab"
                  value={resourceForm.description}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Available From"
                    onChange={(value) =>
                      setResourceForm((current) => ({ ...current, availableFrom: value }))
                    }
                    type="time"
                    value={resourceForm.availableFrom}
                  />
                  <Field
                    label="Available To"
                    onChange={(value) =>
                      setResourceForm((current) => ({ ...current, availableTo: value }))
                    }
                    type="time"
                    value={resourceForm.availableTo}
                  />
                </div>

                <SelectField
                  label="Status"
                  onChange={(value) =>
                    setResourceForm((current) => ({ ...current, status: value }))
                  }
                  options={resourceStatuses}
                  value={resourceForm.status}
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
                  <EmptyState text="No resources yet. Add one from the form on this page." />
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
      <Footer />
    </div>
  );
}
