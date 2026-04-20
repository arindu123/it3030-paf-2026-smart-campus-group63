"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  API_BASE_URL,
  AdminUser,
  Booking,
  defaultResourceForm,
  fetchJson,
  Resource,
  ResourceForm,
  resourceStatuses,
  resourceTypes,
  UserRole,
  userRoles,
} from "../../shared/campusApi";
import { Field, Panel, SelectField, TextAreaField } from "../../shared/CampusUi";
import { GlassPanel, MetricTile, PageHero, SiteFrame } from "../../shared/SiteFrame";

type StoredUser = {
  email: string;
  fullName?: string;
  role?: string;
};

function normalizeRole(role?: string | null): UserRole {
  if (!role) {
    return "USER";
  }

  const value = role.toUpperCase();
  if (value === "ADMIN" || value === "TECHNICIAN") {
    return value;
  }

  return "USER";
}

function formatUtcTimestamp(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return `${date.toISOString().replace("T", " ").slice(0, 19)} UTC`;
}

function mapResourceToForm(resource: Resource): ResourceForm {
  return {
    name: resource.name,
    type: resource.type,
    capacity: String(resource.capacity),
    location: resource.location,
    description: resource.description,
    availableFrom: resource.availableFrom,
    availableTo: resource.availableTo,
    status: resource.status,
  };
}

function validateResourceForm(resourceForm: ResourceForm): string | null {
  const name = resourceForm.name.trim();
  const location = resourceForm.location.trim();
  const description = resourceForm.description.trim();
  const capacity = Number(resourceForm.capacity);

  if (!name) {
    return "Resource name is required.";
  }
  if (name.length < 3) {
    return "Resource name must be at least 3 characters long.";
  }
  if (name.length > 100) {
    return "Resource name must be 100 characters or fewer.";
  }
  if (!resourceForm.type) {
    return "Resource type is required.";
  }
  if (!resourceForm.capacity.trim()) {
    return "Capacity is required.";
  }
  if (!Number.isInteger(capacity) || capacity <= 0) {
    return "Capacity must be a whole number greater than 0.";
  }
  if (capacity > 1000) {
    return "Capacity must be 1000 or fewer.";
  }
  if (!location) {
    return "Location is required.";
  }
  if (location.length > 100) {
    return "Location must be 100 characters or fewer.";
  }
  if (!description) {
    return "Description is required.";
  }
  if (description.length > 500) {
    return "Description must be 500 characters or fewer.";
  }
  if (!resourceForm.availableFrom || !resourceForm.availableTo) {
    return "Available from and available to times are required.";
  }
  if (resourceForm.availableFrom >= resourceForm.availableTo) {
    return "Available from time must be earlier than available to time.";
  }
  if (!resourceForm.status) {
    return "Resource status is required.";
  }

  return null;
}

function buildResourcePayload(resourceForm: ResourceForm) {
  return {
    ...resourceForm,
    name: resourceForm.name.trim(),
    capacity: Number(resourceForm.capacity),
    location: resourceForm.location.trim(),
    description: resourceForm.description.trim(),
  };
}

function sanitizeCapacityInput(value: string) {
  return value.replace(/[^\d]/g, "");
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function truncatePdfText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
}

function buildPdfDocument(pageContents: string[]) {
  const objects: string[] = [];
  const pageObjectNumbers: number[] = [];
  const contentObjectNumbers: number[] = [];

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  let nextObjectNumber = 5;

  pageContents.forEach((content) => {
    const pageObjectNumber = nextObjectNumber++;
    const contentObjectNumber = nextObjectNumber++;

    pageObjectNumbers.push(pageObjectNumber);
    contentObjectNumbers.push(contentObjectNumber);

    objects[pageObjectNumber] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
    objects[contentObjectNumber] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });

  objects[2] = `<< /Type /Pages /Count ${pageObjectNumbers.length} /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] >>`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  for (let index = 1; index < objects.length; index += 1) {
    if (!objects[index]) {
      continue;
    }

    offsets[index] = pdf.length;
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < objects.length; index += 1) {
    const offset = offsets[index] ?? 0;
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentAdminEmail, setCurrentAdminEmail] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resourceForm, setResourceForm] = useState<ResourceForm>(defaultResourceForm);
  const [roleEdits, setRoleEdits] = useState<Record<number, UserRole>>({});
  const [activeUserAction, setActiveUserAction] = useState<number | null>(null);
  const [activeResourceAction, setActiveResourceAction] = useState<number | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [resourceEdits, setResourceEdits] = useState<Record<number, ResourceForm>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Loading admin data...");
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhoneNumber, setNewUserPhoneNumber] = useState("");
  const [newUserDepartment, setNewUserDepartment] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("TECHNICIAN");
  const [newUserProvider, setNewUserProvider] = useState<"LOCAL" | "GOOGLE">("GOOGLE");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [isExportingResourcesPdf, setIsExportingResourcesPdf] = useState(false);
  const [activeBookingAction, setActiveBookingAction] = useState<number | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approvingBookingId, setApprovingBookingId] = useState<number | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingBookingId, setRejectingBookingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approvingBookingId, setApprovingBookingId] = useState<number | null>(null);

  const loadAdminData = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    if (!silent) {
      setLoading(true);
      setError("");
    }

    try {
      const [usersData, resourceData, bookingData] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users`).then((response) => response.json() as Promise<AdminUser[]>),
        fetchJson<Resource[]>(`${API_BASE_URL}/resources`),
        fetchJson<Booking[]>(`${API_BASE_URL}/bookings`),
      ]);

      const normalizedUsers = usersData.map((user) => ({
        ...user,
        role: normalizeRole(user.role),
      }));

      setUsers(normalizedUsers);
      setResources(resourceData);
      setResourceEdits((current) =>
        resourceData.reduce<Record<number, ResourceForm>>((accumulator, resource) => {
          accumulator[resource.id] = current[resource.id] ?? mapResourceToForm(resource);
          return accumulator;
        }, {})
      );
      setBookings(bookingData);
      setRoleEdits(
        normalizedUsers.reduce<Record<number, UserRole>>((accumulator, user) => {
          accumulator[user.id] = user.role;
          return accumulator;
        }, {})
      );
      setLastUpdatedAt(new Date().toLocaleTimeString());

      if (!silent) {
        setMessage("Admin dashboard synced with users, resources, and bookings.");
      }
    } catch {
      if (!silent) {
        setError("Unable to load admin dashboard data. Check backend connection.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem("smartcampusUser");

    if (!raw) {
      router.replace("/Component/Login");
      return;
    }

    try {
      const currentUser = JSON.parse(raw) as StoredUser;

      if (normalizeRole(currentUser.role) !== "ADMIN") {
        router.replace("/Component/dashboard/user");
        return;
      }

      setCurrentAdminEmail(currentUser.email || "");
      setIsAuthorized(true);
    } catch {
      window.localStorage.removeItem("smartcampusUser");
      router.replace("/Component/Login");
      return;
    }

    void loadAdminData();
  }, [loadAdminData, router]);

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadAdminData({ silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [isAuthorized, loadAdminData]);

  const overview = useMemo(() => {
    const adminCount = users.filter((user) => user.role === "ADMIN").length;
    const technicianCount = users.filter((user) => user.role === "TECHNICIAN").length;
    const onlineCount = users.filter((user) => user.online).length;
    const activeResourceCount = resources.filter((resource) => resource.status === "ACTIVE").length;
    const pendingBookingCount = bookings.filter((booking) => booking.status === "PENDING").length;

    return {
      activeResourceCount,
      adminCount,
      technicianCount,
      onlineCount,
      pendingBookingCount,
    };
  }, [resources, users, bookings]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...users]
      .filter((user) => {
        if (!normalizedSearch) {
          return true;
        }

        return [user.fullName, user.email, user.department, user.role, user.provider]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      })
      .sort((left, right) => Number(right.online) - Number(left.online) || left.fullName.localeCompare(right.fullName));
  }, [searchTerm, users]);

  async function updateUserRole(userId: number) {
    setActiveUserAction(userId);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: roleEdits[userId] }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Role update failed" }));
        throw new Error(body.message || "Role update failed");
      }

      setMessage("User role updated.");
      await loadAdminData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Role update failed");
    } finally {
      setActiveUserAction(null);
    }
  }

  async function deactivateUser(userId: number) {
    setActiveUserAction(userId);
    setError("");

    if (!currentAdminEmail) {
      setError("Admin email is missing. Please sign in again.");
      setActiveUserAction(null);
      return;
    }

    try {
      await fetchJson(`${API_BASE_URL}/admin/users/${userId}/deactivate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": currentAdminEmail,
        },
      });

      setMessage(`User #${userId} deactivated.`);
      await loadAdminData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to deactivate user.");
    } finally {
      setActiveUserAction(null);
    }
  }

  async function activateUser(userId: number) {
    setActiveUserAction(userId);
    setError("");

    if (!currentAdminEmail) {
      setError("Admin email is missing. Please sign in again.");
      setActiveUserAction(null);
      return;
    }

    try {
      await fetchJson(`${API_BASE_URL}/admin/users/${userId}/activate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": currentAdminEmail,
        },
      });

      setMessage(`User #${userId} activated.`);
      await loadAdminData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to activate user.");
    } finally {
      setActiveUserAction(null);
    }
  }

  async function deleteUser(userId: number) {
    setActiveUserAction(userId);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "User delete failed" }));
        throw new Error(body.message || "User delete failed");
      }

      setMessage("User removed successfully.");
      await loadAdminData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "User delete failed");
    } finally {
      setActiveUserAction(null);
    }
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatingUser(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: newUserFullName,
          email: newUserEmail,
          phoneNumber: newUserPhoneNumber,
          department: newUserDepartment,
          role: newUserRole,
          provider: newUserProvider,
          password: newUserPassword,
          confirmPassword: newUserConfirmPassword,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "User create failed" }));
        throw new Error(body.message || "User create failed");
      }

      setNewUserFullName("");
      setNewUserEmail("");
      setNewUserPhoneNumber("");
      setNewUserDepartment("");
      setNewUserRole("TECHNICIAN");
      setNewUserProvider("GOOGLE");
      setNewUserPassword("");
      setNewUserConfirmPassword("");
      setMessage("User account created successfully.");
      await loadAdminData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "User create failed");
    } finally {
      setCreatingUser(false);
    }
  }

  async function createResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const validationError = validateResourceForm(resourceForm);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await fetchJson<Resource>(`${API_BASE_URL}/resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildResourcePayload(resourceForm)),
      });

      setResourceForm(defaultResourceForm);
      setMessage("Resource created successfully.");
      await loadAdminData();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create resource.");
    }
  }

  async function updateResourceStatus(resourceId: number, status: string) {
    setActiveResourceAction(resourceId);
    setError("");

    try {
      await fetchJson<Resource>(`${API_BASE_URL}/resources/${resourceId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      setMessage(`Resource #${resourceId} updated to ${status}.`);
      await loadAdminData();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update resource status.");
    } finally {
      setActiveResourceAction(null);
    }
  }

  async function deleteResource(resourceId: number) {
    setActiveResourceAction(resourceId);
    setError("");

    try {
      await fetchJson<string>(`${API_BASE_URL}/resources/${resourceId}`, {
        method: "DELETE",
      });

      setMessage(`Resource #${resourceId} deleted.`);
      await loadAdminData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete resource.");
    } finally {
      setActiveResourceAction(null);
    }
  }

  async function saveResource(resourceId: number) {
    const resourceDraft = resourceEdits[resourceId];

    if (!resourceDraft) {
      return;
    }

    const validationError = validateResourceForm(resourceDraft);

    if (validationError) {
      setError(validationError);
      return;
    }

    setActiveResourceAction(resourceId);
    setError("");

    try {
      await fetchJson<Resource>(`${API_BASE_URL}/resources/${resourceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildResourcePayload(resourceDraft)),
      });

      setEditingResourceId(null);
      setMessage(`Resource #${resourceId} updated successfully.`);
      await loadAdminData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save resource.");
    } finally {
      setActiveResourceAction(null);
    }
  }

  async function approveBooking(bookingId: number) {
    setActiveBookingAction(bookingId);
    setError("");

    if (!currentAdminEmail) {
      setError("Admin email is missing. Please sign in again.");
      setActiveBookingAction(null);
      return;
    }

    try {
      await fetchJson<Booking>(`${API_BASE_URL}/bookings/${bookingId}/approve`, {
        method: "PATCH",
        headers: {
          "X-User-Email": currentAdminEmail,
        },
      });

      setMessage(`Booking #${bookingId} approved.`);
      await loadAdminData();
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : "Failed to approve booking.");
    } finally {
      setActiveBookingAction(null);
    }
  }

  function openApproveModal(bookingId: number) {
    setApprovingBookingId(bookingId);
    setError("");
    setIsApproveModalOpen(true);
  }

  function closeApproveModal() {
    setIsApproveModalOpen(false);
    setApprovingBookingId(null);
  }

  async function submitApproveBooking() {
    if (approvingBookingId == null) {
      return;
    }

    await approveBooking(approvingBookingId);
    closeApproveModal();
  }

  function openRejectModal(bookingId: number) {
    setRejectingBookingId(bookingId);
    setRejectionReason("");
    setError("");
    setIsRejectModalOpen(true);
  }

  function closeRejectModal() {
    setIsRejectModalOpen(false);
    setRejectingBookingId(null);
    setRejectionReason("");
  }

  function openApproveModal(bookingId: number) {
    setApprovingBookingId(bookingId);
    setError("");
    setIsApproveModalOpen(true);
  }

  function closeApproveModal() {
    setIsApproveModalOpen(false);
    setApprovingBookingId(null);
  }

  async function submitApproveBooking() {
    if (approvingBookingId == null) {
      return;
    }

    await approveBooking(approvingBookingId);
    closeApproveModal();
  }

  async function submitRejectBooking() {
    if (rejectingBookingId == null) {
      return;
    }

    setActiveBookingAction(rejectingBookingId);
    setError("");

    if (!currentAdminEmail) {
      setError("Admin email is missing. Please sign in again.");
      setActiveBookingAction(null);
      return;
    }

    try {
      await fetchJson<Booking>(`${API_BASE_URL}/bookings/${rejectingBookingId}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": currentAdminEmail,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      setMessage(`Booking #${rejectingBookingId} rejected.`);
      closeRejectModal();
      await loadAdminData();
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : "Failed to reject booking.");
    } finally {
      setActiveBookingAction(null);
    }
  }

  async function cancelBookingFromAdmin(bookingId: number) {
    setError("");
    setActiveBookingAction(bookingId);

    try {
      await fetchJson(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          "X-User-Email": currentAdminEmail,
        },
      });

      setMessage(`Booking #${bookingId} cancelled.`);
      await loadAdminData();
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Failed to cancel booking.");
    } finally {
      setActiveBookingAction(null);
    }
  }

  function exportResourcesPdf() {
    setError("");

    if (resources.length === 0) {
      setError("No resources available to export.");
      return;
    }

    setIsExportingResourcesPdf(true);

    try {
      const generatedAt = new Date().toLocaleString();
      const pageContents: string[] = [];
      const marginX = 40;
      const pageTop = 792;
      const pageBottom = 40;
      const contentWidth = 532;
      const tableColumns = [
        { label: "ID", width: 34 },
        { label: "NAME", width: 88 },
        { label: "TYPE", width: 44 },
        { label: "CAPACITY", width: 56 },
        { label: "LOCATION", width: 68 },
        { label: "STATUS", width: 54 },
        { label: "AVAILABILITY", width: 88 },
        { label: "DESCRIPTION", width: 100 },
      ];

      let currentOps: string[] = [];
      let currentY = pageTop - 48;

      const startPage = (withFullHeader: boolean) => {
        currentOps = [];
        currentY = pageTop - 48;

        if (withFullHeader) {
          currentOps.push("BT /F2 28 Tf 40 730 Td (Smart Campus Resources Report) Tj ET");
          currentOps.push("BT /F1 12 Tf 40 700 Td (Generated by admin dashboard) Tj ET");
          currentOps.push(`BT /F1 12 Tf 40 682 Td (${escapePdfText(`Generated at: ${generatedAt}`)}) Tj ET`);

          currentOps.push("0.85 0.85 0.85 RG");
          currentOps.push("0.99 0.99 0.99 rg");
          currentOps.push("40 560 532 84 re B");
          currentOps.push("0 0 0 rg");
          currentOps.push("BT /F2 14 Tf 56 618 Td (Total Resources:) Tj ET");
          currentOps.push(`BT /F1 14 Tf 172 618 Td (${resources.length}) Tj ET`);
          currentOps.push("BT /F2 14 Tf 56 590 Td (Active Resources:) Tj ET");
          currentOps.push(`BT /F1 14 Tf 179 590 Td (${overview.activeResourceCount}) Tj ET`);
          currentOps.push("BT /F2 14 Tf 56 562 Td (Out of Service:) Tj ET");
          currentOps.push(`BT /F1 14 Tf 162 562 Td (${resources.length - overview.activeResourceCount}) Tj ET`);
          currentY = 520;
        } else {
          currentOps.push("BT /F2 18 Tf 40 735 Td (Smart Campus Resources Report) Tj ET");
          currentOps.push(`BT /F1 11 Tf 40 716 Td (${escapePdfText(`Generated at: ${generatedAt}`)}) Tj ET`);
          currentY = 680;
        }
      };

      const drawTableHeader = () => {
        const headerHeight = 28;
        let x = marginX;

        currentOps.push("0.94 0.94 0.94 rg");
        currentOps.push("0.78 0.78 0.78 RG");
        currentOps.push(`${marginX} ${currentY - headerHeight} ${contentWidth} ${headerHeight} re B`);
        currentOps.push("0 0 0 rg");

        tableColumns.forEach((column, index) => {
          if (index > 0) {
            currentOps.push(`${x} ${currentY - headerHeight} m ${x} ${currentY} l S`);
          }
          currentOps.push(
            `BT /F2 10 Tf ${x + 6} ${currentY - 18} Td (${escapePdfText(column.label)}) Tj ET`
          );
          x += column.width;
        });

        currentY -= headerHeight;
      };

      const pushCurrentPage = () => {
        pageContents.push(currentOps.join("\n"));
      };

      startPage(true);
      drawTableHeader();

      resources.forEach((resource) => {
        const rowHeight = 32;
        if (currentY - rowHeight < pageBottom) {
          pushCurrentPage();
          startPage(false);
          drawTableHeader();
        }

        const cells = [
          String(resource.id),
          truncatePdfText(resource.name, 20),
          truncatePdfText(resource.type, 10),
          String(resource.capacity),
          truncatePdfText(resource.location, 16),
          truncatePdfText(resource.status, 12),
          truncatePdfText(`${resource.availableFrom} - ${resource.availableTo}`, 24),
          truncatePdfText(resource.description, 20),
        ];

        let x = marginX;
        currentOps.push("1 1 1 rg");
        currentOps.push("0.78 0.78 0.78 RG");
        currentOps.push(`${marginX} ${currentY - rowHeight} ${contentWidth} ${rowHeight} re B`);
        currentOps.push("0 0 0 rg");

        cells.forEach((cell, index) => {
          if (index > 0) {
            currentOps.push(`${x} ${currentY - rowHeight} m ${x} ${currentY} l S`);
          }
          currentOps.push(
            `BT /F1 10 Tf ${x + 6} ${currentY - 20} Td (${escapePdfText(cell)}) Tj ET`
          );
          x += tableColumns[index].width;
        });

        currentY -= rowHeight;
      });

      pushCurrentPage();

      const pdfBytes = buildPdfDocument(pageContents);
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement("a");
      const dateStamp = new Date().toISOString().slice(0, 10);

      downloadLink.href = pdfUrl;
      downloadLink.download = `smart-campus-resources-${dateStamp}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      window.setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 1000);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Failed to generate PDF report.");
    } finally {
      setIsExportingResourcesPdf(false);
    }
  }

  return (
    <SiteFrame accent="sky">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <PageHero
          eyebrow="Admin Command Center"
          title="Full campus operations and user access are now manageable from one place."
          description="This dashboard is separate from the regular user view and gives admins direct control over user roles, service queues, and platform activity."
          actions={
            <>
              <button
                type="button"
                onClick={() => void loadAdminData()}
                className="rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Refresh Admin Data
              </button>
              <Link
                href="/Component/notifications"
                className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Open Notifications
              </Link>
            </>
          }
          aside={
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-sky-200">Admin Visibility</p>
              <p className="text-3xl font-semibold">{users.length}</p>
              <p className="text-sm text-slate-200">Registered users currently in the system</p>
              <div className="h-px bg-white/20" />
              <p className="text-sm text-slate-200">{message}</p>
              {lastUpdatedAt ? <p className="text-xs uppercase tracking-[0.24em] text-sky-200">Last synced {lastUpdatedAt}</p> : null}
              {error ? <p className="text-sm text-rose-200">{error}</p> : null}
            </div>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricTile
            label="Total Users"
            value={String(users.length)}
            detail="All accounts currently available in the platform"
          />
          <MetricTile
            label="Admins"
            value={String(overview.adminCount)}
            detail="Users with full dashboard and management access"
          />
          <MetricTile
            label="Technicians"
            value={String(overview.technicianCount)}
            detail="Support team members available for assignments"
          />
          <MetricTile
            label="Online Users"
            value={String(overview.onlineCount)}
            detail="Users active within the last 2 minutes"
          />
          <MetricTile
            label="Active Resources"
            value={String(overview.activeResourceCount)}
            detail="Resources currently available to campus users"
          />
          <MetricTile
            label="Pending Bookings"
            value={String(overview.pendingBookingCount)}
            detail="Resource bookings awaiting admin approval"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Panel
            eyebrow="Resource Form"
            title="Register a campus resource"
            description="Create and manage resource availability directly from the admin dashboard."
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
                    setResourceForm((current) => ({ ...current, capacity: sanitizeCapacityInput(value) }))
                  }
                  placeholder="40"
                  type="number"
                  value={resourceForm.capacity}
                />
              </div>

              <Field
                label="Location"
                onChange={(value) => setResourceForm((current) => ({ ...current, location: value }))}
                placeholder="Block A"
                value={resourceForm.location}
              />

              <TextAreaField
                label="Description"
                onChange={(value) => setResourceForm((current) => ({ ...current, description: value }))}
                placeholder="Main programming lab"
                value={resourceForm.description}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Available From"
                  onChange={(value) => setResourceForm((current) => ({ ...current, availableFrom: value }))}
                  max={resourceForm.availableTo}
                  type="time"
                  value={resourceForm.availableFrom}
                />
                <Field
                  label="Available To"
                  onChange={(value) => setResourceForm((current) => ({ ...current, availableTo: value }))}
                  min={resourceForm.availableFrom}
                  type="time"
                  value={resourceForm.availableTo}
                />
              </div>

              <SelectField
                label="Status"
                onChange={(value) => setResourceForm((current) => ({ ...current, status: value }))}
                options={resourceStatuses}
                value={resourceForm.status}
              />

              <button
                className="mt-2 rounded-full bg-[linear-gradient(135deg,#d97706,#b45309)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105"
                type="submit"
              >
                Save Resource
              </button>
            </form>
          </Panel>

          <Panel
            eyebrow="Resources"
            title="Resource management"
            description="Update status or remove resources without leaving the dashboard."
          >
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isExportingResourcesPdf || resources.length === 0}
                  onClick={exportResourcesPdf}
                  type="button"
                >
                  {isExportingResourcesPdf ? "Preparing PDF..." : "Export Resources PDF"}
                </button>
              </div>
              {resources.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-stone-200 px-6 py-8 text-center text-sm text-stone-500">
                  No resources yet. Create one from the form on this page.
                </div>
              ) : (
                resources.map((resource) => (
                  <article
                    key={resource.id}
                    className="rounded-3xl border border-stone-200 bg-stone-50 p-5 shadow-sm"
                  >
                    {editingResourceId === resource.id ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-xl font-semibold text-stone-950">Edit Resource</h3>
                          <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-800">
                            {resourceEdits[resource.id]?.status ?? resource.status}
                          </span>
                        </div>

                        <Field
                          label="Resource Name"
                          onChange={(value) =>
                            setResourceEdits((current) => ({
                              ...current,
                              [resource.id]: { ...current[resource.id], name: value },
                            }))
                          }
                          value={resourceEdits[resource.id]?.name ?? resource.name}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <SelectField
                            label="Type"
                            onChange={(value) =>
                              setResourceEdits((current) => ({
                                ...current,
                                [resource.id]: { ...current[resource.id], type: value },
                              }))
                            }
                            options={resourceTypes}
                            value={resourceEdits[resource.id]?.type ?? resource.type}
                          />
                          <Field
                            label="Capacity"
                            onChange={(value) =>
                              setResourceEdits((current) => ({
                                ...current,
                                [resource.id]: { ...current[resource.id], capacity: sanitizeCapacityInput(value) },
                              }))
                            }
                            type="number"
                            value={resourceEdits[resource.id]?.capacity ?? String(resource.capacity)}
                          />
                        </div>

                        <Field
                          label="Location"
                          onChange={(value) =>
                            setResourceEdits((current) => ({
                              ...current,
                              [resource.id]: { ...current[resource.id], location: value },
                            }))
                          }
                          value={resourceEdits[resource.id]?.location ?? resource.location}
                        />

                        <TextAreaField
                          label="Description"
                          onChange={(value) =>
                            setResourceEdits((current) => ({
                              ...current,
                              [resource.id]: { ...current[resource.id], description: value },
                            }))
                          }
                          value={resourceEdits[resource.id]?.description ?? resource.description}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <Field
                            label="Available From"
                            onChange={(value) =>
                              setResourceEdits((current) => ({
                                ...current,
                                [resource.id]: { ...current[resource.id], availableFrom: value },
                              }))
                            }
                            max={resourceEdits[resource.id]?.availableTo ?? resource.availableTo}
                            type="time"
                            value={resourceEdits[resource.id]?.availableFrom ?? resource.availableFrom}
                          />
                          <Field
                            label="Available To"
                            onChange={(value) =>
                              setResourceEdits((current) => ({
                                ...current,
                                [resource.id]: { ...current[resource.id], availableTo: value },
                              }))
                            }
                            min={resourceEdits[resource.id]?.availableFrom ?? resource.availableFrom}
                            type="time"
                            value={resourceEdits[resource.id]?.availableTo ?? resource.availableTo}
                          />
                        </div>

                        <SelectField
                          label="Status"
                          onChange={(value) =>
                            setResourceEdits((current) => ({
                              ...current,
                              [resource.id]: { ...current[resource.id], status: value },
                            }))
                          }
                          options={resourceStatuses}
                          value={resourceEdits[resource.id]?.status ?? resource.status}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold text-stone-950">{resource.name}</h3>
                            <p className="mt-2 text-sm leading-6 text-stone-600">{resource.description}</p>
                          </div>
                          <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-800">
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
                      </>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      {editingResourceId === resource.id ? (
                        <>
                          <button
                            className="rounded-full bg-[linear-gradient(135deg,#d97706,#b45309)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={activeResourceAction === resource.id}
                            onClick={() => void saveResource(resource.id)}
                            type="button"
                          >
                            Save
                          </button>
                          <button
                            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={activeResourceAction === resource.id}
                            onClick={() => {
                              setResourceEdits((current) => ({
                                ...current,
                                [resource.id]: mapResourceToForm(resource),
                              }));
                              setEditingResourceId(null);
                            }}
                            type="button"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={activeResourceAction === resource.id}
                          onClick={() => {
                            setResourceEdits((current) => ({
                              ...current,
                              [resource.id]: mapResourceToForm(resource),
                            }));
                            setEditingResourceId(resource.id);
                          }}
                          type="button"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        className="rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={activeResourceAction === resource.id || editingResourceId === resource.id}
                        onClick={() => void updateResourceStatus(resource.id, "ACTIVE")}
                        type="button"
                      >
                        Set Active
                      </button>
                      <button
                        className="rounded-full bg-stone-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-600 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={activeResourceAction === resource.id || editingResourceId === resource.id}
                        onClick={() => void updateResourceStatus(resource.id, "OUT_OF_SERVICE")}
                        type="button"
                      >
                        Set Out of Service
                      </button>
                      <button
                        className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={activeResourceAction === resource.id || editingResourceId === resource.id}
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

        <section className="grid gap-6">
          <Panel
            eyebrow="Booking Approvals"
            title="Manage resource booking requests"
            description="Review and approve or reject pending booking requests from users."
          >
            <div className="space-y-4">
              {bookings.filter((b) => b.status === "PENDING").length === 0 ? (
                <div className="rounded-3xl border border-dashed border-stone-200 px-6 py-8 text-center text-sm text-stone-500">
                  No pending bookings. All requests have been reviewed.
                </div>
              ) : (
                bookings
                  .filter((booking) => booking.status === "PENDING")
                  .map((booking) => (
                    <article
                      key={booking.id}
                      className="rounded-3xl border border-stone-200 bg-stone-50 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold text-stone-950">
                            {booking.resourceName || "Resource Booking"}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            {booking.purpose}
                          </p>
                        </div>
                        <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-800">
                          PENDING
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 text-sm text-stone-600">
                        <p>Requested by: {booking.createdByFullName || booking.createdBy}</p>
                        <p>Email: {booking.createdBy}</p>
                        <p>Date: {booking.date}</p>
                        <p>Time: {booking.startTime} - {booking.endTime}</p>
                        <p>Expected Attendees: {booking.expectedAttendees}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={activeBookingAction === booking.id}
                          onClick={() => openApproveModal(booking.id)}
                          type="button"
                        >
                          Approve
                        </button>
                        <button
                          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={activeBookingAction === booking.id}
                          onClick={() => openRejectModal(booking.id)}
                          type="button"
                        >
                          Reject
                        </button>
                      </div>
                    </article>
                  ))
              )}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6">
          <Panel
            eyebrow="Booking Overview"
            title="All approved and rejected bookings"
            description="View all processed bookings and manage them as needed."
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bookings.filter((b) => b.status === "APPROVED" || b.status === "REJECTED" || b.status === "CANCELLED").length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3">
                  <div className="rounded-3xl border border-dashed border-stone-200 px-6 py-8 text-center text-sm text-stone-500">
                    No approved, rejected, or cancelled bookings yet.
                  </div>
                </div>
              ) : (
                bookings
                  .filter((booking) => booking.status === "APPROVED" || booking.status === "REJECTED" || booking.status === "CANCELLED")
                  .map((booking) => (
                    <article
                      key={booking.id}
                      className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-stone-300 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-stone-950 group-hover:text-stone-900">
                            {booking.resourceName || "Resource Booking"}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                            {booking.purpose}
                          </p>
                        </div>
                        <span className={`ml-3 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${
                          booking.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : booking.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-stone-200 text-stone-700"
                        }`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-stone-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">By:</span>
                          <span className="truncate">{booking.createdByFullName || booking.createdBy}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{booking.expectedAttendees} attendees</span>
                        </div>
                      </div>

                      {booking.rejectionReason ? (
                        <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">
                          <p className="font-medium">Rejection:</p>
                          <p className="line-clamp-2">{booking.rejectionReason}</p>
                        </div>
                      ) : null}

                      {booking.status !== "CANCELLED" ? (
                        <div className="mt-4 flex justify-end">
                          <button
                            className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={activeBookingAction === booking.id}
                            onClick={() => void cancelBookingFromAdmin(booking.id)}
                            type="button"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </button>
                        </div>
                      ) : null}
                    </article>
                  ))
              )}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6">
          <GlassPanel>
            <div className="rounded-3xl border border-stone-200 bg-stone-50/80 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Create Access</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-stone-950">
                    Add admin or technician account
                  </h2>
                  <p className="mt-2 text-sm text-stone-600">
                    Pre-create a Google account here so the technician can use Continue with Google and land in the technician dashboard.
                  </p>
                </div>
              </div>

              <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={createUser}>
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Full Name
                  <input
                    value={newUserFullName}
                    onChange={(event) => setNewUserFullName(event.target.value)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Email
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(event) => setNewUserEmail(event.target.value)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Phone Number
                  <input
                    value={newUserPhoneNumber}
                    onChange={(event) => setNewUserPhoneNumber(event.target.value)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Department
                  <input
                    value={newUserDepartment}
                    onChange={(event) => setNewUserDepartment(event.target.value)}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Role
                  <select
                    value={newUserRole}
                    onChange={(event) => setNewUserRole(normalizeRole(event.target.value))}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  >
                    {userRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  Sign-in Provider
                  <select
                    value={newUserProvider}
                    onChange={(event) => setNewUserProvider(event.target.value as "LOCAL" | "GOOGLE")}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="GOOGLE">GOOGLE</option>
                    <option value="LOCAL">LOCAL</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-700 md:col-span-2 xl:col-span-1">
                  Password
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(event) => setNewUserPassword(event.target.value)}
                    placeholder={newUserProvider === "GOOGLE" ? "Optional for Google accounts" : "Required for local accounts"}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-700 md:col-span-2 xl:col-span-1">
                  Confirm Password
                  <input
                    type="password"
                    value={newUserConfirmPassword}
                    onChange={(event) => setNewUserConfirmPassword(event.target.value)}
                    placeholder={newUserProvider === "GOOGLE" ? "Optional for Google accounts" : "Required for local accounts"}
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                </label>

                <div className="flex items-end md:col-span-2 xl:col-span-3">
                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="rounded-full bg-[linear-gradient(135deg,#EE9B13,#D78A0F)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {creatingUser ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">User Management</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-stone-950">
                  Registered users list
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  Search, review, update roles, or remove registered accounts from one clean table.
                </p>
              </div>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                Search users
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Name, email, role, department"
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 sm:w-80"
                />
              </label>
            </div>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200">
              <table className="min-w-full divide-y divide-stone-200 text-sm">
                <thead className="bg-stone-100/80">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-stone-700">User</th>
                    <th className="px-4 py-3 text-left font-semibold text-stone-700">Department</th>
                    <th className="px-4 py-3 text-left font-semibold text-stone-700">Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-stone-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-stone-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 align-top">
                        <p className="font-semibold text-stone-900">{user.fullName}</p>
                        <p className="text-xs text-stone-500">{user.email}</p>
                        <p className="text-xs text-stone-400">{user.provider || "LOCAL"}</p>
                      </td>
                      <td className="px-4 py-3 text-stone-700">{user.department || "General"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={roleEdits[user.id] || user.role}
                          onChange={(event) =>
                            setRoleEdits((current) => ({
                              ...current,
                              [user.id]: normalizeRole(event.target.value),
                            }))
                          }
                          className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        >
                          {userRoles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={activeUserAction === user.id || roleEdits[user.id] === user.role}
                            onClick={() => void updateUserRole(user.id)}
                            className="rounded-full bg-[linear-gradient(135deg,#d97706,#b45309)] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Save Role
                          </button>
                          <button
                            type="button"
                            disabled={activeUserAction === user.id || !currentAdminEmail}
                            onClick={() =>
                              void (
                                user.status?.toUpperCase() === "DEACTIVATED"
                                  ? activateUser(user.id)
                                  : deactivateUser(user.id)
                              )
                            }
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${user.status?.toUpperCase() === "DEACTIVATED" ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"}`}
                          >
                            {user.status?.toUpperCase() === "DEACTIVATED" ? "Activate" : "Deactivate"}
                          </button>
                          <button
                            type="button"
                            disabled={activeUserAction === user.id}
                            onClick={() => void deleteUser(user.id)}
                            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex w-fit rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${user.online ? "bg-orange-100 text-orange-800" : "bg-stone-100 text-stone-500"}`}>
                            {user.online ? "Online" : "Offline"}
                          </span>
                          <span className={`inline-flex w-fit rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${user.status?.toUpperCase() === "DEACTIVATED" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {user.status?.toUpperCase() === "DEACTIVATED" ? "Deactivated" : "Active"}
                          </span>
                          <p className="text-xs text-stone-500">
                            Last login: {formatUtcTimestamp(user.lastLoginAt)}
                          </p>
                          <p className="text-xs text-stone-500">
                            Last seen: {formatUtcTimestamp(user.lastSeenAt)}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && filteredUsers.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-stone-500">
                  No registered users match your search.
                </div>
              ) : null}
            </div>
          </GlassPanel>
        </section>

        {isApproveModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="mb-2 text-2xl font-bold text-stone-950">Confirm Approval</h2>
              <p className="mb-4 text-sm text-stone-600">
                Are you sure you want to approve booking #{approvingBookingId}?
              </p>

              {error && !error.includes("Admin email") ? (
                <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="mt-6 flex gap-3">
                <button
                  className="flex-1 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={activeBookingAction === approvingBookingId}
                  onClick={() => void submitApproveBooking()}
                >
                  {activeBookingAction === approvingBookingId ? "Approving..." : "Approve"}
                </button>
                <button
                  className="flex-1 rounded-full bg-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={activeBookingAction === approvingBookingId}
                  onClick={closeApproveModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isRejectModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="mb-2 text-2xl font-bold text-stone-950">Reject Booking</h2>
              <p className="mb-4 text-sm text-stone-600">
                Booking #{rejectingBookingId} - Please provide a reason for rejection
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700">
                  Rejection Reason
                  <textarea
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    rows={4}
                    placeholder="Explain why this booking is being rejected..."
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                  />
                </label>
              </div>

              {error && !error.includes("Admin email") ? (
                <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="mt-6 flex gap-3">
                <button
                  className="flex-1 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                  type="button"
                  onClick={() => void submitRejectBooking()}
                >
                  Reject Booking
                </button>
                <button
                  className="flex-1 rounded-full bg-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
                  type="button"
                  onClick={closeRejectModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </SiteFrame>
  );
}
