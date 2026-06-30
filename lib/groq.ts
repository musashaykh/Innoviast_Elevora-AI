import Groq from "groq-sdk";
import { APP_CONFIG } from "@/constants/config";

let groqClient: Groq | null = null;

export function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }

  return groqClient;
}

export function getGroqModel() {
  return process.env.GROQ_MODEL || APP_CONFIG.defaultModel;
}
