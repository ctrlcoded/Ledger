"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/components/providers/UserProvider";

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Time-of-day greeting + first name, read from the already-loaded profile.
 * The greeting is derived from the user's LOCAL time, so it is computed in an
 * effect (after mount) to avoid a server/client hydration mismatch. Falls back
 * to just the greeting when first_name is empty (no "undefined").
 */
export default function Greeting({ className = "" }: { className?: string }) {
  const user = useUser();
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(greetingFor(new Date().getHours()));
  }, []);

  // Hold space until the client-side greeting is known (avoids layout shift/flash).
  if (!greeting) return null;

  const first = user?.firstName?.trim();

  return (
    <h1 className={`${className} font-serif font-normal tracking-tight text-ink break-words`}>
      {greeting}
      {first && <span className="italic">, {first}</span>}
    </h1>
  );
}
