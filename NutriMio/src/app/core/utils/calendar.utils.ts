import { CalendarDay, DayStatus } from '../../models';

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;
const CALENDAR_HEADERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const;

export function toDateKeyFromParts(year: number, month: number, day: number): string {
  const monthStr = String(month + 1).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatMonthYear(date: Date): string {
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function getWeekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

export function getCalendarHeaders(): readonly string[] {
  return CALENDAR_HEADERS;
}

export function buildCalendarDays(
  year: number,
  month: number,
  todayKey: string,
  statusByDate: Map<string, DayStatus>,
): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: CalendarDay[] = [];

  for (let i = 0; i < 42; i++) {
    let dayNumber: number;
    let cellMonth = month;
    let cellYear = year;
    let isCurrentMonth = true;

    if (i < startOffset) {
      dayNumber = daysInPrevMonth - startOffset + i + 1;
      cellMonth = month - 1;
      isCurrentMonth = false;
      if (cellMonth < 0) {
        cellMonth = 11;
        cellYear -= 1;
      }
    } else if (i >= startOffset + daysInMonth) {
      dayNumber = i - startOffset - daysInMonth + 1;
      cellMonth = month + 1;
      isCurrentMonth = false;
      if (cellMonth > 11) {
        cellMonth = 0;
        cellYear += 1;
      }
    } else {
      dayNumber = i - startOffset + 1;
    }

    const dateKey = toDateKeyFromParts(cellYear, cellMonth, dayNumber);

    cells.push({
      dateKey,
      dayNumber,
      isCurrentMonth,
      isToday: dateKey === todayKey,
      status: isCurrentMonth ? (statusByDate.get(dateKey) ?? 'none') : 'none',
    });
  }

  return cells;
}

export function getWeekStart(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = result.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  result.setDate(result.getDate() + diff);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}
