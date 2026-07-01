"use client";

import { AlertCircle, RotateCcw, Sparkles } from "lucide-react";
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
    <section id="chat" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
          <Sparkles size={15} className="text-primary" />
          AI career workspace
        </div>
        <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">Ask, plan, revise, and prepare.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Get polished career guidance, resume feedback, structured roadmaps, interview preparation, and resource recommendations.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card/85 shadow-2xl backdrop-blur-xl">
        <ChatHeader onClear={clearChat} hasMessages={hasMessages} />
        {!hasMessages ? (
          <div className="space-y-6 bg-[linear-gradient(180deg,rgba(37,99,235,0.06),transparent_45%)] px-4 py-8 sm:px-5">
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="text-2xl font-semibold tracking-normal">Start with a high-impact prompt</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Choose a card or ask about careers, resumes, interviews, certifications, portfolios, or learning roadmaps.
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
