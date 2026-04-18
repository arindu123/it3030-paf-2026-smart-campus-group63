"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../shared/campusApi";

type StoredUser = {
  email: string;
  fullName?: string;
  role?: "USER" | "ADMIN" | "TECHNICIAN";
};

function getDashboardByRole(role?: "USER" | "ADMIN" | "TECHNICIAN") {
  if (role === "ADMIN") {
    return "/Component/dashboard/admin";
  }

  if (role === "TECHNICIAN") {
    return "/Component/dashboard/technician";
  }

  return "/Component/dashboard/user";
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const raw = window.localStorage.getItem("smartcampusUser");

      if (!raw) {
        return;
      }

      try {
        setUser(JSON.parse(raw) as StoredUser);
      } catch {
        window.localStorage.removeItem("smartcampusUser");
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    let aborted = false;
    const email = user.email;

    async function pingPresence() {
      if (aborted) {
        return;
      }

      try {
        await fetch(`${API_BASE_URL}/presence/heartbeat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
          keepalive: true,
        });
      } catch {
        // Best-effort presence updates only.
      }
    }

    void pingPresence();
    const intervalId = window.setInterval(() => {
      void pingPresence();
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void pingPresence();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      aborted = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.email]);

  const navItems = [
    ...(!user ? [{ href: "/", label: "Home" }] : []),
    ...(user ? [{ href: getDashboardByRole(user.role), label: "Dashboard" }] : []),
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
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="flex w-full flex-col gap-4 border-b border-white/60 bg-white/90 px-5 py-4 shadow-[0_18px_50px_rgba(42,31,17,0.12)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group ml-30">
            <Image
              src="/uni desk logo.png"
              alt="UniDesk logo"
              width={450}
              height={101}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          {user ? (
            <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-orange-800 lg:hidden">
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
                    ? "border border-orange-200 bg-orange-100 text-orange-900 shadow-sm"
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
                className="rounded-full bg-[linear-gradient(135deg,#EE9B13,#D78A0F)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-900/25 transition hover:brightness-105"
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
                className="rounded-full border border-orange-200 bg-orange-100 px-5 py-2 text-sm font-semibold text-orange-900 shadow-sm transition hover:bg-orange-200"
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
