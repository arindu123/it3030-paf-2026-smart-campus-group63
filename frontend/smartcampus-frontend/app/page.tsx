"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:8081";

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  assignedTo?: string;
  resolutionNote?: string;
};

type Attachment = {
  id: number;
  fileName: string;
  fileType: string;
  filePath: string;
  ticketId: number;
};

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [attachments, setAttachments] = useState<Record<number, Attachment[]>>(
    {}
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [statusValues, setStatusValues] = useState<Record<number, string>>({});
  const [techValues, setTechValues] = useState<Record<number, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File | null>>(
    {}
  );

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tickets`);
      if (!res.ok) throw new Error("Failed to fetch tickets");

      const data = await res.json();
      setTickets(data);

      const initialStatuses: Record<number, string> = {};
      data.forEach((ticket: Ticket) => {
        initialStatuses[ticket.id] = ticket.status || "OPEN";
      });
      setStatusValues(initialStatuses);

      data.forEach((ticket: Ticket) => {
        fetchAttachments(ticket.id);
      });
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const fetchAttachments = async (ticketId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/attachments/${ticketId}`);
      if (!res.ok) throw new Error("Failed to fetch attachments");

      const data = await res.json();
      setAttachments((prev) => ({
        ...prev,
        [ticketId]: data,
      }));
    } catch (error) {
      console.error("Error fetching attachments:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const createTicket = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please enter title and description");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          priority: "HIGH",
          category: "EQUIPMENT",
          createdBy: "student1",
        }),
      });

      if (!res.ok) throw new Error("Failed to create ticket");

      setTitle("");
      setDescription("");
      fetchTickets();
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Failed to create ticket");
    }
  };

  const updateStatus = async (id: number) => {
    const status = statusValues[id];
    try {
      const res = await fetch(
        `${API_URL}/api/tickets/${id}/status?status=${status}`,
        {
          method: "PUT",
        }
      );

      if (!res.ok) throw new Error("Failed to update status");
      fetchTickets();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const assignTech = async (id: number) => {
    const tech = techValues[id];
    if (!tech?.trim()) {
      alert("Enter technician name");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/tickets/${id}/assign?tech=${encodeURIComponent(tech)}`,
        {
          method: "PUT",
        }
      );

      if (!res.ok) throw new Error("Failed to assign technician");

      setTechValues((prev) => ({ ...prev, [id]: "" }));
      fetchTickets();
    } catch (error) {
      console.error("Error assigning technician:", error);
      alert("Failed to assign technician");
    }
  };

  const addNote = async (id: number) => {
    const note = prompt("Enter resolution note:");
    if (!note?.trim()) return;

    try {
      const res = await fetch(
        `${API_URL}/api/tickets/${id}/resolution-note?note=${encodeURIComponent(
          note
        )}`,
        {
          method: "PUT",
        }
      );

      if (!res.ok) throw new Error("Failed to add note");
      fetchTickets();
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add resolution note");
    }
  };

  const uploadAttachment = async (ticketId: number) => {
    const file = selectedFiles[ticketId];

    if (!file) {
      alert("Please select a file first");
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPG, JPEG, and PDF files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum size is 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/api/attachments/${ticketId}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }

      setSelectedFiles((prev) => ({ ...prev, [ticketId]: null }));
      await fetchAttachments(ticketId);
      alert("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading attachment:", error);
      alert("Upload failed");
    }
  };

  const deleteAttachment = async (attachmentId: number, ticketId: number) => {
    const confirmed = confirm("Are you sure you want to delete this attachment?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/attachments/file/${attachmentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete attachment");
      }

      await fetchAttachments(ticketId);
      alert("Attachment deleted successfully");
    } catch (error) {
      console.error("Error deleting attachment:", error);
      alert("Failed to delete attachment");
    }
  };

  const getFileUrl = (filePath: string) => {
    return `${API_URL}/${filePath.replace(/\\/g, "/")}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-8 text-center text-4xl font-bold">
        Smart Campus Ticket System
      </h1>

      <div className="mx-auto mb-10 max-w-2xl rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">Create Ticket</h2>

        <input
          className="mb-3 w-full rounded border border-gray-300 p-3"
          type="text"
          placeholder="Ticket Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="mb-4 w-full rounded border border-gray-300 p-3"
          placeholder="Ticket Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />

        <button
          className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          onClick={createTicket}
        >
          Create Ticket
        </button>
      </div>

      <div className="mx-auto max-w-5xl">
        <h2 className="mb-4 text-3xl font-semibold">All Tickets</h2>

        {tickets.length === 0 ? (
          <p className="text-gray-600">No tickets found.</p>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="mb-6 rounded-xl bg-white p-6 shadow-md"
            >
              <h3 className="text-2xl font-bold">{ticket.title}</h3>
              <p className="mt-2 text-gray-700">{ticket.description}</p>

              <div className="mt-4 space-y-1">
                <p>
                  <span className="font-semibold">Status:</span> {ticket.status}
                </p>
                <p>
                  <span className="font-semibold">Assigned Technician:</span>{" "}
                  {ticket.assignedTo || "Not assigned"}
                </p>
                <p>
                  <span className="font-semibold">Resolution Note:</span>{" "}
                  {ticket.resolutionNote || "No note added"}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <select
                  className="rounded border border-gray-300 p-2"
                  value={statusValues[ticket.id] || "OPEN"}
                  onChange={(e) =>
                    setStatusValues((prev) => ({
                      ...prev,
                      [ticket.id]: e.target.value,
                    }))
                  }
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>

                <button
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  onClick={() => updateStatus(ticket.id)}
                >
                  Update Status
                </button>

                <input
                  className="rounded border border-gray-300 p-2"
                  placeholder="Technician name"
                  value={techValues[ticket.id] || ""}
                  onChange={(e) =>
                    setTechValues((prev) => ({
                      ...prev,
                      [ticket.id]: e.target.value,
                    }))
                  }
                />

                <button
                  className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                  onClick={() => assignTech(ticket.id)}
                >
                  Assign Tech
                </button>

                <button
                  className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
                  onClick={() => addNote(ticket.id)}
                >
                  Add Note
                </button>
              </div>

              <div className="mt-6 rounded-lg border p-4">
                <h4 className="mb-3 text-lg font-semibold">Attachments</h4>

                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={(e) =>
                      setSelectedFiles((prev) => ({
                        ...prev,
                        [ticket.id]: e.target.files?.[0] || null,
                      }))
                    }
                  />

                  <button
                    className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    onClick={() => uploadAttachment(ticket.id)}
                  >
                    Upload File
                  </button>
                </div>

                {attachments[ticket.id] && attachments[ticket.id].length > 0 ? (
                  <div className="space-y-4">
                    {attachments[ticket.id].map((file) => (
                      <div
                        key={file.id}
                        className="rounded border border-gray-200 p-3"
                      >
                        <p className="font-medium">
                          {file.fileName} ({file.fileType})
                        </p>

                        <div className="mt-2 flex flex-wrap gap-3">
                          <a
                            href={getFileUrl(file.filePath)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            Open
                          </a>

                          <a
                            href={getFileUrl(file.filePath)}
                            download
                            className="text-green-600 underline"
                          >
                            Download
                          </a>

                          <button
                            className="text-red-600 underline"
                            onClick={() => deleteAttachment(file.id, ticket.id)}
                          >
                            Delete
                          </button>
                        </div>

                        {file.fileType.startsWith("image/") && (
                          <img
                            src={getFileUrl(file.filePath)}
                            alt={file.fileName}
                            className="mt-3 h-40 rounded border object-cover"
                          />
                        )}

                        {file.fileType === "application/pdf" && (
                          <iframe
                            src={getFileUrl(file.filePath)}
                            title={file.fileName}
                            className="mt-3 h-64 w-full rounded border"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No attachments uploaded.
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}