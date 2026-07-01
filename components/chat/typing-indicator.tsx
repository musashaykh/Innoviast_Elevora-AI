export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-1 py-3 text-sm text-muted-foreground" role="status" aria-live="polite">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
        <span className="flex gap-1" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
        </span>
      </span>
      <span>Elevora AI is drafting a structured answer</span>
    </div>
  );
}
