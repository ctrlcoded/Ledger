"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
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

  const handleSignUp = async () => {
    setError(null);
    setNotice(null);
    if (!email || !password) {
      setError("Enter an email and password to create an account.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
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
      setNotice("Check your email to confirm your account.");
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="3" y="3" width="4" height="4" rx="0.5" fill="white" />
              <rect x="9" y="3" width="4" height="4" rx="0.5" fill="white" />
              <rect x="3" y="9" width="4" height="4" rx="0.5" fill="white" />
              <rect x="9" y="9" width="4" height="4" rx="0.5" fill="white" />
            </svg>
          </div>
          <span className="font-sans text-lg font-semibold text-ink">Ledger</span>
        </div>

        {/* Tagline */}
        <h1 className="font-sans text-3xl font-bold text-ink mb-2 tracking-tight">
          Every rupee, accounted for.
        </h1>
        <p className="font-sans text-sm text-muted mb-8">Sign in to your ledger.</p>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-paper border border-rule rounded-lg text-sm font-medium text-ink hover:bg-canvas transition-colors duration-150 disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {/* OR Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-rule" />
          <span className="text-xs font-medium text-muted uppercase tracking-widest">
            OR
          </span>
          <div className="flex-1 h-px bg-rule" />
        </div>

        {/* Email / Password Form */}
        <form className="space-y-5" onSubmit={handleEmailSignIn}>
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium uppercase tracking-widest text-muted mb-2"
            >
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-4 py-3 bg-paper border border-rule rounded-lg text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors duration-150"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-widest text-muted"
              >
                PASSWORD
              </label>
              <button
                type="button"
                className="text-xs text-muted hover:text-ink transition-colors duration-150"
              >
                Forgot?
              </button>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-paper border border-rule rounded-lg text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors duration-150"
            />
          </div>

          {error && <p className="text-sm text-debit">{error}</p>}
          {notice && <p className="text-sm text-credit">{notice}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-ink text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity duration-150 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Create Account */}
        <p className="text-center text-sm text-muted mt-8">
          New here?{" "}
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="text-ink font-medium underline hover:opacity-80 transition-opacity duration-150 disabled:opacity-60"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
