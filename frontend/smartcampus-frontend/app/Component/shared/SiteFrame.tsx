import { ReactNode } from "react";
import Footer from "../Home/Footer";
import Nav from "../Home/Nav";

const accentStyles = {
  // 60% neutral base with 10% amber warmth glow
  amber:
    "bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.10),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.72),_transparent_30%),linear-gradient(180deg,_#fafaf9_0%,_#f5f5f4_52%,_#e7e5e4_100%)]",
  // 60% neutral base with UniDesk orange glow
  orange:
    "bg-[radial-gradient(circle_at_top_left,_rgba(238,155,19,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.75),_transparent_32%),linear-gradient(180deg,_#fafaf9_0%,_#f5f5f4_52%,_#e7e5e4_100%)]",
  // 60% neutral base with subtle sky glow
  sky:
    "bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.08),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.75),_transparent_32%),linear-gradient(180deg,_#fafaf9_0%,_#f5f5f4_52%,_#e7e5e4_100%)]",
  // 60% neutral base with subtle green glow
  mint:
    "bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.07),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.75),_transparent_32%),linear-gradient(180deg,_#fafaf9_0%,_#f5f5f4_52%,_#e7e5e4_100%)]",
  // 30% green dark — intentional brand inversion
  slate:
    "bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(167,221,186,0.18),_transparent_30%),linear-gradient(180deg,_#133323_0%,_#0d291c_48%,_#091c13_100%)] text-slate-50",
} as const;

type Accent = keyof typeof accentStyles;

export function SiteFrame({
  children,
  accent = "amber",
  mainClassName = "",
}: Readonly<{
  children: ReactNode;
  accent?: Accent;
  mainClassName?: string;
}>) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${accentStyles[accent]}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),transparent)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-24 h-64 w-64 rounded-full bg-white/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 right-[-6rem] h-72 w-72 rounded-full bg-black/5 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Nav />
        <main className={`flex-1 px-4 pb-14 pt-28 sm:px-6 lg:px-10 ${mainClassName}`}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}

export function Eyebrow({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className="inline-flex items-center rounded-full border border-stone-900/10 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-stone-700 shadow-sm backdrop-blur">
      {children}
    </span>
  );
}

export function GlassPanel({
  children,
  className = "",
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return (
    <section
      className={`rounded-[2rem] border border-white/55 bg-white/72 p-6 shadow-[0_22px_70px_rgba(44,31,14,0.12)] backdrop-blur ${className}`}
    >
      {children}
    </section>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
  backgroundContent,
  gridClassName,
  containerClassName,
  asidePanelClassName,
  asideContentClassName,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
  backgroundContent?: ReactNode;
  gridClassName?: string;
  containerClassName?: string;
  asidePanelClassName?: string;
  asideContentClassName?: string;
}>) {
  return (
    <GlassPanel className={`relative overflow-hidden p-0 ${containerClassName || ""}`}>
      {backgroundContent ? <div className="pointer-events-none absolute inset-0 z-0">{backgroundContent}</div> : null}
      <div className={`relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] ${gridClassName || ""}`}>
        <div className="p-6 sm:p-8 lg:p-10">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-stone-950 sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
            {description}
          </p>
          {actions ? <div className="mt-8 flex flex-wrap gap-4">{actions}</div> : null}
        </div>

        <div
          className={`relative overflow-hidden rounded-b-[2rem] rounded-t-[1.5rem] border-l border-white/40 bg-[linear-gradient(160deg,rgba(10,43,107,0.98),rgba(14,58,130,0.94))] p-6 text-slate-50 sm:p-8 lg:rounded-l-[2rem] lg:rounded-r-none ${asidePanelClassName || ""}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_34%)]" />
          <div className={`relative z-10 ${asideContentClassName || ""}`}>{aside}</div>
        </div>
      </div>
    </GlassPanel>
  );
}

export function MetricTile({
  label,
  value,
  detail,
}: Readonly<{
  label: string;
  value: string;
  detail: string;
}>) {
  return (
    <div className="min-w-0 rounded-[1.5rem] border border-stone-900/10 bg-white/70 p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-500">{label}</p>
      <p className="mt-3 text-[clamp(1.6rem,2.2vw,2.35rem)] font-semibold leading-tight tracking-[-0.04em] text-stone-950 break-words [overflow-wrap:anywhere]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-stone-600">{detail}</p>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
}>) {
  return (
    <div className="max-w-3xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-stone-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-stone-600">{description}</p>
    </div>
  );
}
