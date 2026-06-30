import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";

export function Footer() {
  return (
    <footer id="about" className="border-t bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="" width={32} height={32} />
            <span className="font-semibold">{APP_CONFIG.name}</span>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            A focused AI assistant for career planning, resumes, interviews, certifications, and professional growth.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:items-end">
          <Link href={APP_CONFIG.repositoryUrl} className="inline-flex items-center gap-2 hover:text-foreground" target="_blank" rel="noreferrer">
            <ExternalLink size={17} />
            GitHub
          </Link>
          <p>Made with Next.js, Groq & TypeScript.</p>
          <p>Copyright {new Date().getFullYear()} Elevora AI.</p>
        </div>
      </div>
    </footer>
  );
}
