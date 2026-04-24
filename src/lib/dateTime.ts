const APP_LOCALE = "en-US";

const longDateFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat(APP_LOCALE);

const timeFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  hour: "2-digit",
  minute: "2-digit",
});

function isSameCalendarDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function formatDate(value: Date | string) {
  return longDateFormatter.format(new Date(value));
}

export function formatShortDate(value: Date | string) {
  return shortDateFormatter.format(new Date(value));
}

export function formatTime(value: Date | string) {
  return timeFormatter.format(new Date(value));
}

export function formatRelativeDate(value: Date | string, now = new Date()) {
  const date = new Date(value);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameCalendarDate(date, now)) return "Today";
  if (isSameCalendarDate(date, yesterday)) return "Yesterday";
  return formatDate(date);
}
