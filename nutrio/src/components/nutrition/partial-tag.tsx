const HINT = "Algum alimento não tem este nutriente informado. O total mostra apenas os valores conhecidos.";

export function PartialTag() {
  return (
    <span
      className="shrink-0 rounded-full border border-dashed border-muted-foreground/50 px-1.5 py-px text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
      title={HINT}
    >
      parcial
      <span className="sr-only">: {HINT}</span>
    </span>
  );
}
