const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATETIME_LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function isSameLocalDateParts(
  date: Date,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number
): boolean {
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute &&
    date.getSeconds() === second
  );
}

function buildLocalDate(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0
): Date | null {
  const date = new Date(year, month - 1, day, hour, minute, second, 0);
  if (Number.isNaN(date.getTime())) return null;
  return isSameLocalDateParts(date, year, month, day, hour, minute, second) ? date : null;
}

export function formatDateTimeLocalInput(date: Date): string {
  return (
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}` +
    `T${pad2(date.getHours())}:${pad2(date.getMinutes())}`
  );
}

export function parseLocalDateTimeInput(value: string): Date | null {
  const match = value.trim().match(DATETIME_LOCAL_RE);
  if (!match) return null;
  return buildLocalDate(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    match[6] ? Number(match[6]) : 0
  );
}

export function normalizeDateTimeLocalValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return '';

  const localDate = parseLocalDateTimeInput(trimmed);
  if (localDate) return formatDateTimeLocalInput(localDate);

  const dateOnlyMatch = trimmed.match(DATE_ONLY_RE);
  if (dateOnlyMatch) {
    return `${dateOnlyMatch[1]}-${dateOnlyMatch[2]}-${dateOnlyMatch[3]}T12:00`;
  }

  const parsedMs = Date.parse(trimmed);
  if (Number.isNaN(parsedMs)) return '';
  return formatDateTimeLocalInput(new Date(parsedMs));
}

export function toIsoFromKnownDateValue(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const localDateTime = parseLocalDateTimeInput(trimmed);
  if (localDateTime) return localDateTime.toISOString();

  const dateOnlyMatch = trimmed.match(DATE_ONLY_RE);
  if (dateOnlyMatch) {
    const localDate = buildLocalDate(
      Number(dateOnlyMatch[1]),
      Number(dateOnlyMatch[2]),
      Number(dateOnlyMatch[3]),
      12,
      0,
      0
    );
    return localDate ? localDate.toISOString() : null;
  }

  const parsedMs = Date.parse(trimmed);
  if (Number.isNaN(parsedMs)) return null;
  return new Date(parsedMs).toISOString();
}

export function formatDateOnlyDisplay(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return '[Not provided]';

  const dateOnlyMatch = trimmed.match(DATE_ONLY_RE);
  if (dateOnlyMatch) {
    return `${dateOnlyMatch[1]}-${dateOnlyMatch[2]}-${dateOnlyMatch[3]}`;
  }

  const localDateTime = parseLocalDateTimeInput(trimmed);
  if (localDateTime) {
    return `${localDateTime.getFullYear()}-${pad2(localDateTime.getMonth() + 1)}-${pad2(localDateTime.getDate())}`;
  }

  const parsedMs = Date.parse(trimmed);
  if (Number.isNaN(parsedMs)) return trimmed;
  const parsed = new Date(parsedMs);
  return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())}`;
}

export function formatDateTimeDisplay(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return 'Not provided';

  const localDateTime = parseLocalDateTimeInput(trimmed);
  if (localDateTime) {
    return formatDateTimeLocalInput(localDateTime).replace('T', ' ');
  }

  const parsedMs = Date.parse(trimmed);
  if (Number.isNaN(parsedMs)) return trimmed;
  return formatDateTimeLocalInput(new Date(parsedMs)).replace('T', ' ');
}
