import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import type { Recurrence, TodoRecord } from "./db";

export function toYYYYMMDD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isDueOnDate(todo: TodoRecord, date: Date): boolean {
  if (todo.archived) return false;
  const created = startOfDay(new Date(todo.created_at));
  const day = startOfDay(date);
  if (day < created) return false;
  switch (todo.recurrence as Recurrence) {
    case "none":
      // One-time item is considered due until completed
      return true;
    case "daily":
      return true;
    case "weekly": {
      return created.getDay() === day.getDay();
    }
    case "monthly": {
      const createdDay = created.getDate();
      const thisDay = day.getDate();
      // Treat months without createdDay as last day-of-month catch-up
      const nextMonth = new Date(day.getFullYear(), day.getMonth() + 1, 0); // last day of month
      const lastDayOfMonth = nextMonth.getDate();
      const target = Math.min(createdDay, lastDayOfMonth);
      return thisDay === target;
    }
    default:
      return false;
  }
}

export function getDatesForRange(start: Date, end: Date): Date[] {
  const days = differenceInCalendarDays(end, start) + 1;
  return Array.from({ length: Math.max(0, days) }, (_, i) => addDays(start, i));
}

