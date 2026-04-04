"use client";

import Link from "next/link";
import Nav from "./Nav";
import Footer from "./Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">

      {/* 🔷 Navbar */}
      <Nav />

      {/* 🔷 Hero Section */}
      <section className="text-center py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <h2 className="text-4xl font-bold mb-4">
          Smart Campus Operations Hub
        </h2>
        <p className="text-lg mb-6">
          Manage bookings, facilities, and incident reports in one place
        </p>

        <div className="space-x-4">
          <Link href="/Component/bookings">
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-gray-100">
              Book Resource
            </button>
          </Link>

          <Link href="/Component/Ticket">
            <button className="px-6 py-3 border border-white rounded-lg hover:bg-white hover:text-blue-600">
              Report Issue
            </button>
          </Link>
        </div>
      </section>

      {/* 🔷 Quick Actions */}
      <section className="py-16 px-10 grid md:grid-cols-4 gap-6">
        {[
          { title: "Book a Room", link: "/Component/bookings" },
          { title: "View Resources", link: "/Component/resources" },
          { title: "Report Issue", link: "/Component/Ticket" },
          { title: "Notifications", link: "/Component/notifications" },
        ].map((item, index) => (
          <Link key={index} href={item.link}>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer transition">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">
                Click to access {item.title.toLowerCase()}
              </p>
            </div>
          </Link>
        ))}
      </section>

      {/* 🔷 Features */}
      <section className="py-16 bg-gray-100 px-10">
        <h2 className="text-2xl font-bold text-center mb-10">
          Core Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2">Facilities & Assets</h3>
            <p className="text-gray-500 text-sm">
              Manage lecture halls, labs, and equipment easily.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2">Booking System</h3>
            <p className="text-gray-500 text-sm">
              Request and manage bookings with approval workflow.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2">Incident Tickets</h3>
            <p className="text-gray-500 text-sm">
              Report issues and track resolution status.
            </p>
          </div>
        </div>
      </section>

      {/* 🔷 Footer */}
      <Footer />

    </div>
  );
}