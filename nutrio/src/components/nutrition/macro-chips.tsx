import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const CHIP = "tabular rounded-full px-2 py-0.5 text-[11px] font-semibold";

const show = (v: number | null) => (v === null ? "—" : `${formatNumber(v)}g`);

/** Proteínas, carboidratos e gorduras de um item. `null` = não informado. */
export function MacroChips({
  protein,
  carbs,
  fat,
}: {
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className={cn(CHIP, "bg-protein-soft")}>P {show(protein)}</span>
      <span className={cn(CHIP, "bg-carbs-soft")}>C {show(carbs)}</span>
      <span className={cn(CHIP, "bg-fat-soft")}>G {show(fat)}</span>
    </div>
  );
}
