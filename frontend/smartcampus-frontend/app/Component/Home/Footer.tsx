import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/Component/resources", label: "Resources" },
  { href: "/Component/bookings", label: "Bookings" },
  { href: "/Component/Ticket", label: "Tickets" },
];

export default function Footer() {
  return (
    <footer className="px-4 pb-6 pt-2 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(11,40,25,0.96),rgba(21,88,52,0.94))] p-6 text-slate-50 shadow-[0_20px_70px_rgba(7,28,17,0.22)] sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.7fr_0.7fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-green-200">Smart Campus</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              Designed for smoother campus operations.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              Manage facilities, service tickets, user access, and day-to-day coordination from a
              cleaner, faster frontend.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-slate-300">
              Navigate
            </p>
            <div className="mt-4 grid gap-3 text-sm text-slate-200">
              {footerLinks.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-slate-300">
              Contact
            </p>
            <div className="mt-4 grid gap-3 text-sm text-slate-200">
              <p>Facilities Desk</p>
              <p>support@smartcampus.local</p>
              <p>Mon to Fri, 8:00 AM to 6:00 PM</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs uppercase tracking-[0.24em] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Smart Campus System</p>
          <p>Reliable spaces, services, and support in one place</p>
        </div>
      </div>
    </footer>
  );
}
