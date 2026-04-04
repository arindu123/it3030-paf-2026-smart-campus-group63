"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type StoredUser = {
  email: string;
  fullName?: string;
  role?: "USER" | "ADMIN" | "TECHNICIAN";
};

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(() => {
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

  function logout() {
    window.localStorage.removeItem("smartcampusUser");
    setUser(null);
    router.push("/");
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/Component/resources", label: "Resources" },
    { href: "/Component/bookings", label: "Bookings" },
    { href: "/Component/Ticket", label: "Tickets" },
  ];

  return (
    <nav className="flex items-center justify-between px-10 py-4 bg-white shadow sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold text-blue-600">
        Smart Campus
      </Link>

      <div className="hidden md:flex space-x-6 font-medium">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`transition ${
                isActive ? "text-blue-600" : "hover:text-blue-600"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="space-x-3">
        {user ? (
          <>
            <Link href="/Component/profile">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition">
                Profile
              </button>
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/Component/Login">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition">
                Login
              </button>
            </Link>
            <Link href="/Component/Register">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Register
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
