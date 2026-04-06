import Link from "next/link";
import {
  GlassPanel,
  MetricTile,
  PageHero,
  SectionHeading,
  SiteFrame,
} from "../shared/SiteFrame";

const spaces = [
  { name: "Innovation Lab A", hours: "08:00 - 18:00", type: "Lab", status: "Available" },
  { name: "Seminar Room 4", hours: "09:00 - 16:00", type: "Room", status: "Busy at noon" },
  { name: "Media Studio", hours: "10:00 - 20:00", type: "Equipment", status: "Limited slots" },
];

export default function BookingsPage() {
  return (
    <SiteFrame accent="sky">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <PageHero
          eyebrow="Bookings Planner"
          title="Plan room, lab, and equipment bookings with a clearer overview."
          description="This redesigned booking space gives users a better visual starting point while your booking workflows continue to grow behind the scenes."
          actions={
            <>
              <Link
                href="/Component/resources"
                className="rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Browse Resources
              </Link>
              <Link
                href="/Component/notifications"
                className="rounded-full border border-stone-300 bg-white/75 px-6 py-3 text-sm font-semibold text-stone-800 transition hover:bg-white"
              >
                View Updates
              </Link>
            </>
          }
          aside={
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-green-200">Booking Focus</p>
                <p className="mt-3 text-3xl font-semibold">Spaces first</p>
                <p className="mt-2 text-sm text-slate-200">Find the right room before submitting a request.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-green-200">Next Step</p>
                <p className="mt-3 text-lg font-semibold">Connect this page to approval and calendar workflows</p>
              </div>
            </div>
          }
        />

        <section className="grid gap-4 md:grid-cols-3">
          <MetricTile
            label="Availability"
            value="Live Slots"
            detail="The redesigned page creates space for real-time availability and approval states."
          />
          <MetricTile
            label="Wayfinding"
            value="Simplified"
            detail="Users can understand the booking process quickly without digging through dense forms."
          />
          <MetricTile
            label="Expansion"
            value="Ready"
            detail="This layout can grow into calendars, filters, and request history cleanly."
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel>
            <SectionHeading
              eyebrow="Recommended Flow"
              title="Use resources as the discovery layer, then move into booking."
              description="That makes it easier for users to understand what is available before they commit to a booking request."
            />

            <div className="mt-8 grid gap-4">
              {["Pick a space type", "Compare hours and capacity", "Confirm time window"].map((step, index) => (
                <div key={step} className="rounded-[1.5rem] border border-stone-900/10 bg-white/70 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Step 0{index + 1}</p>
                  <p className="mt-3 text-lg font-semibold text-stone-950">{step}</p>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Sample Availability</p>
            <div className="mt-5 grid gap-4">
              {spaces.map((space) => (
                <div key={space.name} className="rounded-[1.5rem] border border-stone-900/10 bg-white/75 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.03em] text-stone-950">
                        {space.name}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-stone-600">
                        {space.type} • {space.hours}
                      </p>
                    </div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-green-800">
                      {space.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>
      </div>
    </SiteFrame>
  );
}
