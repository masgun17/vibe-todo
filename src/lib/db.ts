import { sql } from "@vercel/postgres";

export type Recurrence = "none" | "daily" | "weekly" | "monthly";

export interface TodoRecord {
  id: string;
  user_email: string;
  title: string;
  recurrence: Recurrence;
  details: string | null;
  created_at: string; // ISO from DB
  archived: boolean;
}

export interface CompletionRecord {
  id: string;
  todo_id: string;
  user_email: string;
  completed_on: string; // ISO date (YYYY-MM-DD)
  created_at: string;
}

export async function ensureSchema(): Promise<void> {
  // Tables: todos, completions. String IDs to avoid DB extensions.
  await sql`
    create table if not exists todos (
      id text primary key,
      user_email text not null,
      title text not null,
      recurrence text not null check (recurrence in ('none','daily','weekly','monthly')),
      details text,
      created_at timestamptz not null default now(),
      archived boolean not null default false
    );
  `;

  await sql`
    create table if not exists completions (
      id text primary key,
      todo_id text not null references todos(id) on delete cascade,
      user_email text not null,
      completed_on date not null,
      created_at timestamptz not null default now(),
      unique (todo_id, completed_on)
    );
  `;

  await sql`create index if not exists idx_todos_user on todos(user_email);`;
  await sql`create index if not exists idx_completions_user_date on completions(user_email, completed_on);`;
}

export async function insertTodo(params: {
  id: string;
  userEmail: string;
  title: string;
  recurrence: Recurrence;
  details?: string;
}) {
  const { id, userEmail, title, recurrence, details } = params;
  await ensureSchema();
  await sql`
    insert into todos (id, user_email, title, recurrence, details)
    values (${id}, ${userEmail}, ${title}, ${recurrence}, ${details ?? null});
  `;
}

export async function updateTodo(params: {
  id: string;
  userEmail: string;
  title?: string;
  recurrence?: Recurrence;
  details?: string | null;
  archived?: boolean;
}) {
  await ensureSchema();
  const { id, userEmail, title, recurrence, details, archived } = params;
  // Build a dynamic update using COALESCE on inputs
  await sql`
    update todos
    set title = coalesce(${title ?? null}, title),
        recurrence = coalesce(${recurrence ?? null}, recurrence),
        details = ${details === undefined ? sql`details` : details},
        archived = coalesce(${archived ?? null}, archived)
    where id = ${id} and user_email = ${userEmail};
  `;
}

export async function deleteTodo(params: { id: string; userEmail: string }) {
  const { id, userEmail } = params;
  await ensureSchema();
  await sql`delete from todos where id=${id} and user_email=${userEmail};`;
}

export async function getAllTodos(params: { userEmail: string }): Promise<TodoRecord[]> {
  await ensureSchema();
  const { userEmail } = params;
  const res = await sql<TodoRecord>`
    select * from todos
    where user_email=${userEmail}
    order by created_at desc
  `;
  return res.rows;
}

export async function getTodoById(params: { id: string; userEmail: string }): Promise<TodoRecord | null> {
  await ensureSchema();
  const { id, userEmail } = params;
  const res = await sql<TodoRecord>`
    select * from todos where id=${id} and user_email=${userEmail}
  `;
  return res.rows[0] ?? null;
}

export async function getCompletionsForTodo(params: { id: string; userEmail: string }) {
  await ensureSchema();
  const { id, userEmail } = params;
  const res = await sql<CompletionRecord>`
    select * from completions where todo_id=${id} and user_email=${userEmail} order by completed_on desc
  `;
  return res.rows;
}

export async function markCompletedOn(params: { id: string; userEmail: string; dateYYYYMMDD: string }) {
  await ensureSchema();
  const { id, userEmail, dateYYYYMMDD } = params;
  const completionId = crypto.randomUUID();
  await sql`
    insert into completions (id, todo_id, user_email, completed_on)
    values (${completionId}, ${id}, ${userEmail}, ${dateYYYYMMDD})
    on conflict (todo_id, completed_on) do nothing;
  `;
}

export async function unmarkCompletedOn(params: { id: string; userEmail: string; dateYYYYMMDD: string }) {
  await ensureSchema();
  const { id, userEmail, dateYYYYMMDD } = params;
  await sql`delete from completions where todo_id=${id} and user_email=${userEmail} and completed_on=${dateYYYYMMDD};`;
}

export async function listCompletions(params: { userEmail: string; limit?: number }) {
  await ensureSchema();
  const { userEmail, limit = 100 } = params;
  const res = await sql<CompletionRecord & { title: string }>`
    select c.*, t.title from completions c
    join todos t on t.id=c.todo_id
    where c.user_email=${userEmail}
    order by c.completed_on desc, c.created_at desc
    limit ${limit}
  `;
  return res.rows;
}

