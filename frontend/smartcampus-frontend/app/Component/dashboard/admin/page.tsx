"use client";

import Nav from "../../Home/Nav";
import Footer from "../../Home/Footer";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      <Nav />
      <main className="flex-1 px-6 py-10">
        <section className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-3 text-gray-600">Review and approve booking and operational requests.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
