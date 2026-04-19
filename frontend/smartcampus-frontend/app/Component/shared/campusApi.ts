export const BACKEND_BASE_URL = "http://localhost:8089";
export const API_BASE_URL = `${BACKEND_BASE_URL}/api`;
export const GOOGLE_AUTH_URL = `${BACKEND_BASE_URL}/oauth2/authorization/google`;
export const GITHUB_AUTH_URL = `${BACKEND_BASE_URL}/oauth2/safe/github`;
export const ACTOR_EMAIL_HEADER = "X-User-Email";

export const ticketPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const ticketCategories = ["ELECTRICAL", "NETWORK", "EQUIPMENT", "CLEANING", "OTHER"] as const;
export const ticketStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"] as const;
export const resourceTypes = ["ROOM", "LAB", "EQUIPMENT"] as const;
export const resourceStatuses = ["ACTIVE", "OUT_OF_SERVICE"] as const;
export const userRoles = ["USER", "ADMIN", "TECHNICIAN"] as const;

export type UserRole = (typeof userRoles)[number];
export type TicketStatus = (typeof ticketStatuses)[number];

export type StoredUser = {
  email: string;
  fullName?: string;
  role?: UserRole | string;
};

export type TicketAttachment = {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  downloadUrl: string;
};

export type TicketComment = {
  id: number;
  commentText: string;
  owner: string;
  ownerRole: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type TicketProgressUpdate = {
  id: number;
  updateText: string;
  updatedBy: string;
  updatedByRole: UserRole;
  createdAt: string;
};

export type TicketNotification = {
  id: number;
  ticketId: number;
  type: "STATUS_CHANGED" | "NEW_COMMENT";
  message: string;
  read: boolean;
  createdAt: string;
};

export const campusNotificationTypes = [
  "WELCOME_BACK",
  "BOOKING_REQUEST_SUBMITTED",
  "BOOKING_APPROVED",
  "BOOKING_REJECTED",
  "BOOKING_CANCELLED",
  "TICKET_CREATED",
  "TICKET_ASSIGNED",
  "TICKET_STATUS_CHANGED",
  "TICKET_COMMENT_ADDED",
  "TICKET_RESOLUTION_NOTE_ADDED",
  "TICKET_PROGRESS_UPDATED",
  "TECHNICIAN_UPDATE",
  "DEADLINE_REMINDER",
] as const;

export type CampusNotificationType = (typeof campusNotificationTypes)[number];

export type CampusNotification = {
  id: number;
  title: string;
  message: string;
  type: CampusNotificationType;
  relatedType: string;
  relatedId?: number | null;
  recipientEmail: string;
  recipientRole: UserRole;
  read: boolean;
  createdAt: string;
};

export type Ticket = {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: (typeof ticketPriorities)[number];
  category: (typeof ticketCategories)[number];
  createdBy: string;
  relatedResource?: string | null;
  relatedResourceId?: number | null;
  relatedLocation?: string | null;
  preferredContactDetails?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  assignedTo?: string;
  resolutionNote?: string;
  rejectionReason?: string;
  attachments?: TicketAttachment[];
  comments?: TicketComment[];
  progressUpdates?: TicketProgressUpdate[];
};

export type Attachment = {
  id: number;
  fileName: string; // legacy
  fileType: string; // legacy
  filePath: string; // legacy
  ticketId: number; // legacy
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
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: number;
  status: string;
  resourceName?: string;
  createdBy?: string;
  rejectionReason?: string;
  createdAt?: string;
};

export type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: UserRole;
  status?: string;
  provider?: string;
  lastLoginAt?: string | null;
  lastSeenAt?: string | null;
  online?: boolean;
};

export type TicketForm = {
  title: string;
  description: string;
  priority: (typeof ticketPriorities)[number];
  category: (typeof ticketCategories)[number];
  preferredContactDetails: string;
  relatedResourceId: string;
  relatedResource: string;
  relatedLocation: string;
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
  resourceName: string;
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
  preferredContactDetails: "",
  relatedResourceId: "",
  relatedResource: "",
  relatedLocation: "",
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

export const defaultBookingForm = (resourceId: number, resourceName: string): BookingForm => ({
  resourceId,
  resourceName,
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

export function normalizeRole(role?: string | null): UserRole {
  if (!role) {
    return "USER";
  }

  const value = role.toUpperCase();
  if (value === "ADMIN" || value === "TECHNICIAN") {
    return value;
  }

  return "USER";
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem("smartcampusUser");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    window.localStorage.removeItem("smartcampusUser");
    return null;
  }
}

export function getActorEmailOrThrow(): string {
  const user = getStoredUser();
  const email = user?.email?.trim();

  if (!email) {
    throw new Error("Please login first to perform this action.");
  }

  return email;
}

export function withActorHeaders(init?: RequestInit): RequestInit {
  const actorEmail = getActorEmailOrThrow();
  const headers = new Headers(init?.headers ?? {});
  headers.set(ACTOR_EMAIL_HEADER, actorEmail);
  return {
    ...init,
    headers,
  };
}
