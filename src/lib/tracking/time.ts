const tallinnParts = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Tallinn",
  year: "numeric",
});

function partsAt(date: Date) {
  const parts = Object.fromEntries(
    tallinnParts
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  return {
    day: parts.day!,
    hour: parts.hour === 24 ? 0 : parts.hour!,
    minute: parts.minute!,
    month: parts.month!,
    year: parts.year!,
  };
}

export function parseTallinnLocalDateTime(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const desired = {
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    month: Number(match[2]),
    year: Number(match[1]),
  };
  const desiredUtc = Date.UTC(
    desired.year,
    desired.month - 1,
    desired.day,
    desired.hour,
    desired.minute,
  );
  let guess = new Date(desiredUtc);
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const actual = partsAt(guess);
    const actualUtc = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
    );
    guess = new Date(guess.valueOf() + desiredUtc - actualUtc);
  }
  const verified = partsAt(guess);
  return Object.entries(desired).every(
    ([key, expected]) => verified[key as keyof typeof verified] === expected,
  )
    ? guess
    : null;
}

export function parseTallinnDate(value: string) {
  return parseTallinnLocalDateTime(`${value.trim()}T12:00`);
}

export function tallinnLocalInput(value: Date | null) {
  if (!value) return "";
  const parts = partsAt(value);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}T${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

export function tallinnDateInput(value: Date | null) {
  return tallinnLocalInput(value).slice(0, 10);
}
