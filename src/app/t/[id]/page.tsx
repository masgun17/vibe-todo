import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCompletionsForTodo, getTodoById } from "@/lib/db";
import { notFound } from "next/navigation";
import { updateTodoAction, deleteTodoAction } from "@/app/actions";

export default async function TodoDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return notFound();
  const { id } = params;
  const todo = await getTodoById({ id, userEmail: session.user.email });
  if (!todo) return notFound();
  const completions = await getCompletionsForTodo({ id, userEmail: session.user.email });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit item</h1>
      <form action={updateTodoAction} className="space-y-3 max-w-xl">
        <input type="hidden" name="id" value={todo.id} />
        <label className="block text-sm">Title</label>
        <input
          name="title"
          defaultValue={todo.title}
          className="w-full h-10 px-3 rounded border border-black/10 dark:border-white/10 bg-transparent"
        />
        <label className="block text-sm">Recurrence</label>
        <select
          name="recurrence"
          defaultValue={todo.recurrence}
          className="w-full h-10 px-3 rounded border border-black/10 dark:border-white/10 bg-transparent"
        >
          <option value="none">One-time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <label className="block text-sm">Details</label>
        <textarea
          name="details"
          defaultValue={todo.details ?? ""}
          className="w-full min-h-24 p-3 rounded border border-black/10 dark:border-white/10 bg-transparent"
        />
        <div className="flex gap-2">
          <button className="h-10 px-4 rounded bg-foreground text-background">Save</button>
        </div>
      </form>
      <form action={deleteTodoAction}>
        <input type="hidden" name="id" value={todo.id} />
        <button className="h-9 px-3 rounded border border-red-500 text-red-600">Delete</button>
      </form>

      <section>
        <h2 className="font-medium mb-2">Completions</h2>
        <ul className="text-sm text-neutral-600 list-disc pl-5 space-y-1">
          {completions.map((c) => (
            <li key={c.id}>{c.completed_on}</li>
          ))}
          {completions.length === 0 && <li>None</li>}
        </ul>
      </section>
    </div>
  );
}

