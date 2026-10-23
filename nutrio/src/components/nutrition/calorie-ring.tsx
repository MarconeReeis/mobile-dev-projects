import { progress } from "@/domain/nutrition/calculations";
import type { Goal } from "@/domain/nutrition/types";
import { formatNumber, formatNutrient } from "@/lib/format";
import { cn } from "@/lib/utils";

const SIZE = 184;
const STROKE = 16;
const ARC = 0.75; // arco de 270°

/** Anel de calorias. Sem dados mostra "—"; sem meta mostra só o consumo. */
export function CalorieRing({
  consumed,
  hasData,
  goal,
}: {
  consumed: number;
  hasData: boolean;
  goal?: Goal;
}) {
  const r = (SIZE - STROKE) / 2;
  const c = 2 * Math.PI * r;
  const p = goal ? progress(consumed, goal.value) : null;
  const len = c * ARC * ((p?.fill ?? 0) / 100);

  return (
    <div className="relative grid place-items-center" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="rotate-[135deg]" aria-hidden>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={r}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          className="stroke-primary-soft"
          strokeDasharray={`${c * ARC} ${c}`}
        />
        {p && hasData && (
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={r}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            className={cn("transition-all duration-700", p.over ? "stroke-over" : "stroke-primary")}
            strokeDasharray={`${len} ${c}`}
          />
        )}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          {p && hasData ? (
            <>
              <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {p.over ? "Acima da meta" : "Restam"}
              </p>
              <p className="font-display text-4xl font-bold tabular">
                {formatNutrient("kcal", p.diff, false)}
              </p>
              <p className="text-xs text-muted-foreground">kcal · {formatNumber(p.pct, 0)}%</p>
            </>
          ) : (
            <>
              <p className="font-display text-4xl font-bold tabular">
                {hasData ? formatNutrient("kcal", consumed, false) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">{hasData ? "kcal consumidas" : "sem registros"}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
