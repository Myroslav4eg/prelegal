"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import ThemeToggle from "@/components/ThemeToggle";

type Mode = "signin" | "signup";

const COPY: Record<Mode, { heading: string; subheading: string }> = {
  signin: { heading: "Welcome back", subheading: "Log in to keep building your agreements." },
  signup: { heading: "Create your account", subheading: "Start drafting legal agreements in minutes." },
};

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const { heading, subheading } = COPY[mode];

  return (
    <div className="flex min-h-full flex-1">
      <div className="hidden flex-1 flex-col justify-between bg-dark-navy p-10 text-white lg:flex">
        <Logo inverted />
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-bold">Draft legal agreements in minutes, not days.</h2>
          <p className="max-w-md text-sm text-white/70">
            Chat with an AI assistant to fill in any of our supported agreement templates, then
            download a ready-to-sign PDF.
          </p>
        </div>
        <p className="text-xs text-white/50">&copy; {new Date().getFullYear()} Prelegal</p>
      </div>

      <div className="flex flex-1 flex-col gap-8 px-6 py-10">
        <div className="flex items-center justify-between lg:justify-end">
          <span className="lg:hidden">
            <Logo />
          </span>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <header className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold text-dark-navy dark:text-foreground">{heading}</h1>
            <p className="text-sm text-gray-text">{subheading}</p>
          </header>

          {mode === "signin" ? <LoginForm /> : <SignupForm />}

          <p className="text-sm text-foreground/60">
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-blue-primary hover:underline"
            >
              {mode === "signin" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
