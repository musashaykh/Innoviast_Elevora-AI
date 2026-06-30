import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { APP_CONFIG } from "@/constants/config";
import type { ChatMessage } from "@/types/chat";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

export function sanitizeMessage(message: string): string {
  return message.replace(/\u0000/g, "").trim();
}

export function validateMessage(message: string): string | null {
  const sanitizedMessage = sanitizeMessage(message);

  if (!sanitizedMessage) {
    return "Please enter a message.";
  }

  if (sanitizedMessage.length > APP_CONFIG.maxMessageLength) {
    return "Message exceeds the maximum allowed length.";
  }

  return null;
}

export function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Record<string, unknown>;

  return (
    typeof message.id === "string" &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    typeof message.timestamp === "string"
  );
}
