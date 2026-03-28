"use client";

import { useEffect, useState } from "react";

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  assignedTo?: string;
  resolutionNote?: string;
};

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Fetch all tickets
  const fetchTickets = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/tickets");
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Create new ticket
  const createTicket = async () => {
    if (!title || !description) {
      alert("Please enter title and description");
      return;
    }

    try {
      await fetch("http://localhost:8081/api/tickets", {
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

      setTitle("");
      setDescription("");
      fetchTickets();
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  // Mark ticket as resolved
  const updateStatus = async (id: number) => {
    try {
      await fetch(
        `http://localhost:8081/api/tickets/${id}/status?status=RESOLVED`,
        {
          method: "PUT",
        }
      );
      fetchTickets();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Assign technician
  const assignTech = async (id: number) => {
    try {
      await fetch(
        `http://localhost:8081/api/tickets/${id}/assign?tech=tech1`,
        {
          method: "PUT",
        }
      );
      fetchTickets();
    } catch (error) {
      console.error("Error assigning technician:", error);
    }
  };

  // Add resolution note
  const addNote = async (id: number) => {
    const note = prompt("Enter resolution note:");
    if (!note) return;

    try {
      await fetch(
        `http://localhost:8081/api/tickets/${id}/resolution-note?note=${encodeURIComponent(
          note
        )}`,
        {
          method: "PUT",
        }
      );
      fetchTickets();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-8 text-center text-4xl font-bold">
        Smart Campus Ticket System
      </h1>

      {/* Create Ticket Form */}
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

      {/* Ticket List */}
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-3xl font-semibold">All Tickets</h2>

        {tickets.length === 0 ? (
          <p className="text-gray-600">No tickets found.</p>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="mb-5 rounded-xl bg-white p-6 shadow-md"
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

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  onClick={() => updateStatus(ticket.id)}
                >
                  Mark Resolved
                </button>

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
            </div>
          ))
        )}
      </div>
    </div>
  );
}