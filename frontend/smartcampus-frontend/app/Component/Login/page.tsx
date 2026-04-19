"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL, GITHUB_AUTH_URL, GOOGLE_AUTH_URL } from "../shared/campusApi";
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
      setMessage(searchParams.get("message") || "OAuth login failed");
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
        <GlassPanel className="bg-[linear-gradient(160deg,rgba(10,43,107,0.98),rgba(14,58,130,0.94))] text-slate-50">
          <Eyebrow>Welcome Back</Eyebrow>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Sign in to your UniDesk workspace.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-200">
            Access operational dashboards, resource tools, and ticket management with a cleaner,
            role-aware entry point.
          </p>

          <div className="mt-10 grid gap-4">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-orange-600">Accounts</p>
              <p className="mt-3 text-lg font-semibold">Students, admins, and technicians</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-orange-600">Access Flow</p>
              <p className="mt-3 text-lg font-semibold">Email login, Google, or GitHub from one screen</p>
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
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
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
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
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
              <Link href="/Component/Register" className="font-semibold text-orange-600 hover:text-orange-800">
                Need an account?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[linear-gradient(135deg,#EE9B13,#D78A0F)] px-5 py-3 font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <a
            href={GOOGLE_AUTH_URL}
            className="mt-4 flex items-center justify-center gap-3 rounded-full border border-stone-200 bg-white px-5 py-3 text-center font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.16 3.56-8.65z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.88-3c-1.08.72-2.46 1.15-4.05 1.15-3.11 0-5.75-2.1-6.7-4.93H1.29v3.1A12 12 0 0 0 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.31A7.2 7.2 0 0 1 4.93 12c0-.8.14-1.57.37-2.31v-3.1H1.29A12 12 0 0 0 0 12c0 1.93.46 3.76 1.29 5.41l4.01-3.1z"
              />
              <path
                fill="#EA4335"
                d="M12 4.77c1.76 0 3.33.61 4.57 1.8l3.42-3.42C17.95 1.28 15.24 0 12 0A12 12 0 0 0 1.29 6.59l4.01 3.1c.95-2.83 3.59-4.92 6.7-4.92z"
              />
            </svg>
            <span>Continue with Google</span>
          </a>

          <a
            href={GITHUB_AUTH_URL}
            className="mt-3 flex items-center justify-center gap-3 rounded-full border border-stone-200 bg-white px-5 py-3 text-center font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="#181717">
              <path d="M12 .5C5.73.5.75 5.56.75 11.82c0 5.02 3.24 9.29 7.73 10.8.57.11.78-.25.78-.55 0-.27-.01-.98-.02-1.92-3.14.69-3.8-1.52-3.8-1.52-.51-1.33-1.24-1.68-1.24-1.68-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.18 1.73 1.18 1 .1 1.58.79 1.58.79.99 1.73 2.59 1.23 3.22.94.1-.74.39-1.23.71-1.51-2.5-.29-5.12-1.28-5.12-5.71 0-1.26.44-2.29 1.17-3.1-.12-.29-.51-1.46.11-3.04 0 0 .95-.31 3.12 1.18a10.7 10.7 0 0 1 5.68 0c2.17-1.49 3.12-1.18 3.12-1.18.62 1.58.23 2.75.11 3.04.73.81 1.17 1.84 1.17 3.1 0 4.44-2.63 5.42-5.14 5.7.4.35.75 1.03.75 2.08 0 1.5-.01 2.72-.01 3.09 0 .3.2.67.79.55 4.48-1.51 7.71-5.78 7.71-10.79C23.25 5.56 18.27.5 12 .5z" />
            </svg>
            <span>Continue with GitHub</span>
          </a>

          {message ? (
            <p className={`mt-4 text-sm ${isError ? "text-red-600" : "text-orange-600"}`}>{message}</p>
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
