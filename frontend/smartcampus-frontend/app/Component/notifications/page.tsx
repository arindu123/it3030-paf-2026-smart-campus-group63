import {
  GlassPanel,
  MetricTile,
  PageHero,
  SectionHeading,
  SiteFrame,
} from "../shared/SiteFrame";

const updates = [
  {
    title: "Resource approval updates",
    body: "A dedicated feed can surface booking approvals, denials, and room changes in one place.",
    tone: "bg-green-100 text-green-800",
  },
  {
    title: "Maintenance ticket movement",
    body: "Technician assignment, resolution notes, and status changes can be highlighted clearly.",
    tone: "bg-lime-100 text-lime-800",
  },
  {
    title: "System and campus reminders",
    body: "Announcements about availability windows or service outages fit naturally into this layout.",
    tone: "bg-green-50 text-green-800",
  },
];

export default function NotificationsPage() {
  return (
    <SiteFrame accent="mint">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <PageHero
          eyebrow="Notifications"
          title="Keep operational updates readable, timely, and easy to scan."
          description="This page now has a proper notification center layout so approvals, service changes, and ticket activity can all live in one consistent place."
          aside={
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-green-200">Status Feed</p>
                <p className="mt-3 text-3xl font-semibold">Centralized</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-green-200">Designed For</p>
                <p className="mt-3 text-lg font-semibold">Approvals, reminders, and issue progress</p>
              </div>
            </div>
          }
        />

        <section className="grid gap-4 md:grid-cols-3">
          <MetricTile label="Approvals" value="Visible" detail="Booking decisions can be surfaced without users needing to dig into dashboards." />
          <MetricTile label="Tickets" value="Tracked" detail="Issue progress and technician actions have a natural home in the feed." />
          <MetricTile label="Announcements" value="Clear" detail="Campus-wide updates can be presented without overwhelming the interface." />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <GlassPanel>
            <SectionHeading
              eyebrow="Notification Strategy"
              title="Different update types, one calmer presentation."
              description="Instead of a blank page, the notification center now suggests how operational messages can be grouped and scanned."
            />
          </GlassPanel>

          <div className="grid gap-4">
            {updates.map((update) => (
              <GlassPanel key={update.title}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.03em] text-stone-950">
                      {update.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{update.body}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${update.tone}`}>
                    Update
                  </span>
                </div>
              </GlassPanel>
            ))}
          </div>
        </section>
      </div>
    </SiteFrame>
  );
}
