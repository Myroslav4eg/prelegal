"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me", { credentials: "include" })
      .then((response) => {
        if (cancelled) return;
        setStatus(response.ok ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!cancelled) setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") return null;

  return <>{children}</>;
}
