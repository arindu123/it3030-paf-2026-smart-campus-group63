"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../shared/campusApi";
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
            Create your Smart Campus account
          </h1>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Set up your user profile once, then move straight into resources, bookings, and support.
          </p>

          <a
            href="http://localhost:8081/oauth2/authorization/google"
            className="mt-6 block rounded-full border border-stone-200 bg-white px-5 py-3 text-center font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Continue with Google
          </a>

          <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-semibold text-stone-700 md:col-span-2">
              Full Name
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-stone-700 md:col-span-2">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-stone-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-stone-700">
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-stone-700">
              Phone Number
              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-stone-700">
              Department
              <input
                type="text"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 rounded-full bg-[linear-gradient(135deg,#d97706,#b45309)] px-5 py-3 font-semibold text-white shadow-lg shadow-amber-900/15 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          {message ? (
            <p className={`mt-4 text-sm ${isError ? "text-red-600" : "text-emerald-700"}`}>{message}</p>
          ) : null}
        </GlassPanel>

        <GlassPanel className="bg-[linear-gradient(160deg,rgba(10,35,32,0.96),rgba(24,94,73,0.92))] text-slate-50">
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
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-200">Access</p>
              <p className="mt-3 text-lg font-semibold">Instant route into the correct role workflow</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-200">Convenience</p>
              <p className="mt-3 text-lg font-semibold">Simple onboarding with email fields or Google sign-in</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-200">Clarity</p>
              <p className="mt-3 text-lg font-semibold">A cleaner visual language across all operational pages</p>
            </div>
          </div>
        </GlassPanel>
      </div>
    </SiteFrame>
  );
}
