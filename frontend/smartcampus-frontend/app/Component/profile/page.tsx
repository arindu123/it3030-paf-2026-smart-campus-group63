"use client";

import { useState } from "react";

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
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-6 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        {user ? (
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Full Name:</span> {user.fullName || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-semibold">Role:</span> {user.role || "USER"}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-600">No logged-in user found.</p>
        )}
      </section>
    </main>
  );
}
