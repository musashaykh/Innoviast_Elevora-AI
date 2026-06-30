import { Award, Brain, BriefcaseBusiness, FileText, Map, MessagesSquare } from "lucide-react";
import { FEATURE_ITEMS } from "@/constants/prompts";

const icons = [BriefcaseBusiness, FileText, MessagesSquare, Map, Award, Brain] as const;

export function Features() {
  return (
    <section id="features" className="border-y bg-card/50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">
            Career support for the moments that matter
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Get practical, structured guidance for decisions, applications, interviews, and growth.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_ITEMS.map((feature, index) => {
            const Icon = icons[index];

            return (
              <article
                key={feature.title}
                className="rounded-lg border bg-card p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-md bg-muted text-primary">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
