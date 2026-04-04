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
    <section className="mb-8 overflow-hidden rounded-[2rem] border border-stone-900/10 bg-white/80 p-6 shadow-[0_20px_70px_rgba(75,55,22,0.14)] backdrop-blur md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950 md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 md:text-base">
            {description}
          </p>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
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

      <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
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
    <section className="rounded-[2rem] border border-stone-900/10 bg-white/85 p-6 shadow-[0_16px_50px_rgba(82,58,22,0.12)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold text-stone-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
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
      ? "bg-amber-100 text-amber-900"
      : tone === "cool"
        ? "bg-sky-100 text-sky-900"
        : "bg-stone-900 text-white";

  return (
    <div className={`rounded-3xl px-5 py-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-70">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}>) {
  return (
    <label className="grid gap-2 text-sm font-medium text-stone-700">
      {label}
      <input
        className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
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
        className="min-h-28 rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
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
        className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
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
    <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
      {text}
    </div>
  );
}
