import Link from "next/link";

type AdminSection = "dashboard" | "users" | "resources" | "bookings" | "tickets";

const navItems: Array<{ key: AdminSection; label: string; href: string }> = [
  { key: "dashboard", label: "Dashboard", href: "/Component/dashboard/admin" },
  { key: "users", label: "Users", href: "/Component/dashboard/admin" },
  { key: "resources", label: "Resources", href: "/Component/resources" },
  { key: "bookings", label: "Bookings", href: "/Component/bookings" },
  { key: "tickets", label: "Tickets", href: "/Component/Ticket" },
];

export function AdminOperationsSidebar({
  actorName,
  activeSection,
}: Readonly<{
  actorName: string;
  activeSection: AdminSection;
}>) {
  const cleanedName = actorName.trim();
  const words = cleanedName.split(/\s+/).filter(Boolean);
  const initials =
    words.length >= 2
      ? `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
      : cleanedName.slice(0, 2).toUpperCase() || "AD";

  return (
    <aside className="rounded-[2rem] bg-[linear-gradient(180deg,#1f2677_0%,#1b2164_100%)] p-6 text-white shadow-[0_22px_55px_rgba(23,31,103,0.28)]">
      <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-100">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[radial-gradient(circle,#ffb703_18%,#ff006e_48%,#3a86ff_78%)]" />
        VertexOne
      </div>

      <div className="mt-8 text-center">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#f3bda1] text-xl font-semibold text-[#262869]">
          {initials}
        </div>
        <p className="mt-3 text-lg font-semibold leading-tight">{actorName}</p>
        <p className="text-xs uppercase tracking-[0.24em] text-blue-200">ADMIN</p>
      </div>

      <div className="mt-10">
        <p className="text-3xl font-bold leading-tight text-[#f0c979]">Admin Panel</p>
        <p className="text-3xl font-bold leading-tight text-white">Operations</p>
      </div>

      <div className="mt-8 space-y-3">
        {navItems.map((item) => {
          const isActive = item.key === activeSection;

          return (
            <Link
              key={item.key}
              href={item.href}
              style={isActive ? { color: "#1f2677" } : undefined}
              className={`block rounded-full px-5 py-3 text-lg font-semibold transition ${
                isActive
                  ? "border border-white/80 bg-white font-bold shadow-sm"
                  : "bg-white/10 text-blue-100 hover:bg-white/20"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
