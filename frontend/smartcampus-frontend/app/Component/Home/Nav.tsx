"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type StoredUser = {
  email: string;
  fullName?: string;
  role?: "USER" | "ADMIN" | "TECHNICIAN";
};

export default function Nav() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("smartcampusUser");
    if (!raw) {
      setUser(null);
      return;
    }

    try {
      setUser(JSON.parse(raw) as StoredUser);
    } catch {
      window.localStorage.removeItem("smartcampusUser");
      setUser(null);
    }
  }, []);

  function logout() {
    window.localStorage.removeItem("smartcampusUser");
    setUser(null);
    router.push("/");
  }

  return (
    <nav className="flex items-center justify-between px-10 py-4 bg-white shadow sticky top-0 z-50">
      
      {/* Logo */}
      <h1 className="text-xl font-bold text-blue-600">
        Smart Campus
      </h1>

      {/* Links */}
      <div className="hidden md:flex space-x-6 font-medium">
        <Link href="/" className="hover:text-blue-600 transition">Home</Link>
        <Link href="/Component/resources" className="hover:text-blue-600 transition">Resources</Link>
        <Link href="/Component/bookings" className="hover:text-blue-600 transition">Bookings</Link>
        <Link href="/Component/Ticket" className="hover:text-blue-600 transition">Tickets</Link>
      </div>

      {/* Actions */}
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