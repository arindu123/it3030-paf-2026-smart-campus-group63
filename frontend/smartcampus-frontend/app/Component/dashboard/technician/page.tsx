"use client";

import { RoleDashboard } from "../../shared/RoleDashboard";

export default function TechnicianDashboardPage() {
  return (
    <RoleDashboard
      accent="mint"
      eyebrow="Technician Dashboard"
      title="Stay focused on assigned tickets, progress updates, and resolution work."
      description="This technician view is now designed to highlight execution and issue flow instead of just showing a basic page heading."
      ctaHref="/Component/Ticket"
      ctaLabel="Open Ticket Desk"
      metrics={[
        { label: "Assigned Work", value: "Actionable", detail: "Technicians need to understand priorities quickly and clearly." },
        { label: "Progress", value: "Trackable", detail: "Status movement and resolution notes should feel natural to update." },
        { label: "Queue", value: "Focused", detail: "The layout leaves room for assigned tickets and service context." },
      ]}
      priorities={[
        "Check newly assigned issues",
        "Update ticket status and add resolution notes",
        "Keep service turnaround visible to the wider system",
      ]}
    />
  );
}
