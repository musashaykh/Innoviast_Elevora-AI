import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { getGroqClient, getGroqModel } from "@/lib/groq";
import type { ResumeAnalysis, ResumeReviewResponse } from "@/types/api";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIN_TEXT_LENGTH = 300;
const MAX_TEXT_LENGTH = 15000;
const REQUEST_TIMEOUT_MS = 45000;
const GENERIC_ERROR = "Sorry, I couldn't review this resume. Please try again.";
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

class ResumeExtractionError extends Error {
  constructor(message: string, public readonly detail: string) {
    super(message);
    this.name = "ResumeExtractionError";
  }
}

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

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
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

async function extractPdfWithPdf2Json(buffer: Buffer) {
  const { default: PDFParser } = await import("pdf2json");

  return new Promise<string>((resolve, reject) => {
    const parser = new PDFParser(null, true);
    let settled = false;

    const complete = (callback: () => void) => {
      if (settled) {
        return;
      }

      settled = true;
      try {
        callback();
      } finally {
        parser.destroy();
      }
    };

    parser.on("pdfParser_dataError", (errorData) => {
      const error =
        errorData instanceof Error
          ? errorData
          : errorData.parserError;

      complete(() => reject(error));
    });

    parser.on("pdfParser_dataReady", () => {
      complete(() => resolve(parser.getRawTextContent()));
    });

    try {
      parser.parseBuffer(buffer, 0);
    } catch (error) {
      complete(() => reject(error));
    }
  });
}

async function extractPdfText(buffer: Buffer, fileName: string) {
  console.info(`Resume PDF extraction using pdf2json: ${fileName}`);

  try {
    const text = await extractPdfWithPdf2Json(buffer);
    console.info(`Resume PDF extracted with pdf2json: ${fileName}, characters=${text.trim().length}`);
    return text;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error(`Resume PDF pdf2json extraction failed for ${fileName}:`, error);
    throw new ResumeExtractionError("PDF text extraction failed.", `pdf2json failed: ${message}`);
  }
}

async function extractText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const lowerName = file.name.toLowerCase();

  console.info(`Resume upload received: name=${file.name}, type=${file.type || "unknown"}, bytes=${buffer.byteLength}`);

  if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
    return extractPdfText(buffer, file.name);
  }

  if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      console.info(`Resume DOCX extracted with mammoth: ${file.name}, characters=${result.value.trim().length}`);
      return result.value;
    } catch (error) {
      console.error(`Resume DOCX extraction failed for ${file.name}:`, error);
      throw new ResumeExtractionError("DOCX text extraction failed.", getErrorMessage(error));
    }
  }

  try {
    const text = buffer.toString("utf8");
    console.info(`Resume TXT extracted: ${file.name}, characters=${text.trim().length}`);
    return text;
  } catch (error) {
    console.error(`Resume TXT extraction failed for ${file.name}:`, error);
    throw new ResumeExtractionError("TXT text extraction failed.", getErrorMessage(error));
  }
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
  try {
    return await handlePost(request);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Unhandled resume review error:", error instanceof Error ? error.message : "Unknown error");
    }

    return errorResponse(GENERIC_ERROR, 500);
  }
}

export function GET() {
  return errorResponse("Method not allowed. Upload a resume with POST.", 405);
}

async function handlePost(request: NextRequest) {
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

  if (file.size === 0) {
    return errorResponse("The uploaded resume file is empty.", 400);
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
  } catch (error) {
    if (error instanceof ResumeExtractionError) {
      console.error(`Resume extraction failed: ${error.message} ${error.detail}`);
      return errorResponse(`${error.message} ${error.detail}`, 422);
    }

    const message = getErrorMessage(error);
    console.error("Unexpected resume extraction failure:", error);
    return errorResponse(`Resume text extraction failed: ${message}`, 422);
  }

  console.info(`Resume extracted text length after normalization: ${extractedText.length}`);

  if (extractedText.length === 0) {
    return errorResponse(
      "No text was extracted from this file. The resume may be scanned, image-only, encrypted, or saved with text as vector outlines.",
      422,
    );
  }

  if (extractedText.length < MIN_TEXT_LENGTH) {
    return errorResponse(
      `The extracted resume text is too short for a useful ATS review. Extracted ${extractedText.length} characters; at least ${MIN_TEXT_LENGTH} are required.`,
      422,
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create(
      {
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
      },
      {
        signal: controller.signal,
      },
    );

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

    if (error instanceof Error && error.name === "AbortError") {
      return errorResponse("The resume review timed out. Please try again with a shorter resume.", 504);
    }

    if (error instanceof SyntaxError) {
      return errorResponse("The AI response could not be parsed. Please try again.", 502);
    }

    return errorResponse(GENERIC_ERROR, 500);
  } finally {
    clearTimeout(timeoutId);
  }
}
