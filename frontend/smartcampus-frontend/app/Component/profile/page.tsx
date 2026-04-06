"use client";

import { useState } from "react";
import {
  GlassPanel,
  MetricTile,
  PageHero,
  SectionHeading,
  SiteFrame,
} from "../shared/SiteFrame";

type StoredUser = {
  email: string;
  fullName?: string;
  role?: "USER" | "ADMIN" | "TECHNICIAN";
};

export default function ProfilePage() {
  const [user] = useState<StoredUser | null>(() => {
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
  });

  return (
    <SiteFrame accent="amber">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <PageHero
          eyebrow="Profile"
          title={user ? `${user.fullName || "Campus User"} profile overview` : "Profile overview"}
          description="This page now gives signed-in users a clearer, more intentional place to review their account information and role context."
          aside={
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-green-200">Role</p>
                <p className="mt-3 text-3xl font-semibold">{user?.role || "Guest"}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-green-200">Account State</p>
                <p className="mt-3 text-lg font-semibold">
                  {user ? "Signed in and ready" : "No active local session"}
                </p>
              </div>
            </div>
          }
        />

        <section className="grid gap-4 md:grid-cols-3">
          <MetricTile label="Identity" value={user?.fullName || "N/A"} detail="Display name stored in the local session." />
          <MetricTile label="Email" value={user?.email || "Not found"} detail="Primary account identifier used for sign-in." />
          <MetricTile label="Role" value={user?.role || "USER"} detail="Determines which dashboard users reach after login." />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel>
            <SectionHeading
              eyebrow="Account Details"
              title="Everything important in one focused card."
              description="Even a simple profile page should help users understand who they are signed in as and what part of the system they can access."
            />
          </GlassPanel>

          <GlassPanel>
            {user ? (
              <div className="grid gap-4">
                {[
                  ["Full Name", user.fullName || "N/A"],
                  ["Email", user.email],
                  ["Role", user.role || "USER"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.5rem] border border-stone-900/10 bg-white/75 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-stone-500">{label}</p>
                    <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-stone-950">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white/65 p-8 text-sm leading-7 text-stone-600">
                No logged-in user was found in local storage. Use the login page to start a session.
              </div>
            )}
          </GlassPanel>
        </section>
      </div>
    </SiteFrame>
  );
}
