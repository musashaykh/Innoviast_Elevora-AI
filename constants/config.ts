export const APP_CONFIG = {
  name: "Elevora AI",
  description:
    "AI-powered career guidance for students, fresh graduates, and professionals.",
  repositoryUrl: "https://github.com/",
  maxMessageLength: 2000,
  maxTextareaRows: 5,
  defaultModel: "llama-3.3-70b-versatile",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "GitHub", href: "https://github.com/" },
] as const;
