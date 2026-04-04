"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "../Home/Nav";
import Footer from "../Home/Footer";

const API_BASE_URL = "http://localhost:8081/api";

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
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Nav />
      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <section className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900">Register</h1>
          <p className="mt-2 text-sm text-gray-600">Create your Smart Campus account.</p>

          <a
            href="http://localhost:8081/oauth2/authorization/google"
            className="mt-4 block w-full rounded-lg border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Continue with Google
          </a>

          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
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

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="phoneNumber">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="department">
                Department
              </label>
              <input
                id="department"
                type="text"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </div>
          </form>

          {message ? (
            <p className={`mt-4 text-sm ${isError ? "text-red-600" : "text-green-600"}`}>{message}</p>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}
