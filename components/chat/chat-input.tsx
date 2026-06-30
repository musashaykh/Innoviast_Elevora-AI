"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef } from "react";
import { Loader2, Send } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t bg-card p-4 sm:p-5">
      <div className="flex items-end gap-3">
        <label htmlFor="chat-message" className="sr-only">Message</label>
        <textarea
          ref={textareaRef}
          id="chat-message"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          maxLength={APP_CONFIG.maxMessageLength}
          rows={1}
          placeholder="Ask me about careers, internships, resumes, or interviews..."
          className="max-h-40 min-h-12 flex-1 resize-none rounded-md border bg-background px-4 py-3 text-sm leading-6 shadow-sm transition placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Send message"
        >
          {isLoading ? <Loader2 size={19} className="animate-spin" /> : <Send size={19} />}
        </button>
      </div>
      <div className="mt-2 text-right text-xs text-muted-foreground">
        {value.length}/{APP_CONFIG.maxMessageLength}
      </div>
    </form>
  );
}
