import { ArrowUpRight, Bot, BriefcaseBusiness, Cloud, Code2, FileText, Map, Mic, ShieldCheck, Target } from "lucide-react";
import { SUGGESTED_PROMPTS } from "@/constants/prompts";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  disabled: boolean;
}

const icons = [Bot, FileText, Target, Map, BriefcaseBusiness, Cloud, ShieldCheck, Code2] as const;

export function SuggestedPrompts({ onSelect, disabled }: SuggestedPromptsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Suggested prompts">
      {SUGGESTED_PROMPTS.map((prompt, index) => {
        const Icon = icons[index] ?? Mic;

        return (
          <button
            key={prompt.title}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(prompt.prompt)}
            className="group min-h-36 rounded-lg border bg-card/80 p-4 text-left shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon size={19} />
              </span>
              <ArrowUpRight size={16} className="text-muted-foreground transition group-hover:text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-card-foreground">{prompt.title}</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{prompt.description}</p>
          </button>
        );
      })}
    </div>
  );
}
