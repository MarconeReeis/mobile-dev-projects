import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ISODate } from "@/domain/nutrition/types";
import { addDays, formatDate, parseISODate, weekdayShort } from "@/lib/dates";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function DateStrip({
  value,
  today,
  onChange,
}: {
  value: ISODate;
  today: ISODate;
  onChange: (date: ISODate) => void;
}) {
  // Semana terminando hoje quando a data está nela; senão, centrada na data.
  const end = value > addDays(today, -7) && value <= today ? today : addDays(value, 3);
  const days = Array.from({ length: 7 }, (_, i) => addDays(end, i - 6));
  const d = parseISODate(value);

  return (
    <div className="surface p-4 sm:p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold">
            {MONTHS[d.getMonth()]} {d.getFullYear()}
          </p>
          <p className="text-xs text-muted-foreground tabular">{formatDate(value)}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="icon-sm"
            aria-label="Dia anterior"
            onClick={() => onChange(addDays(value, -1))}
          >
            <ChevronLeft />
          </Button>
          <Button variant={value === today ? "ink" : "secondary"} size="sm" onClick={() => onChange(today)}>
            Hoje
          </Button>
          <Button
            variant="secondary"
            size="icon-sm"
            aria-label="Próximo dia"
            onClick={() => onChange(addDays(value, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-3">
        {days.map((day) => {
          const selected = day === value;
          const future = day > today;
          return (
            <button
              key={day}
              onClick={() => onChange(day)}
              aria-pressed={selected}
              aria-label={`${formatDate(day)}${day === today ? " (hoje)" : ""}`}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl py-2.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selected ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                future && !selected && "opacity-40",
              )}
            >
              <span className={cn("text-[11px] font-medium", !selected && "text-muted-foreground")}>
                {weekdayShort(day)}
              </span>
              <span className="font-display text-lg font-bold tabular">{parseISODate(day).getDate()}</span>
              <span
                className={cn(
                  "h-1 w-1 rounded-full",
                  day === today
                    ? selected
                      ? "bg-primary-foreground"
                      : "bg-primary-strong"
                    : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
