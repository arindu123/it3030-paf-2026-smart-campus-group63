"use client";

import Link from "next/link";
import {
  GlassPanel,
  MetricTile,
  PageHero,
  SectionHeading,
  SiteFrame,
} from "../shared/SiteFrame";

const quickActions = [
  {
    title: "Resource Directory",
    description: "Browse labs, rooms, and equipment with live availability details.",
    href: "/Component/resources",
    tone: "from-orange-100 to-white",
  },
  {
    title: "Bookings Planner",
    description: "Coordinate lectures, events, and shared space access from one place.",
    href: "/Component/bookings",
    tone: "from-orange-50 to-white",
  },
  {
    title: "Support Tickets",
    description: "Report maintenance issues and track every update until resolution.",
    href: "/Component/Ticket",
    tone: "from-yellow-100 to-white",
  },
  {
    title: "Notifications",
    description: "Stay on top of campus service changes, approvals, and reminders.",
    href: "/Component/notifications",
    tone: "from-amber-100 to-white",
  },
];

const workflow = [
  {
    step: "01",
    title: "Discover spaces and services",
    description: "Students and staff get a single front door to resources, bookings, and support.",
  },
  {
    step: "02",
    title: "Submit requests confidently",
    description: "Forms, ticket actions, and account access stay clear and focused across devices.",
  },
  {
    step: "03",
    title: "Track progress visibly",
    description: "Dashboards and updates make operational status easy to understand at a glance.",
  },
];

export default function HomePage() {
  return (
    <SiteFrame accent="orange">
      <div className="-mt-8 flex w-full flex-col gap-10">
        <div className="-mx-4 sm:-mx-6 lg:-mx-10">
          <PageHero
          eyebrow="Campus Control"
          title="Run campus resources, requests, and support from one polished hub."
          description="UniDesk brings together resource discovery, booking coordination, support tickets, and role-based dashboards in a unified operational experience."
          containerClassName="!rounded-none"
          backgroundContent={
            <>
              <div
                className="absolute inset-0 scale-105 bg-cover bg-center opacity-50"
                style={{ backgroundImage: "url('/image1.png')", animation: "homeHeroImageA 14s ease-in-out infinite" }}
              />
              <div
                className="absolute inset-0 scale-105 bg-cover bg-center opacity-45"
                style={{ backgroundImage: "url('/image2.png')", animation: "homeHeroImageB 14s ease-in-out infinite" }}
              />
              <div
                className="absolute inset-0 scale-105 bg-cover bg-center opacity-40"
                style={{ backgroundImage: "url('/image3.jpg')", animation: "homeHeroImageC 14s ease-in-out infinite" }}
              />
              <div
                className="absolute inset-0 scale-105 bg-cover bg-center opacity-35"
                style={{ backgroundImage: "url('/image4.jpg')", animation: "homeHeroImageD 14s ease-in-out infinite" }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.93),rgba(255,255,255,0.72)_52%,rgba(8,33,86,0.30))]" />
            </>
          }
          gridClassName="gap-0"
          asidePanelClassName="!rounded-none bg-transparent border-l border-white/20"
          asideContentClassName="h-full"
          actions={
            <>
              <Link
                href="/Component/resources"
                className="rounded-full bg-[linear-gradient(135deg,#EE9B13,#D78A0F)] px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-orange-900/20 transition hover:brightness-105"
              >
                Explore Resources
              </Link>
              <Link
                href="/Component/Ticket"
                className="rounded-full border border-stone-300 bg-white/75 px-6 py-3 text-sm font-semibold text-stone-800 transition hover:bg-white"
              >
                Open Ticket Desk
              </Link>
            </>
          }
          aside={
            <div className="relative flex h-full min-h-[500px] flex-col justify-between gap-6 p-6 text-slate-50 sm:p-8 lg:min-h-[540px]">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-orange-200">Operations Pulse</p>
                  <h3 className="mt-4 max-w-sm text-3xl font-semibold tracking-[-0.04em] text-white">
                    Designed for admins, technicians, staff, and students.
                  </h3>
                </div>

                <div className="grid gap-4">
                  <div className="float-gentle rounded-[1.5rem] border border-white/20 bg-white/16 p-5 shadow-lg backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.28em] text-orange-200">Services</p>
                    <p className="mt-3 text-4xl font-semibold text-white">4</p>
                    <p className="mt-2 text-sm text-slate-100">Resource access, bookings, tickets, and updates.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/20 bg-white/16 p-5 backdrop-blur-sm">
                      <p className="text-xs uppercase tracking-[0.28em] text-orange-200">Availability</p>
                      <p className="mt-3 text-2xl font-semibold text-white">Live</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/20 bg-white/16 p-5 backdrop-blur-sm">
                      <p className="text-xs uppercase tracking-[0.28em] text-orange-200">Support</p>
                      <p className="mt-3 text-2xl font-semibold text-white">Tracked</p>
                    </div>
                  </div>
                </div>
            </div>
          }
        />

        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">

        <section className="grid gap-4 md:grid-cols-3">
          <MetricTile
            label="One Frontend"
            value="Unified"
            detail="A single visual language now carries the home page, workspaces, auth flow, and dashboards."
          />
          <MetricTile
            label="Responsive"
            value="Mobile Ready"
            detail="Layouts collapse cleanly into stacked panels so the site remains usable on smaller screens."
          />
          <MetricTile
            label="Operator Focus"
            value="Fast Scan"
            detail="Priority actions, status cards, and clean sectioning help users know where to go next."
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <GlassPanel>
            <SectionHeading
              eyebrow="Quick Access"
              title="Jump straight into the task you need."
              description="The entry points below give each area a clear role so users can move through the system without guessing."
            />
          </GlassPanel>

          <div className="grid gap-5 md:grid-cols-2">
            {quickActions.map((action, index) => (
              <Link key={action.title} href={action.href} className="fade-up" style={{ animationDelay: `${index * 110}ms` }}>
                <GlassPanel
                  className={`h-full bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(255,255,255,0.6))] transition hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(33,24,13,0.14)]`}
                >
                  <div className={`rounded-[1.35rem] bg-gradient-to-br ${action.tone} p-4`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                      Launch Area
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-stone-950">
                      {action.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{action.description}</p>
                  </div>
                </GlassPanel>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <GlassPanel>
            <SectionHeading
              eyebrow="How It Flows"
              title="A calmer workflow for day-to-day campus operations."
              description="The site now emphasizes wayfinding and readable status blocks so every part of the system feels connected."
            />

            <div className="mt-8 grid gap-4">
              {workflow.map((item) => (
                <div
                  key={item.step}
                  className="rounded-[1.5rem] border border-stone-900/10 bg-white/75 p-5"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-sm font-semibold text-white">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.03em] text-stone-950">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-stone-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="bg-[linear-gradient(165deg,rgba(15,23,42,0.95),rgba(34,74,128,0.92))] text-slate-50">
            <p className="text-xs uppercase tracking-[0.32em] text-orange-600">Why This Design</p>
            <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              More intentional, less generic.
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              The refreshed frontend uses warmer textures, stronger contrast, and clearer action
              groupings so each page feels purposeful instead of looking like a default starter app.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-orange-600">Visual System</p>
                <p className="mt-3 text-lg font-semibold">Layered glass panels, sharper hierarchy, and richer gradients.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-orange-600">Usability</p>
                <p className="mt-3 text-lg font-semibold">Cleaner nav, clearer page heroes, and better-scanning content blocks.</p>
              </div>
            </div>
          </GlassPanel>
        </section>
        </div>
      </div>
    </SiteFrame>
  );
}
