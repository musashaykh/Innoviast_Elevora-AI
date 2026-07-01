import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { getGroqClient, getGroqModel } from "@/lib/groq";
import type { ResumeAnalysis, ResumeReviewResponse } from "@/types/api";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIN_TEXT_LENGTH = 300;
const MAX_TEXT_LENGTH = 15000;
const GENERIC_ERROR = "Sorry, I couldn't review this resume. Please try again.";
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

function jsonResponse(body: ResumeReviewResponse, status: number) {
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

function isSupportedFile(file: File) {
  const lowerName = file.name.toLowerCase();

  return (
    ALLOWED_TYPES.has(file.type) ||
    lowerName.endsWith(".pdf") ||
    lowerName.endsWith(".docx") ||
    lowerName.endsWith(".txt")
  );
}

async function extractText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const lowerName = file.name.toLowerCase();

  if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return buffer.toString("utf8");
}

function normalizeText(text: string) {
  return text.replace(/\u0000/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function coerceStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function clampScore(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function parseAnalysis(content: string): ResumeAnalysis {
  const cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  return {
    atsScore: clampScore(parsed.atsScore),
    summary: typeof parsed.summary === "string" ? parsed.summary.trim() : "Resume analysis completed.",
    strengths: coerceStringArray(parsed.strengths),
    weaknesses: coerceStringArray(parsed.weaknesses),
    missingSkills: coerceStringArray(parsed.missingSkills),
    grammarSuggestions: coerceStringArray(parsed.grammarSuggestions),
    formattingFeedback: coerceStringArray(parsed.formattingFeedback),
    actionableRecommendations: coerceStringArray(parsed.actionableRecommendations),
  };
}

function buildPrompt(resumeText: string) {
  return `
You are Elevora AI, an expert ATS resume reviewer and career coach.

Analyze the resume text below for ATS readiness, clarity, formatting, grammar, role fit, and career impact.

Return ONLY valid JSON with this exact shape:
{
  "atsScore": number,
  "summary": string,
  "strengths": string[],
  "weaknesses": string[],
  "missingSkills": string[],
  "grammarSuggestions": string[],
  "formattingFeedback": string[],
  "actionableRecommendations": string[]
}

Rules:
- atsScore must be 0 to 100.
- Use concise, specific, professional feedback.
- Do not invent experience the candidate did not provide.
- If the target role is unclear, infer likely roles from the resume and mention that uncertainty in the summary.
- Keep each array to 4-6 useful items.

Resume text:
${resumeText.slice(0, MAX_TEXT_LENGTH)}
`.trim();
}

export async function POST(request: NextRequest) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Invalid upload request.", 400);
  }

  const file = formData.get("resume");

  if (!(file instanceof File)) {
    return errorResponse("Please upload a resume file.", 400);
  }

  if (!isSupportedFile(file)) {
    return errorResponse("Unsupported file type. Upload a PDF, DOCX, or TXT resume.", 415);
  }

  if (file.size > MAX_FILE_SIZE) {
    return errorResponse("Resume file is too large. Please upload a file under 5MB.", 413);
  }

  let extractedText: string;

  try {
    extractedText = normalizeText(await extractText(file));
  } catch {
    return errorResponse("Could not extract text from this resume. Try a text-based PDF, DOCX, or TXT file.", 422);
  }

  if (extractedText.length < MIN_TEXT_LENGTH) {
    return errorResponse("The extracted resume text is too short for a useful ATS review.", 422);
  }

  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: getGroqModel(),
      temperature: 0.2,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a professional ATS resume analyst. Respond only with valid JSON.",
        },
        {
          role: "user",
          content: buildPrompt(extractedText),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return errorResponse(GENERIC_ERROR, 502);
    }

    return jsonResponse(
      {
        success: true,
        analysis: parseAnalysis(content),
        fileName: file.name,
        extractedCharacters: extractedText.length,
        timestamp: new Date().toISOString(),
      },
      200,
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Resume review error:", error instanceof Error ? error.message : "Unknown error");
    }

    if (error instanceof Error && error.message.includes("GROQ_API_KEY")) {
      return errorResponse("AI service is not configured. Please add GROQ_API_KEY.", 500);
    }

    if (error instanceof SyntaxError) {
      return errorResponse("The AI response could not be parsed. Please try again.", 502);
    }

    return errorResponse(GENERIC_ERROR, 500);
  }
}
