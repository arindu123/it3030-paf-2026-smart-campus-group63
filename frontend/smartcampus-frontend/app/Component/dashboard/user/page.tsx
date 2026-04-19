"use client";

import { RoleDashboard } from "../../shared/RoleDashboard";

export default function UserDashboardPage() {
  return (
    <RoleDashboard
      accent="amber"
      eyebrow="User Dashboard"
      title="Manage your bookings, resources, and support requests with more clarity."
      description="The user dashboard now acts as a cleaner home base for students and staff who need quick access to spaces, requests, and notifications."
      ctaHref="/Component/resources"
      ctaLabel="Browse Resources"
      homeHeroStyle
      metrics={[
        { label: "Primary Goal", value: "Self-Service", detail: "Users should be able to find what they need without friction." },
        { label: "Path", value: "Resources First", detail: "Discover spaces, then move into bookings or issue reporting." },
        { label: "Support", value: "Visible", detail: "Ticket and notification pathways are easier to discover from here." },
      ]}
      priorities={[
        "Browse campus spaces and equipment",
        "Create or follow maintenance requests",
        "Check updates and approval outcomes",
      ]}
    />
  );
}
