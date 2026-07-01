"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, Sparkles, TrendingUp } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden border-b">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.86),rgba(241,245,249,0.72))] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(96,165,250,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(52,211,153,0.14),transparent_28%),linear-gradient(135deg,rgba(2,6,23,0.96),rgba(15,23,42,0.9))]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-20 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-20 lg:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-xl">
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
        <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
          {[
            { label: "Roadmaps generated", value: "12-week plans", icon: TrendingUp },
            { label: "Portfolio ready", value: "Resume + interview prep", icon: BriefcaseBusiness },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className="rounded-lg border bg-card/70 p-4 shadow-sm backdrop-blur-xl">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                  <Icon size={15} className="text-emerald-500" />
                  {stat.label}
                </div>
                <p className="text-sm font-semibold">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
        className="relative mx-auto w-full max-w-xl"
      >
        <div className="absolute -inset-4 rounded-lg border bg-card/50 shadow-2xl backdrop-blur-xl" />
        <Image
          src="/hero.svg"
          alt="AI career guidance dashboard illustration"
          width={620}
          height={500}
          priority
          className="relative h-auto w-full"
        />
      </motion.div>
      </div>
    </section>
  );
}
