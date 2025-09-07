"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          setIsLoading(true);
          await signIn("google", { callbackUrl: "/" });
        } catch {
          setIsLoading(false);
        }
      }}
      disabled={isLoading}
      aria-busy={isLoading}
      className="w-full h-10 rounded bg-foreground text-background hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {isLoading ? "Signing in…" : "Continue with Google"}
    </button>
  );
}

