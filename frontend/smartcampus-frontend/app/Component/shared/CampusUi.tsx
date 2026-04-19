import { ReactNode } from "react";

type Tone = "warm" | "cool" | "dark";

type HeroStat = {
  label: string;
  value: string;
  tone: Tone;
};

export function DashboardHero({
  eyebrow,
  title,
  description,
  stats,
  message,
  error,
  onRefresh,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  stats: HeroStat[];
  message: string;
  error: string;
  onRefresh: () => void;
}>) {
  return (
    <section className="mb-8 overflow-hidden rounded-[2.2rem] border border-white/60 bg-white/78 p-6 shadow-[0_24px_80px_rgba(45,32,15,0.13)] backdrop-blur md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.32em] text-orange-600">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-stone-950 md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-stone-600 md:text-base">
            {description}
          </p>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#d97706,#b45309)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/20 transition hover:brightness-105"
          onClick={onRefresh}
          type="button"
        >
          Refresh Data
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatusCard key={stat.label} label={stat.label} tone={stat.tone} value={stat.value} />
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white/75 px-4 py-3 text-sm text-stone-700">
        {error ? <span className="text-red-700">{error}</span> : message}
      </div>
    </section>
  );
}

export function Panel({
  eyebrow,
  title,
  description,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}>) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/78 p-6 shadow-[0_18px_55px_rgba(50,36,16,0.12)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-stone-950">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-stone-600">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function StatusCard({
  label,
  value,
  tone,
}: Readonly<{
  label: string;
  value: string;
  tone: Tone;
}>) {
  const toneClass =
    tone === "warm"
      ? "bg-orange-100 text-orange-900"
      : tone === "cool"
        ? "bg-orange-50 text-orange-900"
        : "bg-blue-950 text-white";

  return (
    <div className={`rounded-[1.75rem] px-5 py-5 shadow-sm ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-70">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.03em]">{value}</p>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  max?: string;
}>) {
  return (
    <label className="grid gap-2 text-sm font-medium text-stone-700">
      {label}
      <input
        className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
        max={max}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}>) {
  return (
    <label className="grid gap-2 text-sm font-medium text-stone-700">
      {label}
      <textarea
        className="min-h-28 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}>) {
  return (
    <label className="grid gap-2 text-sm font-medium text-stone-700">
      {label}
      <select
        className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EmptyState({ text }: Readonly<{ text: string }>) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white/65 px-4 py-8 text-center text-sm text-stone-500">
      {text}
    </div>
  );
}
