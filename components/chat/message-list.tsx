"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types/chat";
import { Message } from "@/components/chat/message";
import { TypingIndicator } from "@/components/chat/typing-indicator";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  return (
    <div className="flex min-h-[520px] flex-1 flex-col gap-5 overflow-y-auto bg-background/40 px-4 py-5 sm:px-5">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  );
}
