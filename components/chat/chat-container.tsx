"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { SuggestedPrompts } from "@/components/chat/suggested-prompts";
import { useChat } from "@/hooks/use-chat";

export function ChatContainer() {
  const {
    messages,
    input,
    setInput,
    isLoading,
    hasMessages,
    error,
    sendMessage,
    retry,
    clearChat,
  } = useChat();

  return (
    <section id="chat" className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-lg border bg-card shadow-lg">
        <ChatHeader onClear={clearChat} hasMessages={hasMessages} />
        {!hasMessages ? (
          <div className="space-y-6 px-4 py-8 sm:px-5">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal">Start with a career question</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Choose a prompt or ask about careers, resumes, interviews, certifications, portfolios, or learning roadmaps.
              </p>
            </div>
            <SuggestedPrompts onSelect={(prompt) => void sendMessage(prompt)} disabled={isLoading} />
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
        {error && (
          <div className="mx-4 mb-4 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200 sm:mx-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error.message}</span>
            </div>
            {error.canRetry && (
              <button
                type="button"
                onClick={retry}
                disabled={isLoading}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 font-medium text-red-800 disabled:opacity-60 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
              >
                <RotateCcw size={15} />
                Retry
              </button>
            )}
          </div>
        )}
        <ChatInput value={input} onChange={setInput} onSubmit={() => void sendMessage()} isLoading={isLoading} />
      </div>
    </section>
  );
}
