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
  secondaryCtaHref,
  secondaryCtaLabel,
  homeHeroStyle,
}: Readonly<{
  accent: Accent;
  eyebrow: string;
  title: string;
  description: string;
  metrics: Array<{ label: string; value: string; detail: string }>;
  priorities: string[];
  ctaHref: string;
  ctaLabel: string;
  secondaryCtaHref?: string;
  secondaryCtaLabel?: string;
  homeHeroStyle?: boolean;
}>) {
  return (
    <SiteFrame accent={accent} mainClassName={homeHeroStyle ? "pt-0" : ""}>
      <div className={`flex w-full flex-col gap-10 ${homeHeroStyle ? "" : "mx-auto max-w-7xl"}`}>
        <div className={homeHeroStyle ? "-mx-4 sm:-mx-6 lg:-mx-10" : ""}>
          <PageHero
            eyebrow={eyebrow}
            title={title}
            description={description}
            backgroundContent={homeHeroStyle ? (
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
            ) : undefined}
            gridClassName={homeHeroStyle ? "gap-0" : undefined}
            containerClassName={homeHeroStyle ? "!rounded-none" : undefined}
            asidePanelClassName={homeHeroStyle ? "!rounded-none bg-transparent border-l border-white/20" : undefined}
            asideContentClassName={homeHeroStyle ? "h-full" : undefined}
            actions={
              <>
                <Link
                  href={ctaHref}
                  className={homeHeroStyle
                    ? "rounded-none bg-[linear-gradient(135deg,#EE9B13,#D78A0F)] px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-orange-900/20 transition hover:brightness-105"
                    : "rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"}
                >
                  {ctaLabel}
                </Link>
                {secondaryCtaHref && secondaryCtaLabel ? (
                  <Link
                    href={secondaryCtaHref}
                    className={homeHeroStyle
                      ? "rounded-none border border-stone-300 bg-white/75 px-6 py-3 text-sm font-semibold text-stone-800 transition hover:bg-white"
                      : "rounded-full border border-stone-300 bg-white/75 px-6 py-3 text-sm font-semibold text-stone-800 transition hover:bg-white"}
                  >
                    {secondaryCtaLabel}
                  </Link>
                ) : null}
              </>
            }
            aside={
              <div className={homeHeroStyle ? "relative flex h-full min-h-[500px] flex-col justify-between gap-6 p-6 text-slate-50 sm:p-8 lg:min-h-[540px]" : "grid gap-4"}>
                {homeHeroStyle ? (
                  <div className="grid gap-4">
                    {metrics.slice(0, 3).map((metric, index) => (
                      <div
                        key={metric.label}
                        className={`${index === 0 ? "float-gentle" : ""} rounded-none border border-white/20 bg-white/16 p-5 shadow-lg backdrop-blur-sm`}
                      >
                        <p className="text-xs uppercase tracking-[0.28em] text-orange-200">{metric.label}</p>
                        <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
                        <p className="mt-2 text-sm text-slate-100">{metric.detail}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  metrics.slice(0, 2).map((metric) => (
                    <div key={metric.label} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-orange-600">{metric.label}</p>
                      <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
                      <p className="mt-2 text-sm text-slate-200">{metric.detail}</p>
                    </div>
                  ))
                )}
              </div>
            }
          />
        </div>

        <div className={homeHeroStyle ? "mx-auto flex w-full max-w-7xl flex-col gap-10" : ""}>

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
      </div>
    </SiteFrame>
  );
}
