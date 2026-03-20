"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { LazySpinner } from "@/components/shared/lazy-spinner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const supabase = createClient();

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/app/settings`,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password reset email sent. Check your inbox.");
      }
      setLoading(false);
      return;
    }

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: email.split("@")[0] } },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setSuccess("Account created! Check your email to verify your account.");
      setLoading(false);
      return;
    }

    router.push("/app/dashboard");
    router.refresh();
  }

  function switchMode(newMode: "login" | "signup" | "forgot") {
    setMode(newMode);
    setError(null);
    setSuccess(null);
  }

  const heading =
    mode === "login"
      ? "Sign in to your account"
      : mode === "signup"
        ? "Create a new account"
        : "Reset your password";

  const submitLabel =
    mode === "login"
      ? "Sign In"
      : mode === "signup"
        ? "Sign Up"
        : "Send Reset Link";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm bg-card rounded-lg border border-border shadow-sm p-8"
      >
        <h1 className="text-xl font-semibold text-center mb-1">Ads Platform</h1>

        <AnimatePresence mode="wait">
          <motion.p
            key={mode}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="text-sm text-muted-foreground text-center mb-6"
          >
            {heading}
          </motion.p>
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.com"
            />
          </div>

          <AnimatePresence mode="wait">
            {mode !== "forgot" && (
              <motion.div
                key="password-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                />
                {mode === "signup" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 6 characters
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                role="alert"
                className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2"
              >
                <p className="text-sm text-destructive">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                role="status"
                className="rounded-md bg-green-50 border border-green-200 px-3 py-2"
              >
                <p className="text-sm text-green-700">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <LazySpinner delay={0} size="sm" />
            ) : null}
            {loading ? "Loading…" : submitLabel}
          </button>
        </form>

        <div className="mt-4 space-y-2 text-center text-sm">
          {mode === "login" && (
            <>
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </button>
              <p className="text-muted-foreground">
                No account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-foreground underline hover:no-underline"
                >
                  Sign up
                </button>
              </p>
            </>
          )}
          {mode === "signup" && (
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-foreground underline hover:no-underline"
              >
                Sign in
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <p className="text-muted-foreground">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-foreground underline hover:no-underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
