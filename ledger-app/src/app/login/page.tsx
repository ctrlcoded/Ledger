"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ui/ThemeToggle";

type Mode = "signin" | "signup";

const inputClass =
  "w-full px-4 py-3 bg-paper-elevated border border-rule rounded-xl text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent transition-all duration-150";

const labelClass =
  "block text-xs font-medium uppercase tracking-widest text-muted mb-2";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setNotice(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!name.trim()) return setError("Please enter your name.");
    const ageNum = Number(age);
    if (!age || Number.isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      return setError("Please enter a valid age (13–120).");
    }
    if (!email || !password) return setError("Enter an email and password.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: name.trim(), age: ageNum, gender },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setNotice("Almost there — check your email to confirm your account.");
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    // On success the browser redirects to Google; only reached on error.
    if (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  const isSignup = mode === "signup";

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas px-4 py-10">
      {/* Ambient warm glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--accent-soft),transparent)]" />

      {/* Theme toggle */}
      <div className="absolute right-5 top-5 z-10">
        <ThemeToggle />
      </div>

      <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 flex items-center justify-center gap-2.5">
            <Image src="/logo.png" alt="Lekha" width={36} height={36} priority />
            <span className="text-lg font-bold tracking-tight text-ink">Lekha</span>
          </div>

          {/* Heading */}
          <h1 className="text-center text-[2rem] font-bold leading-tight tracking-tight text-ink">
            {isSignup ? (
              <>
                Start your
                <br />
                <span className="text-accent">ledger today.</span>
              </>
            ) : (
              <>
                Every rupee,
                <br />
                <span className="text-accent">accounted for.</span>
              </>
            )}
          </h1>
          <p className="mt-3 text-center text-sm text-muted">
            {isSignup
              ? "Create your account — it takes less than a minute."
              : "Sign in to pick up where your ledger left off."}
          </p>

          {/* Card */}
          <div className="mt-8 rounded-3xl border border-rule bg-paper p-7 shadow-panel">
            {/* Mode tabs */}
            <div className="mb-6 flex rounded-xl border border-rule bg-canvas p-1">
              {(["signin", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                    mode === m
                      ? "bg-paper text-ink shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {m === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-rule bg-paper-elevated px-4 py-3 text-sm font-medium text-ink transition-colors duration-150 hover:border-rule-strong disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              {isSignup ? "Sign up with Google" : "Continue with Google"}
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-rule" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted">
                or {isSignup ? "sign up" : "sign in"} with email
              </span>
              <div className="h-px flex-1 bg-rule" />
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={isSignup ? handleSignUp : handleSignIn}>
              {isSignup && (
                <>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label htmlFor="name" className={labelClass}>Name</label>
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Aryan Raghav"
                        className={inputClass}
                      />
                    </div>
                    <div className="w-24">
                      <label htmlFor="age" className={labelClass}>Age</label>
                      <input
                        id="age"
                        type="number"
                        min={13}
                        max={120}
                        autoComplete="off"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="24"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="gender" className={labelClass}>Gender</label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className={inputClass + " appearance-none cursor-pointer"}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other / Prefer not to say</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className={labelClass}>Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete={isSignup ? "off" : "email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={inputClass}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className={labelClass + " mb-0"}>Password</label>
                  {!isSignup && (
                    <button type="button" className="text-xs text-muted transition-colors hover:text-ink">
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignup ? "At least 6 characters" : "••••••••"}
                  className={inputClass}
                />
              </div>

              {error && <p className="text-sm text-debit">{error}</p>}
              {notice && <p className="text-sm text-credit">{notice}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accent-contrast shadow-card transition-all duration-150 hover:bg-accent-hover hover:shadow-card-hover active:scale-[0.99] disabled:opacity-60"
              >
                {loading
                  ? isSignup
                    ? "Creating account…"
                    : "Signing in…"
                  : isSignup
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>

            {/* Footer link mirrors the tabs */}
            <p className="mt-7 text-center text-sm text-muted">
              {isSignup ? "Already have an account? " : "New to Lekha? "}
              <button
                type="button"
                onClick={() => switchMode(isSignup ? "signin" : "signup")}
                className="font-semibold text-accent transition-colors hover:text-accent-hover"
              >
                {isSignup ? "Sign in" : "Create an account"}
              </button>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            Secured with bank-grade encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
