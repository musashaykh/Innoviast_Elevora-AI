import { NextRequest, NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import { CAREER_SYSTEM_PROMPT } from "@/lib/prompts";
import { getGroqClient, getGroqModel } from "@/lib/groq";
import { isChatMessage, sanitizeMessage, validateMessage } from "@/lib/utils";
import type { ChatRequest, ChatResponse } from "@/types/api";

const REQUEST_TIMEOUT_MS = 30000;
const GENERIC_ERROR = "Sorry, I couldn't process your request. Please try again.";
const RATE_LIMIT_ERROR = "The AI service is currently busy. Please wait a moment and try again.";

function jsonResponse(body: ChatResponse, status: number) {
  return NextResponse.json(body, { status });
}

function errorResponse(error: string, status: number) {
  return jsonResponse(
    {
      success: false,
      error,
      timestamp: new Date().toISOString(),
    },
    status,
  );
}

function isValidRequestBody(body: unknown): body is ChatRequest {
  if (!body || typeof body !== "object") {
    return false;
  }

  const requestBody = body as Record<string, unknown>;

  return (
    Array.isArray(requestBody.messages) &&
    requestBody.messages.every(isChatMessage) &&
    typeof requestBody.latestMessage === "string"
  );
}

function buildGroqMessages(requestBody: ChatRequest): ChatCompletionMessageParam[] {
  const history = requestBody.messages.slice(-12).map<ChatCompletionMessageParam>((message) => ({
    role: message.role,
    content: sanitizeMessage(message.content),
  }));

  return [
    { role: "system", content: CAREER_SYSTEM_PROMPT },
    ...history,
    { role: "user", content: sanitizeMessage(requestBody.latestMessage) },
  ];
}

function getErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const maybeError = error as { status?: unknown };
  return typeof maybeError.status === "number" ? maybeError.status : null;
}

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return errorResponse("Invalid request format.", 415);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON payload.", 400);
  }

  if (!isValidRequestBody(body)) {
    return errorResponse("Invalid request payload.", 400);
  }

  const latestMessage = sanitizeMessage(body.latestMessage);
  const validationError = validateMessage(latestMessage);

  if (validationError) {
    return errorResponse(validationError, 400);
  }

  const controller = new AbortController();
  const timeoutId = windowlessSetTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create(
      {
        model: getGroqModel(),
        messages: buildGroqMessages({ ...body, latestMessage }),
        temperature: 0.4,
        max_tokens: 900,
      },
      {
        signal: controller.signal,
      },
    );

    const message = completion.choices[0]?.message?.content?.trim();

    if (!message) {
      return errorResponse(GENERIC_ERROR, 502);
    }

    return jsonResponse(
      {
        success: true,
        message,
        timestamp: new Date().toISOString(),
      },
      200,
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Chat API error:", error instanceof Error ? error.message : "Unknown error");
    }

    const status = getErrorStatus(error);

    if (status === 429) {
      return errorResponse(RATE_LIMIT_ERROR, 429);
    }

    if (error instanceof Error && error.name === "AbortError") {
      return errorResponse(GENERIC_ERROR, 504);
    }

    if (error instanceof Error && error.message.includes("GROQ_API_KEY")) {
      return errorResponse("AI service is not configured. Please add GROQ_API_KEY.", 500);
    }

    return errorResponse(GENERIC_ERROR, 500);
  } finally {
    clearTimeout(timeoutId);
  }
}

export function GET() {
  return errorResponse("Method not allowed. Send chat messages with POST.", 405);
}

function windowlessSetTimeout(callback: () => void, delay: number) {
  return setTimeout(callback, delay);
}
