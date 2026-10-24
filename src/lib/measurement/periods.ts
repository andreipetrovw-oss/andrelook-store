import {
  parseTallinnLocalDateTime,
  tallinnDateInput,
} from "@/lib/tracking/time";
export function calendarDay(value: string, offset = 0) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Invalid date");
  const d = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(d.valueOf()) || d.toISOString().slice(0, 10) !== value)
    throw new Error("Invalid date");
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}
export function reportingPeriod(from: string, through: string) {
  const start = parseTallinnLocalDateTime(`${from}T00:00`);
  const end = parseTallinnLocalDateTime(`${calendarDay(through, 1)}T00:00`);
  if (!start || !end || end <= start)
    throw new Error("Invalid reporting period");
  return {
    from: start,
    to: end,
    spendFrom: new Date(`${from}T00:00:00Z`),
    spendTo: new Date(`${calendarDay(through, 1)}T00:00:00Z`),
  };
}
export function businessDay(now = new Date()) {
  return tallinnDateInput(now);
}
