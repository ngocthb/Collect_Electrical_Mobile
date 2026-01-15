export const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Format an ISO timestamp (or Date) into `dd/MM/yyyy HH:mm` in local timezone.
 * Returns empty string for falsy/invalid input.
 */
export function formatTimestamp(input?: string | Date | null): string {
  if (!input) return '';
  const d = typeof input === 'string' ? new Date(input) : new Date(input);
  if (Number.isNaN(d.getTime())) return '';

  const day = pad2(d.getDate());
  const month = pad2(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad2(d.getHours());
  const minutes = pad2(d.getMinutes());

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export function formatTime(input?: string | Date | null): string {
  if (!input) return '';
  const d = typeof input === 'string' ? new Date(input) : new Date(input);
  if (Number.isNaN(d.getTime())) return '';

  const hours = pad2(d.getHours());
  const minutes = pad2(d.getMinutes());
  const second = pad2(d.getSeconds());

  return `${hours}:${minutes}:${second}`;
}

export default { formatTimestamp, formatDate, formatTime };
