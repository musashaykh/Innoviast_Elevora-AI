import Link from "next/link";
import { ArrowRight, CheckCircle2, Layers3, Sparkles, Target, Zap } from "lucide-react";
import { CAREER_CATEGORIES, WHY_CHOOSE_ITEMS } from "@/constants/prompts";

const categoryAccents = [
  "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-200",
  "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-200",
] as const;

export function WhyChoose() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm font-medium text-muted-foreground">
            <Sparkles size={15} className="text-primary" />
            Why Elevora
          </div>
          <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">
            Guidance that feels like a career mentor, not a search result.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Elevora turns broad career questions into focused next steps, polished feedback, and practical learning paths.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {WHY_CHOOSE_ITEMS.map((item, index) => (
            <article key={item} className="rounded-lg border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                {[Target, Layers3, CheckCircle2, Zap][index] ? (() => {
                  const Icon = [Target, Layers3, CheckCircle2, Zap][index];
                  return <Icon size={20} />;
                })() : null}
              </div>
              <p className="text-sm leading-6 text-card-foreground">{item}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CareerCategories() {
  return (
    <section id="careers" className="border-y bg-card/45 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">Explore career paths</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Start with a role, then ask Elevora for the skills, projects, resume positioning, and interview prep that fit it.
            </p>
          </div>
          <Link
            href="#chat"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Ask about a role
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CAREER_CATEGORIES.map((category, index) => (
            <Link
              key={category}
              href="#chat"
              className={`rounded-lg border p-4 text-sm font-semibold transition hover:-translate-y-1 hover:shadow-md ${categoryAccents[index % categoryAccents.length]}`}
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-lg border bg-card p-8 shadow-xl sm:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal">Build a clearer career plan today.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Ask for a roadmap, paste a resume, practice interviews, or compare career options in one focused workspace.
            </p>
          </div>
          <Link
            href="#chat"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Start with Elevora
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
