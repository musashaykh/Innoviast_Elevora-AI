"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ChatResponse } from "@/types/api";
import type { ChatErrorState, ChatMessage } from "@/types/chat";
import { createMessage, sanitizeMessage, validateMessage } from "@/lib/utils";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [error, setError] = useState<ChatErrorState | null>(null);

  const hasMessages = messages.length > 0;

  const sendMessage = useCallback(
    async (rawMessage?: string) => {
      const messageContent = sanitizeMessage(rawMessage ?? input);
      const validationError = validateMessage(messageContent);

      if (validationError) {
        toast.error(validationError);
        return;
      }

      const userMessage = createMessage("user", messageContent);
      const nextMessages = [...messages, userMessage];

      setMessages(nextMessages);
      setInput("");
      setIsLoading(true);
      setError(null);
      setLastPrompt(messageContent);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages,
            latestMessage: messageContent,
          }),
        });

        const data = (await response.json()) as ChatResponse;

        if (!response.ok || !data.success) {
          const fallback = response.status === 429
            ? "The AI service is currently busy. Please wait a moment and try again."
            : data.success === false
              ? data.error
              : "Sorry, I couldn't process your request. Please try again.";
          throw new Error(fallback);
        }

        setMessages((currentMessages) => [
          ...currentMessages,
          createMessage("assistant", data.message),
        ]);
      } catch (caughtError) {
        const friendlyMessage =
          caughtError instanceof TypeError
            ? "Network unavailable. Please check your internet connection."
            : caughtError instanceof Error
              ? caughtError.message
              : "Sorry, I couldn't process your request. Please try again.";

        setError({ message: friendlyMessage, canRetry: true });
        toast.error(friendlyMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [input, messages],
  );

  const retry = useCallback(() => {
    if (lastPrompt) {
      void sendMessage(lastPrompt);
    }
  }, [lastPrompt, sendMessage]);

  const clearChat = useCallback(() => {
    if (!messages.length) {
      return;
    }

    const confirmed = window.confirm("Clear this conversation?");

    if (confirmed) {
      setMessages([]);
      setInput("");
      setError(null);
      setLastPrompt(null);
      toast.success("Conversation cleared.");
    }
  }, [messages.length]);

  return useMemo(
    () => ({
      messages,
      input,
      setInput,
      isLoading,
      hasMessages,
      error,
      sendMessage,
      retry,
      clearChat,
    }),
    [messages, input, isLoading, hasMessages, error, sendMessage, retry, clearChat],
  );
}
