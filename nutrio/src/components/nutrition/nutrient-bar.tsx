import { progress } from "@/domain/nutrition/calculations";
import { NUTRIENTS, type NutrientKey } from "@/domain/nutrition/nutrients";
import type { Goal, Total } from "@/domain/nutrition/types";
import { formatNumber, formatNutrient } from "@/lib/format";
import { cn } from "@/lib/utils";

import { PartialTag } from "./partial-tag";
import { GOAL_KIND_LABEL, toneOf } from "./tones";

/**
 * Consumo de um nutriente com barra de progresso.
 * A barra é limitada a 100%, mas o texto mostra o percentual e o excedente reais.
 */
export function NutrientBar({
  nutrient,
  total,
  goal,
  compact,
}: {
  nutrient: NutrientKey;
  total: Total;
  goal?: Goal;
  compact?: boolean;
}) {
  const tone = toneOf(nutrient);
  const meta = NUTRIENTS[nutrient];
  const p = goal && total.hasData ? progress(total.value, goal.value) : null;
  const kind = goal ? GOAL_KIND_LABEL[goal.kind] : null;

  return (
    <div className={cn("min-w-0", compact ? "space-y-1.5" : "space-y-2")}>
      <p className="flex min-w-0 items-center gap-2 text-sm font-medium">
        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", tone.dot)} aria-hidden />
        <span className="truncate">{meta.label}</span>
      </p>
      <p className="flex flex-wrap items-center gap-x-1.5 tabular">
        <span>
          <span className={cn("font-display font-bold", compact ? "text-xl" : "text-2xl")}>
            {total.hasData ? formatNutrient(nutrient, total.value, false) : "—"}
          </span>
          <span className="text-sm text-muted-foreground">
            {goal ? ` / ${formatNutrient(nutrient, goal.value)}` : ` ${meta.unit}`}
          </span>
        </span>
        {total.partial && <PartialTag />}
      </p>
      {goal ? (
        <>
          <div
            className={cn("h-2 w-full overflow-hidden rounded-full", tone.soft)}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(p?.fill ?? 0)}
            aria-valuetext={p ? `${formatNumber(p.pct, 0)}% da ${kind}` : "sem registros"}
            aria-label={meta.label}
          >
            {p && (
              <div
                className={cn("h-full rounded-full transition-all duration-700", tone.bar)}
                style={{ width: `${p.fill}%` }}
              />
            )}
          </div>
          {p ? (
            <p className={cn("text-xs", p.over ? "font-semibold text-over" : "text-muted-foreground")}>
              {p.over
                ? `${formatNutrient(nutrient, p.diff)} acima ${goal.kind === "limit" ? "do limite" : "da meta"}`
                : goal.kind === "limit"
                  ? `${formatNutrient(nutrient, p.diff)} até o limite`
                  : `Faltam ${formatNutrient(nutrient, p.diff)} para a meta`}
              {` · ${formatNumber(p.pct, 0)}%`}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Sem registros</p>
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground">Sem meta definida</p>
      )}
    </div>
  );
}
