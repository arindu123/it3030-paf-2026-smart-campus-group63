export const BACKEND_BASE_URL = "http://localhost:8086";
export const API_BASE_URL = `${BACKEND_BASE_URL}/api`;
export const GOOGLE_AUTH_URL = `${BACKEND_BASE_URL}/oauth2/authorization/google`;

export const ticketPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const ticketCategories = ["ELECTRICAL", "NETWORK", "EQUIPMENT", "CLEANING", "OTHER"] as const;
export const resourceTypes = ["ROOM", "LAB", "EQUIPMENT"] as const;
export const resourceStatuses = ["ACTIVE", "OUT_OF_SERVICE"] as const;

export type Ticket = {
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

export type Resource = {
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

export type Booking = {
  id: number;
  resourceId: number;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: number;
  status: string;
  resourceName?: string;
};

export type TicketForm = {
  title: string;
  description: string;
  priority: string;
  category: string;
  createdBy: string;
};

export type ResourceForm = {
  name: string;
  type: string;
  capacity: string;
  location: string;
  description: string;
  availableFrom: string;
  availableTo: string;
  status: string;
};

export type BookingForm = {
  resourceId: number;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: string;
};

export const defaultTicketForm: TicketForm = {
  title: "",
  description: "",
  priority: "HIGH",
  category: "EQUIPMENT",
  createdBy: "student1",
};

export const defaultResourceForm: ResourceForm = {
  name: "",
  type: "LAB",
  capacity: "",
  location: "",
  description: "",
  availableFrom: "08:00:00",
  availableTo: "17:00:00",
  status: "ACTIVE",
};

export const defaultBookingForm = (resourceId: number): BookingForm => ({
  resourceId,
  date: "",
  startTime: "",
  endTime: "",
  purpose: "",
  expectedAttendees: "",
});

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
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
