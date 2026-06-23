export function toDateKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function formatHeaderDate(date: Date = new Date()): string {
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatTime(time: string): string {
  return time;
}
