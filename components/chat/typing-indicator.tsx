export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-1 py-3 text-sm text-muted-foreground" role="status" aria-live="polite">
      <span>Elevora AI is typing</span>
      <span className="flex gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
      </span>
    </div>
  );
}
