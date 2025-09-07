"use client";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-neutral-600">
          Only your allowed email can access this app.
        </p>
        <button
          onClick={() => signIn("google")}
          className="w-full h-10 rounded bg-foreground text-background hover:opacity-90"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}

