"use client";

import { RoleDashboard } from "../../shared/RoleDashboard";

export default function AdminDashboardPage() {
  return (
    <RoleDashboard
      accent="sky"
      eyebrow="Admin Dashboard"
      title="See approvals, operational health, and service direction at a glance."
      description="The admin dashboard now has enough structure to grow into a real command surface instead of feeling like a placeholder."
      ctaHref="/Component/notifications"
      ctaLabel="Review Updates"
      metrics={[
        { label: "Oversight", value: "Central", detail: "Admins need one place to assess bookings, tickets, and system health." },
        { label: "Decisions", value: "Faster", detail: "Approvals and escalations deserve strong visibility and cleaner grouping." },
        { label: "Operations", value: "Readable", detail: "The new layout leaves room for metrics, queues, and alerts." },
      ]}
      priorities={[
        "Review pending approvals and operational changes",
        "Track backend and service reliability indicators",
        "Coordinate cross-team actions with clearer visibility",
      ]}
    />
  );
}
