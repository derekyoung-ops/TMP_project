export function normalizeDateMeta(date) {
  // Parse date string directly to avoid timezone issues
  // If date is a string like "2026-01-22", parse it directly
  let year, month, day;
  
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}/)) {
    // Parse YYYY-MM-DD format directly
    const parts = date.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10); // month is 1-12 from string
    day = parseInt(parts[2], 10);
  } else {
    // Fallback to Date object parsing
    const d = new Date(date);
    year = d.getFullYear();
    month = d.getMonth() + 1;
    day = d.getDate();
  }

  const quarter = Math.ceil(month / 3);

  // Calculate week of month
  // Create a date object for the first day of the month to get its day of week
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const week = Math.ceil((day + firstDayOfMonth.getDay()) / 7);

  return {
    date: new Date(Date.UTC(year, month - 1, day)), // month is 0-indexed in Date constructor
    year,
    month,
    quarter,
    week,
  };
}