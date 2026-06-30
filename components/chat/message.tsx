"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/chat/copy-button";

interface MessageProps {
  message: ChatMessage;
}

export function Message({ message }: MessageProps) {
  const { resolvedTheme } = useTheme();
  const isUser = message.role === "user";
  const syntaxStyle = resolvedTheme === "dark" ? oneDark : oneLight;

  return (
    <article className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[88%] sm:max-w-[78%]", isUser && "order-2")}>
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-sm leading-6 shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "border bg-card text-card-foreground",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                a: ({ children, href }) => (
                  <a href={href} target="_blank" rel="noreferrer" className="font-medium text-primary underline underline-offset-4">
                    {children}
                  </a>
                ),
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const code = String(children).replace(/\n$/, "");

                  if (match) {
                    return (
                      <div className="my-4 overflow-hidden rounded-lg border">
                        <div className="flex items-center justify-between bg-muted px-3 py-2 text-xs text-muted-foreground">
                          <span>{match[1]}</span>
                          <CopyButton content={code} className="h-7 w-7" />
                        </div>
                        <SyntaxHighlighter
                          language={match[1]}
                          style={syntaxStyle}
                          customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.85rem" }}
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }

                  return (
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]" {...props}>
                      {children}
                    </code>
                  );
                },
                h1: ({ children }) => <h1 className="mb-3 mt-2 text-xl font-semibold">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-2 mt-4 text-lg font-semibold">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-2 mt-3 text-base font-semibold">{children}</h3>,
                ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-5">{children}</ul>,
                ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-5">{children}</ol>,
                p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
                table: ({ children }) => <div className="my-4 overflow-x-auto"><table className="w-full border-collapse text-left text-sm">{children}</table></div>,
                th: ({ children }) => <th className="border bg-muted px-3 py-2 font-semibold">{children}</th>,
                td: ({ children }) => <td className="border px-3 py-2">{children}</td>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        {!isUser && <div className="mt-2"><CopyButton content={message.content} /></div>}
      </div>
    </article>
  );
}
