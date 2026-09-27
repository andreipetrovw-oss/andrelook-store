const ownerTimeZone = "Europe/Tallinn";

function partsFor(value: Date) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      month: "2-digit",
      timeZone: ownerTimeZone,
      year: "numeric",
    })
      .formatToParts(value)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

export function formatOwnerDateTimeInput(value: Date | null | undefined) {
  if (!value) return "";
  const parts = partsFor(value);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function parseOwnerDateTimeInput(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(trimmed);
  if (!match) throw new Error("Проверьте дату и время следующего действия.");

  const [, year, month, day, hour, minute] = match;
  const target = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );
  let result = new Date(target);

  // Convert the owner's Tallinn wall-clock input into UTC. Repeating once
  // handles the different winter/summer offsets around DST boundaries.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = partsFor(result);
    const represented = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
    );
    result = new Date(result.getTime() + (target - represented));
  }

  if (formatOwnerDateTimeInput(result) !== trimmed) {
    throw new Error(
      "Это местное время невозможно выбрать из-за перевода часов.",
    );
  }
  return result;
}

export function formatDateInput(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export function parseDateInput(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error("Проверьте дату.");
  }
  const result = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(result.getTime()) || formatDateInput(result) !== trimmed) {
    throw new Error("Проверьте дату.");
  }
  return result;
}
