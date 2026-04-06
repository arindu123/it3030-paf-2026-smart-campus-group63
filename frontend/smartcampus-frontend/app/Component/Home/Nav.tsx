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

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/Component/resources", label: "Resources" },
    { href: "/Component/bookings", label: "Bookings" },
    { href: "/Component/Ticket", label: "Tickets" },
    { href: "/Component/notifications", label: "Updates" },
  ];

  function logout() {
    window.localStorage.removeItem("smartcampusUser");
    setUser(null);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-10">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[1.75rem] border border-white/60 bg-white/72 px-5 py-4 shadow-[0_18px_50px_rgba(42,31,17,0.12)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#179157,#0f4a2d)] text-lg font-semibold text-white shadow-lg shadow-emerald-900/25">
                SC
              </span>
              <div>
                <p className="text-lg font-semibold tracking-[-0.03em] text-stone-950">
                  Smart Campus
                </p>
                <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                  Operations Suite
                </p>
              </div>
            </div>
          </Link>

          {user ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800 lg:hidden">
              {user.role || "USER"}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-stone-600">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 transition ${
                  isActive
                    ? "border border-amber-200 bg-amber-100 text-amber-950 shadow-sm"
                    : "hover:bg-stone-100 hover:text-stone-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user ? (
            <>
              <div className="hidden rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-right lg:block">
                <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Signed in</p>
                <p className="text-sm font-semibold text-stone-900">
                  {user.fullName || user.email}
                </p>
              </div>
              <Link
                href="/Component/profile"
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="rounded-full bg-[linear-gradient(135deg,#d97706,#b45309)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-900/25 transition hover:brightness-105"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/Component/Login"
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
              >
                Login
              </Link>
              <Link
                href="/Component/Register"
                className="rounded-full border border-amber-200 bg-amber-100 px-5 py-2 text-sm font-semibold text-amber-950 shadow-sm transition hover:bg-amber-200"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
