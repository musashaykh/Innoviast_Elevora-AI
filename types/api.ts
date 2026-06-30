import type { ChatMessage } from "@/types/chat";

export interface ChatRequest {
  messages: ChatMessage[];
  latestMessage: string;
}

export interface ChatSuccessResponse {
  success: true;
  message: string;
  timestamp: string;
}

export interface ChatErrorResponse {
  success: false;
  error: string;
  timestamp: string;
}

export type ChatResponse = ChatSuccessResponse | ChatErrorResponse;
