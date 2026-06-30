import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";

export function Hero() {
  return (
    <section id="home" className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-24">
      <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
          <Sparkles size={16} className="text-primary" />
          Focused career guidance, not a general chatbot
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
          Elevate Your Career with AI
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground lg:mx-0">
          {APP_CONFIG.description}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
          <Link
            href="#chat"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Start Chatting
            <ArrowRight size={18} />
          </Link>
          <Link
            href="#features"
            className="inline-flex h-12 items-center justify-center rounded-md border bg-card px-6 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Learn More
          </Link>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-xl">
        <Image
          src="/hero.svg"
          alt="AI career guidance dashboard illustration"
          width={620}
          height={500}
          priority
          className="h-auto w-full"
        />
      </div>
    </section>
  );
}
