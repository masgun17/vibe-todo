import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { getAllTodos } from "@/lib/db";
import { getDatesForRange, isDueOnDate, toYYYYMMDD } from "@/lib/schedule";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <p className="text-sm text-neutral-600">Please sign in to view your calendar.</p>
        <Link href="/sign-in" className="inline-flex h-10 items-center px-4 rounded bg-foreground text-background">
          Sign in
        </Link>
      </div>
    );
  }

  const userEmail = email;
  const todos = await getAllTodos({ userEmail });
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const days = getDatesForRange(start, end);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Calendar</h1>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const due = todos.filter((t) => isDueOnDate(t, d));
          return (
            <div key={d.toISOString()} className="border border-black/10 dark:border-white/10 rounded p-2 min-h-24">
              <div className="text-xs text-neutral-500 mb-1">{toYYYYMMDD(d)}</div>
              <ul className="space-y-1">
                {due.slice(0, 3).map((t) => (
                  <li key={t.id} className="text-xs truncate">
                    <Link href={`/t/${t.id}`} className="hover:underline">
                      {t.title}
                    </Link>
                  </li>
                ))}
                {due.length > 3 && (
                  <li className="text-[10px] text-neutral-500">+{due.length - 3} more</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

