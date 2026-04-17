"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL, GOOGLE_AUTH_URL } from "../shared/campusApi";
import { Eyebrow, GlassPanel, SiteFrame } from "../shared/SiteFrame";

type LoginResult = {
  success: boolean;
  message: string;
  email?: string;
  fullName?: string;
  role?: string;
};

function normalizeRole(role?: string | null): "USER" | "ADMIN" | "TECHNICIAN" {
  const value = (role || "").toUpperCase();

  if (value === "ADMIN" || value === "TECHNICIAN") {
    return value;
  }

  return "USER";
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  function getDashboardByRole(role?: string | null) {
    const normalizedRole = normalizeRole(role);

    if (normalizedRole === "ADMIN") {
      return "/Component/dashboard/admin";
    }

    if (normalizedRole === "TECHNICIAN") {
      return "/Component/dashboard/technician";
    }

    return "/Component/dashboard/user";
  }

  useEffect(() => {
    const oauthStatus = searchParams.get("oauth");

    if (oauthStatus === "success") {
      const oauthEmail = searchParams.get("email") || "";
      const oauthFullName = searchParams.get("fullName") || "";
      const oauthRole = normalizeRole(searchParams.get("role"));

      window.localStorage.setItem(
        "smartcampusUser",
        JSON.stringify({
          email: oauthEmail,
          fullName: oauthFullName,
          role: oauthRole,
          rememberMe: true,
        })
      );

      router.replace(getDashboardByRole(oauthRole));
      return;
    }

    if (oauthStatus === "error") {
      setIsError(true);
      setMessage(searchParams.get("message") || "Google login failed");
    }
  }, [router, searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as LoginResult;

      if (!response.ok || !data.success) {
        setIsError(true);
        setMessage(data.message || "Login failed");
        return;
      }

      window.localStorage.setItem(
        "smartcampusUser",
        JSON.stringify({
          email: data.email || email,
          fullName: data.fullName || "",
          role: normalizeRole(data.role),
          rememberMe,
        })
      );
      setMessage(data.message || "Login successful");
      router.push(getDashboardByRole(data.role));
    } catch {
      setIsError(true);
      setMessage("Backend connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteFrame accent="sky">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassPanel className="bg-[linear-gradient(160deg,rgba(12,40,26,0.96),rgba(26,103,61,0.92))] text-slate-50">
          <Eyebrow>Welcome Back</Eyebrow>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Sign in to your Smart Campus workspace.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-200">
            Access operational dashboards, resource tools, and ticket management with a cleaner,
            role-aware entry point.
          </p>

          <div className="mt-10 grid gap-4">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-green-200">Accounts</p>
              <p className="mt-3 text-lg font-semibold">Students, admins, and technicians</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-green-200">Access Flow</p>
              <p className="mt-3 text-lg font-semibold">Email login or Google sign-in from one screen</p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-7 sm:p-8">
          <Eyebrow>Login</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-stone-950">
            Continue to your dashboard
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Use your campus email and password to enter the system.
          </p>

          <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-semibold text-stone-700" htmlFor="email">
              Email
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-stone-700" htmlFor="password">
              Password
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                required
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-stone-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Remember me
              </label>
              <Link href="/Component/Register" className="font-semibold text-amber-700 hover:text-amber-900">
                Need an account?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[linear-gradient(135deg,#d97706,#b45309)] px-5 py-3 font-semibold text-white shadow-lg shadow-amber-900/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <a
            href={GOOGLE_AUTH_URL}
            className="mt-4 block rounded-full border border-stone-200 bg-white px-5 py-3 text-center font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Continue with Google
          </a>

          {message ? (
            <p className={`mt-4 text-sm ${isError ? "text-red-600" : "text-amber-700"}`}>{message}</p>
          ) : null}
        </GlassPanel>
      </div>
    </SiteFrame>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
