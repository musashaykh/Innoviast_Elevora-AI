"use client";

import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Gauge,
  Loader2,
  Sparkles,
  Target,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { ResumeAnalysis, ResumeReviewResponse } from "@/types/api";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"] as const;
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

interface ReviewState {
  analysis: ResumeAnalysis;
  fileName: string;
  extractedCharacters: number;
}

function validateFile(file: File) {
  const lowerName = file.name.toLowerCase();
  const hasValidExtension = ACCEPTED_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
  const hasValidType = ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number]);

  if (!hasValidExtension && !hasValidType) {
    return "Upload a PDF, DOCX, or TXT resume.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File must be under 5MB.";
  }

  return null;
}

function scoreColor(score: number) {
  if (score >= 80) {
    return "text-emerald-600 dark:text-emerald-300";
  }

  if (score >= 60) {
    return "text-amber-600 dark:text-amber-300";
  }

  return "text-rose-600 dark:text-rose-300";
}

function FeedbackCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "success" | "warning" | "info" | "danger";
}) {
  const toneClass = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  }[tone];

  return (
    <article className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-md", toneClass)}>
          {tone === "success" ? <CheckCircle2 size={17} /> : <Target size={17} />}
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="text-sm text-muted-foreground">No specific issues found in this category.</li>
        )}
      </ul>
    </article>
  );
}

export function ResumeReview() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<ReviewState | null>(null);

  const fileMeta = useMemo(() => {
    if (!selectedFile) {
      return null;
    }

    return `${(selectedFile.size / 1024).toFixed(1)} KB`;
  }, [selectedFile]);

  function selectFile(file: File) {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setReview(null);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      selectFile(file);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];

    if (file) {
      selectFile(file);
    }
  }

  async function handleReview() {
    if (!selectedFile) {
      toast.warning("Choose a resume file first.");
      return;
    }

    const validationError = validateFile(selectedFile);

    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/resume-review", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as ResumeReviewResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.success === false ? data.error : "Resume review failed.");
      }

      setReview({
        analysis: data.analysis,
        fileName: data.fileName,
        extractedCharacters: data.extractedCharacters,
      });
      toast.success("Resume review completed.");
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Resume review failed.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="resume-review" className="border-y bg-card/45 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
              <Sparkles size={15} className="text-primary" />
              Resume Review
            </div>
            <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">ATS-style resume analysis</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Upload a PDF, DOCX, or TXT resume. Elevora extracts the text on the server and returns focused feedback for hiring systems and recruiters.
            </p>
          </div>
          <div className="rounded-lg border bg-background/70 p-4 text-sm text-muted-foreground">
            API key stays server-side. Max file size: 5MB.
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="space-y-4">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "rounded-lg border border-dashed bg-card p-6 text-center shadow-sm transition",
                isDragging ? "border-primary bg-primary/5" : "border-border",
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UploadCloud size={26} />
              </div>
              <h3 className="text-base font-semibold">Drop your resume here</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">PDF, DOCX, or TXT files are supported.</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isLoading}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-md border bg-background px-4 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                Browse files
              </button>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FileText size={19} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{fileMeta}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setReview(null);
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-60"
                  aria-label="Remove selected resume"
                >
                  <XCircle size={17} />
                </button>
              </div>
            )}

            {error && (
              <div className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => void handleReview()}
              disabled={!selectedFile || isLoading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Gauge size={18} />}
              {isLoading ? "Analyzing resume..." : "Analyze Resume"}
            </button>
          </div>

          <div className="min-h-[420px] rounded-lg border bg-background/70 p-4 shadow-sm sm:p-5">
            {!review ? (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Gauge size={26} />
                </div>
                <h3 className="text-lg font-semibold">Your review dashboard will appear here</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  You will see an ATS score, strengths, gaps, formatting feedback, grammar suggestions, and next actions.
                </p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
                  <div className="rounded-lg border bg-card p-5 text-center shadow-sm">
                    <p className="text-xs font-medium uppercase text-muted-foreground">ATS Score</p>
                    <p className={cn("mt-3 text-5xl font-semibold", scoreColor(review.analysis.atsScore))}>
                      {review.analysis.atsScore}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">out of 100</p>
                  </div>
                  <div className="rounded-lg border bg-card p-5 shadow-sm">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Summary</p>
                    <h3 className="mt-2 text-lg font-semibold">{review.fileName}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{review.analysis.summary}</p>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Extracted {review.extractedCharacters.toLocaleString()} characters for analysis.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <FeedbackCard title="Strengths" items={review.analysis.strengths} tone="success" />
                  <FeedbackCard title="Weaknesses" items={review.analysis.weaknesses} tone="danger" />
                  <FeedbackCard title="Missing Skills" items={review.analysis.missingSkills} tone="warning" />
                  <FeedbackCard title="Grammar Suggestions" items={review.analysis.grammarSuggestions} tone="info" />
                  <FeedbackCard title="Formatting Feedback" items={review.analysis.formattingFeedback} tone="info" />
                  <FeedbackCard title="Actionable Recommendations" items={review.analysis.actionableRecommendations} tone="success" />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
