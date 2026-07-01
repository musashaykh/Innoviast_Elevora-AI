import { CheckCircle2, ExternalLink, FileText, Lightbulb, Link2, Milestone, Route } from "lucide-react";

interface AssistantInsightsProps {
  content: string;
}

interface ResourceItem {
  title: string;
  url: string;
}

const roadmapPattern = /\b(step|week|month|phase|roadmap|milestone)\b/i;
const resumePattern = /\b(resume|ats|strengths|weaknesses|grammar|missing skills|recommendations)\b/i;

function cleanLine(line: string) {
  return line
    .replace(/^#{1,6}\s*/, "")
    .replace(/^[-*]\s*/, "")
    .replace(/^\d+[.)]\s*/, "")
    .replace(/\*\*/g, "")
    .trim();
}

function getRoadmapItems(content: string) {
  if (!roadmapPattern.test(content)) {
    return [];
  }

  return content
    .split("\n")
    .map(cleanLine)
    .filter((line) => line.length > 18)
    .filter((line) => /\b(step|week|month|phase|learn|build|practice|project|certification|interview|portfolio)\b/i.test(line))
    .slice(0, 6);
}

function getResources(content: string): ResourceItem[] {
  const markdownLinks = Array.from(content.matchAll(/\[([^\]]+)]\((https?:\/\/[^)\s]+)\)/g));
  const plainLinks = Array.from(content.matchAll(/https?:\/\/[^\s)]+/g));
  const resources = new Map<string, ResourceItem>();

  markdownLinks.forEach((match) => {
    const title = cleanLine(match[1] ?? "Learning resource");
    const url = match[2];

    if (url) {
      resources.set(url, { title, url });
    }
  });

  plainLinks.forEach((match) => {
    const url = match[0];
    if (!resources.has(url)) {
      resources.set(url, { title: new URL(url).hostname.replace(/^www\./, ""), url });
    }
  });

  return Array.from(resources.values()).slice(0, 4);
}

function getResumeItems(content: string) {
  if (!resumePattern.test(content)) {
    return [];
  }

  const labels = ["Strengths", "Weaknesses", "Missing Skills", "ATS Suggestions", "Grammar Tips", "Recommendations"];

  return labels
    .map((label) => {
      const escapedLabel = label.replace(/\s+/g, "\\s+");
      const pattern = new RegExp(`${escapedLabel}[:\\s-]*([^#]+?)(?=\\n\\s*(?:Strengths|Weaknesses|Missing Skills|ATS Suggestions|Grammar Tips|Recommendations)\\b|$)`, "i");
      const match = content.match(pattern);
      const value = match?.[1]?.split("\n").map(cleanLine).filter(Boolean).slice(0, 3).join(" ");

      return value ? { label, value } : null;
    })
    .filter((item): item is { label: string; value: string } => Boolean(item))
    .slice(0, 6);
}

export function AssistantInsights({ content }: AssistantInsightsProps) {
  const roadmapItems = getRoadmapItems(content);
  const resources = getResources(content);
  const resumeItems = getResumeItems(content);
  const hasInsights = roadmapItems.length > 2 || resources.length > 0 || resumeItems.length > 0;

  if (!hasInsights) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      {roadmapItems.length > 2 && (
        <section className="rounded-lg border bg-background/70 p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Route size={17} className="text-primary" />
            Learning Path
          </div>
          <div className="space-y-0">
            {roadmapItems.map((item, index) => (
              <div key={`${item}-${index}`} className="grid grid-cols-[2rem_1fr] gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  {index < roadmapItems.length - 1 && <span className="h-full min-h-8 w-px bg-border" />}
                </div>
                <div className="pb-4">
                  <div className="flex items-start gap-2">
                    <Milestone size={16} className="mt-1 shrink-0 text-emerald-500" />
                    <p className="text-sm leading-6 text-card-foreground">{item}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {resumeItems.length > 0 && (
        <section className="rounded-lg border bg-background/70 p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <FileText size={17} className="text-primary" />
            Resume Feedback Snapshot
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {resumeItems.map((item) => (
              <article key={item.label} className="rounded-md border bg-card p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  {item.label}
                </div>
                <p className="text-xs leading-5 text-muted-foreground">{item.value}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {resources.length > 0 && (
        <section className="rounded-lg border bg-background/70 p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Lightbulb size={17} className="text-primary" />
            Recommended Resources
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {resources.map((resource) => (
              <a
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-md border bg-card p-3 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Link2 size={15} className="shrink-0 text-emerald-500" />
                    <span className="truncate text-sm font-semibold">{resource.title}</span>
                  </div>
                  <ExternalLink size={14} className="shrink-0 text-muted-foreground transition group-hover:text-primary" />
                </div>
                <p className="mt-2 truncate text-xs text-muted-foreground">{resource.url}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
