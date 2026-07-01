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

export interface ResumeAnalysis {
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  grammarSuggestions: string[];
  formattingFeedback: string[];
  actionableRecommendations: string[];
}

export interface ResumeReviewSuccessResponse {
  success: true;
  analysis: ResumeAnalysis;
  fileName: string;
  extractedCharacters: number;
  timestamp: string;
}

export interface ResumeReviewErrorResponse {
  success: false;
  error: string;
  timestamp: string;
}

export type ResumeReviewResponse = ResumeReviewSuccessResponse | ResumeReviewErrorResponse;
