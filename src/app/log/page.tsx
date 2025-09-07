import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { listCompletions } from "@/lib/db";

export default async function LogPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Log</h1>
        <p className="text-sm text-neutral-600">Please sign in to view your log.</p>
        <Link href="/sign-in" className="inline-flex h-10 items-center px-4 rounded bg-foreground text-background">
          Sign in
        </Link>
      </div>
    );
  }

  const items = await listCompletions({ userEmail: session.user.email! });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Log</h1>
      <ul className="divide-y divide-black/10 dark:divide-white/10">
        {items.length === 0 && (
          <li className="py-3 text-sm text-neutral-600">No activity yet.</li>
        )}
        {items.map((c) => (
          <li key={c.id} className="py-3 text-sm">
            <span className="font-medium">{c.title}</span>
            <span className="text-neutral-500"> · {c.completed_on}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

