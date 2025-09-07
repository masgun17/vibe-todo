import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignInButton from "./sign-in-button";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/");
  }
  const error = searchParams?.error;
  const errorMessage = (() => {
    if (!error) return "";
    // Map NextAuth error codes to user-friendly message
    switch (error) {
      case "AccessDenied":
      case "OAuthAccountNotLinked":
      case "Callback":
      case "Configuration":
      case "OAuthSignin":
      case "OAuthCallback":
        return "Sign-in failed. Please try again or use a different account.";
      default:
        return "Something went wrong signing you in. Please retry.";
    }
  })();
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-neutral-600">
          Only your allowed email can access this app.
        </p>
        {errorMessage && (
          <div className="text-sm text-red-600">
            {errorMessage}
          </div>
        )}
        <SignInButton />
      </div>
    </div>
  );
}

