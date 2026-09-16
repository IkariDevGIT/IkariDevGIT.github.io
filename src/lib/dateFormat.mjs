const postDateFormat = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
  timeZoneName: 'short',
});

export function formatPostDate(value) {
  return postDateFormat.format(value instanceof Date ? value : new Date(value));
}
