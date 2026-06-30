import { SUGGESTED_PROMPTS } from "@/constants/prompts";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  disabled: boolean;
}

export function SuggestedPrompts({ onSelect, disabled }: SuggestedPromptsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-label="Suggested prompts">
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          className="min-h-16 rounded-lg border bg-card p-4 text-left text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
