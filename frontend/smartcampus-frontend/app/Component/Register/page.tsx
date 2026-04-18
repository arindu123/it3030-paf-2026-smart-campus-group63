"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, GITHUB_AUTH_URL, GOOGLE_AUTH_URL } from "../shared/campusApi";
import { Eyebrow, GlassPanel, SiteFrame } from "../shared/SiteFrame";

type ApiResponse = {
  success: boolean;
  message: string;
};

export default function RegisterFormPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    if (password.length < 6) {
      setIsError(true);
      setMessage("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Confirm password does not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword,
          phoneNumber,
          role: "USER",
          department,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        setIsError(true);
        setMessage(data.message || "Registration failed");
        return;
      }

      router.push("/Component/Login");
    } catch {
      setIsError(true);
      setMessage("Backend connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteFrame accent="mint">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <GlassPanel className="p-7 sm:p-8">
          <Eyebrow>Register</Eyebrow>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-4xl">
            Create your UniDesk account
          </h1>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Set up your user profile once, then move straight into resources, bookings, and support.
          </p>

          <a
            href={GOOGLE_AUTH_URL}
            className="mt-6 flex items-center justify-center gap-3 rounded-full border border-stone-200 bg-white px-5 py-3 text-center font-semibold text-stone-700 transition hover:bg-stone-50"
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

          <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-semibold text-stone-700 md:col-span-2">
              Full Name
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-stone-700 md:col-span-2">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-stone-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-stone-700">
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-stone-700">
              Phone Number
              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-stone-700">
              Department
              <input
                type="text"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 rounded-full bg-[linear-gradient(135deg,#EE9B13,#D78A0F)] px-5 py-3 font-semibold text-white shadow-lg shadow-orange-900/15 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          {message ? (
            <p className={`mt-4 text-sm ${isError ? "text-red-600" : "text-orange-600"}`}>{message}</p>
          ) : null}
        </GlassPanel>

        <GlassPanel className="bg-[linear-gradient(160deg,rgba(10,43,107,0.98),rgba(14,58,130,0.94))] text-slate-50">
          <Eyebrow>Account Benefits</Eyebrow>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            One account for the entire campus flow.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-200">
            Once registered, users can browse resources, submit issues, receive updates, and move
            into the correct dashboard experience automatically.
          </p>

          <div className="mt-10 grid gap-4">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-orange-300">Access</p>
              <p className="mt-3 text-lg font-semibold">Instant route into the correct role workflow</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-orange-300">Convenience</p>
              <p className="mt-3 text-lg font-semibold">Simple onboarding with email fields or Google sign-in</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-orange-300">Clarity</p>
              <p className="mt-3 text-lg font-semibold">A cleaner visual language across all operational pages</p>
            </div>
          </div>
        </GlassPanel>
      </div>
    </SiteFrame>
  );
}
