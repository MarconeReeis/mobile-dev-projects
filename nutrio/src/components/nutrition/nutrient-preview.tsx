import { scaleNutrient } from "@/domain/nutrition/calculations";
import { NUTRIENTS, type NutrientKey } from "@/domain/nutrition/nutrients";
import type { FoodBase, Nutrients } from "@/domain/nutrition/types";
import { formatNumber, formatNutrient } from "@/lib/format";

import { PartialTag } from "./partial-tag";

const PREVIEW_KEYS: NutrientKey[] = ["kcal", "protein", "carbs", "fat", "fiber", "sodium"];

/** Prévia dos nutrientes de uma quantidade. `amount` nulo = quantidade inválida. */
export function NutrientPreview({
  per100,
  base,
  amount,
}: {
  per100: Nutrients;
  base: FoodBase;
  amount: number | null;
}) {
  return (
    <div className="rounded-2xl bg-primary-soft p-4" aria-live="polite">
      <p className="text-xs font-semibold tracking-wider text-accent-foreground uppercase">
        Prévia · {amount !== null ? `${formatNumber(amount)} ${base}` : "quantidade inválida"}
      </p>
      <dl className="mt-3 grid grid-cols-3 gap-3">
        {PREVIEW_KEYS.map((k) => {
          const v = amount !== null ? scaleNutrient(per100, k, amount) : null;
          return (
            <div key={k}>
              <dt className="text-xs text-muted-foreground">{NUTRIENTS[k].label.split(" ")[0]}</dt>
              <dd className="font-display text-lg font-bold tabular">
                {v === null ? "—" : formatNutrient(k, v)}
              </dd>
            </div>
          );
        })}
      </dl>
      {PREVIEW_KEYS.some((k) => per100[k] == null) && (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <PartialTag /> Alguns nutrientes não foram informados no cadastro.
        </p>
      )}
    </div>
  );
}
