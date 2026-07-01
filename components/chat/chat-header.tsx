import { Bot, ShieldCheck, Trash2 } from "lucide-react";

interface ChatHeaderProps {
  onClear: () => void;
  hasMessages: boolean;
}

export function ChatHeader({ onClear, hasMessages }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b bg-card/90 px-4 py-4 backdrop-blur-xl sm:px-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
          <Bot size={22} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Elevora AI</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck size={14} />
            Career Guidance Assistant
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClear}
        disabled={!hasMessages}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-card px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Clear chat"
      >
        <Trash2 size={16} />
        <span className="hidden sm:inline">Clear Chat</span>
      </button>
    </div>
  );
}
