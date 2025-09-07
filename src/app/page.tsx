import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { addTodoAction, getTodaySummaries, toggleCompleteTodayAction } from "@/app/actions";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Welcome to Vibe Todo</h1>
        <p className="text-sm text-neutral-600">Please sign in to continue.</p>
        <Link
          href="/sign-in"
          className="inline-flex h-10 items-center px-4 rounded bg-foreground text-background"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const { due, completed } = await getTodaySummaries();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Today</h1>
      <form
        action={async (formData) => {
          "use server";
          await addTodoAction(formData);
        }}
        className="flex gap-2"
      >
        <input
          name="title"
          placeholder="Add a task…"
          className="flex-1 h-10 px-3 rounded border border-black/10 dark:border-white/10 bg-transparent"
        />
        <select
          name="recurrence"
          className="h-10 px-3 rounded border border-black/10 dark:border-white/10 bg-transparent"
        >
          <option value="none">One-time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button className="h-10 px-4 rounded bg-foreground text-background">
          Add
        </button>
      </form>

      <section className="space-y-2">
        <h2 className="font-medium">Due</h2>
        <ul className="divide-y divide-black/10 dark:divide-white/10">
          {due.length === 0 && (
            <li className="py-3 text-sm text-neutral-600">Nothing due.</li>
          )}
          {due.map((t) => (
            <li key={t.id} className="py-3 flex items-center gap-3">
              <form
                action={async (formData) => {
                  "use server";
                  await toggleCompleteTodayAction(formData);
                }}
              >
                <input type="hidden" name="todoId" value={t.id} />
                <input type="hidden" name="completed" value={"false"} />
                <button className="w-4 h-4 inline-block rounded border border-black/30 dark:border-white/30" aria-label="Mark complete" />
              </form>
              <Link href={`/t/${t.id}`} className="flex-1 hover:underline">
                {t.title}
              </Link>
              <span className="text-xs text-neutral-500">{t.recurrence}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Completed today</h2>
        <ul className="divide-y divide-black/10 dark:divide-white/10">
          {completed.length === 0 && (
            <li className="py-3 text-sm text-neutral-600">None yet.</li>
          )}
          {completed.map((t) => (
            <li key={t.id} className="py-3 flex items-center gap-3">
              <form
                action={async (formData) => {
                  "use server";
                  await toggleCompleteTodayAction(formData);
                }}
              >
                <input type="hidden" name="todoId" value={t.id} />
                <input type="hidden" name="completed" value={"true"} />
                <button className="w-4 h-4 inline-block rounded border border-black/30 dark:border-white/30 bg-foreground" aria-label="Unmark" />
              </form>
              <Link href={`/t/${t.id}`} className="flex-1 line-through text-neutral-500 hover:underline">
                {t.title}
              </Link>
              <span className="text-xs text-neutral-500">{t.recurrence}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
