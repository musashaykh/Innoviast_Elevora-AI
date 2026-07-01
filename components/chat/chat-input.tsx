"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef } from "react";
import { Loader2, Mic, MicOff, Send } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const appendTranscript = useCallback(
    (transcript: string) => {
      onChange(value ? `${value.trim()} ${transcript}` : transcript);
    },
    [onChange, value],
  );
  const { isListening, isSupported, toggleListening } = useSpeechRecognition({ onTranscript: appendTranscript });

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
    <form onSubmit={handleSubmit} className="border-t bg-card/95 p-4 backdrop-blur-xl sm:p-5">
      <div className="flex items-end gap-2 sm:gap-3">
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
          type="button"
          onClick={toggleListening}
          disabled={isLoading || !isSupported}
          className={cn(
            "relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
            isListening && "border-rose-400 text-rose-500",
          )}
          aria-label={isListening ? "Stop voice input" : "Start voice input"}
          title={isSupported ? "Voice input" : "Voice input is not supported in this browser"}
        >
          {isListening && <span className="absolute inset-0 animate-ping rounded-md border border-rose-400" />}
          {isListening ? <MicOff size={19} /> : <Mic size={19} />}
        </button>
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
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
