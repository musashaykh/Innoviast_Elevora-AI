"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { APP_CONFIG, NAV_LINKS } from "@/constants/config";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="#home" className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4" onClick={closeMenu}>
          <Image src="/logo.svg" alt="" width={34} height={34} priority />
          <span className="text-lg font-semibold tracking-normal">{APP_CONFIG.name}</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4"
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border bg-card text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4"
            aria-label="Toggle theme"
          >
            {isMounted && isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            href="#chat"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Start Chatting
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border bg-card md:hidden"
          onClick={() => setIsOpen((current) => !current)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <div className={cn("border-t bg-background px-4 py-4 md:hidden", !isOpen && "hidden")}>
        <div className="mx-auto flex max-w-7xl flex-col gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={closeMenu}
              className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border bg-card text-sm font-medium"
              aria-label="Toggle theme"
            >
              {isMounted && isDark ? <Sun size={18} /> : <Moon size={18} />}
              Theme
            </button>
            <Link
              href="#chat"
              onClick={closeMenu}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Start Chatting
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
