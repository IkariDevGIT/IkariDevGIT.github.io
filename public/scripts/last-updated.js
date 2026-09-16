const time = document.getElementById('last-updated-at');
const out = document.getElementById('last-updated-ago');

function plural(value, unit) {
  return `${value} ${unit}${value === 1 ? '' : 's'}`;
}

function timeAgo(then, now) {
  const minutes = Math.floor((now - then) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${plural(minutes, 'minute')} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${plural(hours, 'hour')} ago`;

  let years = now.getUTCFullYear() - then.getUTCFullYear();
  let months = now.getUTCMonth() - then.getUTCMonth();
  let days = now.getUTCDate() - then.getUTCDate();
  let leftoverHours = now.getUTCHours() - then.getUTCHours();

  if (leftoverHours < 0) {
    leftoverHours += 24;
    days -= 1;
  }
  if (days < 0) {
    const daysInPrevMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)).getUTCDate();
    days += daysInPrevMonth;
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const parts = [];
  if (years > 0) {
    parts.push(plural(years, 'year'));
    if (months > 0) parts.push(plural(months, 'month'));
    if (days > 0) parts.push(plural(days, 'day'));
  } else if (months > 0) {
    parts.push(plural(months, 'month'));
    if (days > 0) parts.push(plural(days, 'day'));
  } else {
    parts.push(plural(days, 'day'));
    if (leftoverHours > 0) parts.push(plural(leftoverHours, 'hour'));
  }

  return `${parts.join(', ')} ago`;
}

if (time?.dateTime && out) {
  out.textContent = timeAgo(new Date(time.dateTime), new Date());
}
