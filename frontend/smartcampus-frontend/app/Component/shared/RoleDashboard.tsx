import Link from "next/link";
import {
  GlassPanel,
  MetricTile,
  PageHero,
  SectionHeading,
  SiteFrame,
} from "./SiteFrame";

type Accent = "amber" | "sky" | "mint" | "slate";

export function RoleDashboard({
  accent,
  eyebrow,
  title,
  description,
  metrics,
  priorities,
  ctaHref,
  ctaLabel,
}: Readonly<{
  accent: Accent;
  eyebrow: string;
  title: string;
  description: string;
  metrics: Array<{ label: string; value: string; detail: string }>;
  priorities: string[];
  ctaHref: string;
  ctaLabel: string;
}>) {
  return (
    <SiteFrame accent={accent}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <PageHero
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={
            <Link
              href={ctaHref}
              className="rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              {ctaLabel}
            </Link>
          }
          aside={
            <div className="grid gap-4">
              {metrics.slice(0, 2).map((metric) => (
                <div key={metric.label} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-green-200">{metric.label}</p>
                  <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
                  <p className="mt-2 text-sm text-slate-200">{metric.detail}</p>
                </div>
              ))}
            </div>
          }
        />

        <section className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <MetricTile
              key={metric.label}
              label={metric.label}
              value={metric.value}
              detail={metric.detail}
            />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel>
            <SectionHeading
              eyebrow="Role Focus"
              title="The dashboard now gives this role a more purposeful starting point."
              description="Instead of a plain heading, each dashboard now presents priorities, direction, and clearer visual hierarchy."
            />
          </GlassPanel>

          <GlassPanel>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Current Priorities</p>
            <div className="mt-5 grid gap-4">
              {priorities.map((priority, index) => (
                <div key={priority} className="rounded-[1.5rem] border border-stone-900/10 bg-white/75 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Task 0{index + 1}</p>
                  <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-stone-950">
                    {priority}
                  </p>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>
      </div>
    </SiteFrame>
  );
}
