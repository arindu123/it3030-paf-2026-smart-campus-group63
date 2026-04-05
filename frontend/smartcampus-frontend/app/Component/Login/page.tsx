"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "../Home/Nav";
import Footer from "../Home/Footer";

const API_BASE_URL = "http://localhost:8081/api";

type LoginResult = {
  success: boolean;
  message: string;
  email?: string;
  fullName?: string;
  role?: "USER" | "ADMIN" | "TECHNICIAN";
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  function getDashboardByRole(role?: "USER" | "ADMIN" | "TECHNICIAN") {
    if (role === "ADMIN") {
      return "/Component/dashboard/admin";
    }

    if (role === "TECHNICIAN") {
      return "/Component/dashboard/technician";
    }

    return "/Component/dashboard/user";
  }

  useEffect(() => {
    const oauthStatus = searchParams.get("oauth");

    if (oauthStatus === "success") {
      const oauthEmail = searchParams.get("email") || "";
      const oauthFullName = searchParams.get("fullName") || "";
      const oauthRole = (searchParams.get("role") as "USER" | "ADMIN" | "TECHNICIAN" | null) || "USER";

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
          role: data.role || "USER",
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
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Nav />
      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900">Login</h1>
          <p className="mt-2 text-sm text-gray-600">Login using your email and password.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Remember me
              </label>
              <Link href="#" className="text-blue-600 hover:underline">
                Forgot Password
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <a
            href="http://localhost:8081/oauth2/authorization/google"
            className="mt-3 block w-full rounded-lg border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Continue with Google
          </a>

          {message ? (
            <p className={`mt-4 text-sm ${isError ? "text-red-600" : "text-green-600"}`}>{message}</p>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}
