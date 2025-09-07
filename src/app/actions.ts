"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  deleteTodo as dbDeleteTodo,
  getAllTodos,
  getCompletionsForTodo,
  insertTodo,
  markCompletedOn,
  unmarkCompletedOn,
  updateTodo as dbUpdateTodo,
  type Recurrence,
  type TodoRecord,
} from "@/lib/db";
import { isDueOnDate, toYYYYMMDD } from "@/lib/schedule";
import { revalidatePath } from "next/cache";

async function requireUserEmail(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");
  return session.user.email;
}

export async function addTodoAction(formData: FormData): Promise<void> {
  const userEmail = await requireUserEmail();
  const title = String(formData.get("title") ?? "").trim();
  const recurrence = String(formData.get("recurrence") ?? "none") as Recurrence;
  if (!title) return;
  const id = crypto.randomUUID();
  await insertTodo({ id, userEmail, title, recurrence });
  revalidatePath("/");
}

export async function toggleCompleteTodayAction(formData: FormData): Promise<void> {
  const userEmail = await requireUserEmail();
  const todoId = String(formData.get("todoId"));
  const completed = String(formData.get("completed")) === "true";
  const today = toYYYYMMDD(new Date());
  if (completed) {
    await unmarkCompletedOn({ id: todoId, userEmail, dateYYYYMMDD: today });
  } else {
    await markCompletedOn({ id: todoId, userEmail, dateYYYYMMDD: today });
  }
  revalidatePath("/");
}

export async function updateTodoAction(formData: FormData): Promise<void> {
  const userEmail = await requireUserEmail();
  const id = String(formData.get("id"));
  const title = formData.get("title");
  const details = formData.get("details");
  const recurrence = formData.get("recurrence") as Recurrence | null;
  await dbUpdateTodo({
    id,
    userEmail,
    title: title === null ? undefined : String(title),
    details: details === null ? undefined : String(details),
    recurrence: recurrence ?? undefined,
  });
  revalidatePath("/");
  revalidatePath(`/t/${id}`);
}

export async function deleteTodoAction(formData: FormData): Promise<void> {
  const userEmail = await requireUserEmail();
  const id = String(formData.get("id"));
  await dbDeleteTodo({ id, userEmail });
  revalidatePath("/");
}

export async function getTodaySummaries(): Promise<{
  due: TodoRecord[];
  completed: TodoRecord[];
}> {
  const userEmail = await requireUserEmail();
  const todayDate = new Date();
  const todayStr = toYYYYMMDD(todayDate);
  const todos = await getAllTodos({ userEmail });
  // Which are completed today?
  const completedTodaySet = new Set<string>();
  await Promise.all(
    todos.map(async (t) => {
      const comps = await getCompletionsForTodo({ id: t.id, userEmail });
      if (comps.some((c) => c.completed_on === todayStr)) {
        completedTodaySet.add(t.id);
      }
    })
  );

  // Which one-time are already completed ever?
  const completedEverSet = new Set<string>();
  await Promise.all(
    todos
      .filter((t) => t.recurrence === "none")
      .map(async (t) => {
        const comps = await getCompletionsForTodo({ id: t.id, userEmail });
        if (comps.length > 0) completedEverSet.add(t.id);
      })
  );

  const due: TodoRecord[] = [];
  const completed: TodoRecord[] = [];
  for (const t of todos) {
    if (completedTodaySet.has(t.id)) {
      completed.push(t);
      continue;
    }
    const dueFlag = t.recurrence === "none" ? !completedEverSet.has(t.id) : isDueOnDate(t, todayDate);
    if (dueFlag) due.push(t);
  }
  return { due, completed };
}

