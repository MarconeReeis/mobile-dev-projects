import { Calculator, Droplet, History, Info, RotateCcw, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { toneOf } from "@/components/nutrition/tones";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  macroEnergyEstimate,
  MAIN_GOAL_KEYS,
  OPTIONAL_GOAL_KEYS,
  versionPeriods,
  type Goals,
  type VersionPeriod,
} from "@/domain/nutrition/goals";
import { NUTRIENTS, type NutrientKey } from "@/domain/nutrition/nutrients";
import type { GoalKind, GoalVersion, ISODate } from "@/domain/nutrition/types";
import { WATER_GOAL_PRESETS_ML } from "@/domain/nutrition/water";
import { useDeleteGoalVersion, useGoalVersions, useSaveGoalVersion } from "@/features/goals/api";
import { useToday } from "@/features/profile/api";
import { formatDate } from "@/lib/dates";
import { formatNumber, formatNutrient } from "@/lib/format";
import { cn } from "@/lib/utils";

import { fromGoalForm, sameGoals, toGoalForm, toWaterField, type GoalFormValues } from "./goal-form";

const KIND_LABEL: Record<GoalKind, string> = { target: "Meta a atingir", limit: "Limite máximo" };
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function GoalsPage() {
  const versions = useGoalVersions();

  if (versions.isPending) {
    return (
      <>
        <PageHeader eyebrow="Metas diárias" title="Metas" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Skeleton className="h-[520px]" />
          <Skeleton className="h-80" />
        </div>
      </>
    );
  }
  if (versions.isError) {
    return (
      <>
        <PageHeader eyebrow="Metas diárias" title="Metas" />
        <section className="flex flex-col items-center gap-3 surface px-6 py-12 text-center" role="alert">
          <h2 className="text-xl font-bold">Não foi possível carregar as metas</h2>
          <Button variant="outline" onClick={() => void versions.refetch()}>
            Tentar novamente
          </Button>
        </section>
      </>
    );
  }
  return <GoalsEditor versions={versions.data} />;
}

function GoalsEditor({ versions }: { versions: GoalVersion[] }) {
  const today = useToday();
  const periods = versionPeriods(versions, today);
  const current = periods.find((p) => p.status === "current")?.version;

  // A versão-base do editor: a vigente, ou outra escolhida no histórico ("Usar como base").
  const [base, setBase] = useState<GoalVersion | undefined>(current);
  const [form, setForm] = useState<GoalFormValues>(() => toGoalForm(base?.goals));
  const [water, setWater] = useState(() => toWaterField(base?.waterMl));
  const [startDate, setStartDate] = useState<ISODate>(today);
  const [showErrors, setShowErrors] = useState(false);
  const [confirm, setConfirm] = useState<"replace" | "past" | null>(null);
  const save = useSaveGoalVersion();

  const result = fromGoalForm(form, base?.goals, water);
  const errors = showErrors && !result.ok ? result.errors : {};
  const waterError = showErrors && !result.ok ? result.waterError : undefined;
  const draft: Goals = result.ok ? result.goals : {};
  const dirty = !base || !result.ok || !sameGoals(draft, base.goals) || result.waterMl !== base.waterMl;
  const estimate = macroEnergyEstimate(draft);
  const validDate = ISO_DATE.test(startDate);
  const sameDate = versions.find((v) => v.startDate === startDate);

  function loadBase(version: GoalVersion) {
    setBase(version);
    setForm(toGoalForm(version.goals));
    setWater(toWaterField(version.waterMl));
    setShowErrors(false);
    toast(`Editor preenchido com as metas de ${formatDate(version.startDate)}`, {
      description: "Escolha a data de início e salve para criar uma nova versão.",
    });
  }

  function update(key: NutrientKey, patch: Partial<{ value: string; kind: GoalKind }>) {
    setForm((f) => ({ ...f, [key]: { ...f[key]!, ...patch } }));
  }

  function requestSave() {
    setShowErrors(true);
    if (!result.ok || !validDate || save.isPending) return;
    if (sameDate) setConfirm("replace");
    else if (startDate < today) setConfirm("past");
    else doSave();
  }

  function doSave() {
    if (!result.ok) return;
    save.mutate(
      { startDate, goals: result.goals, waterMl: result.waterMl },
      {
        onSuccess: ({ version, replaced }) => {
          setBase(version);
          setShowErrors(false);
          toast.success(replaced ? "Versão de metas atualizada" : "Nova versão de metas salva", {
            description: `Vale a partir de ${formatDate(version.startDate)}.`,
          });
        },
        onError: () => toast.error("Não foi possível salvar as metas. Tente novamente."),
      },
    );
  }

  const row = (k: NutrientKey) => {
    const field = form[k]!;
    const error = errors[k];
    const id = `meta-${k}`;
    return (
      <li
        key={k}
        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto_140px]"
      >
        <label htmlFor={id} className="flex min-w-0 items-center gap-2.5 font-medium">
          <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", toneOf(k).dot)} aria-hidden />
          <span className="truncate">{NUTRIENTS[k].label}</span>
        </label>
        <div
          className="col-span-2 row-start-2 flex rounded-full bg-muted p-1 sm:col-span-1 sm:row-start-auto"
          role="radiogroup"
          aria-label={`Tipo de ${NUTRIENTS[k].label}`}
        >
          {(["target", "limit"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              role="radio"
              aria-checked={field.kind === kind}
              onClick={() => update(k, { kind })}
              className={cn(
                "flex-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                field.kind === kind ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
              )}
            >
              {KIND_LABEL[kind]}
            </button>
          ))}
        </div>
        <div className="relative col-start-2 row-start-1 w-32 sm:col-start-auto sm:row-start-auto sm:w-auto">
          <Input
            id={id}
            inputMode="decimal"
            value={field.value}
            placeholder="sem meta"
            onChange={(e) => update(k, { value: e.target.value })}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-erro` : undefined}
            className="h-10 rounded-xl pr-12 text-right tabular"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
            {NUTRIENTS[k].unit}
          </span>
        </div>
        {error && (
          <p id={`${id}-erro`} className="col-span-full text-right text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </li>
    );
  };

  return (
    <>
      <PageHeader
        eyebrow={current ? `Vigente desde ${formatDate(current.startDate)}` : "Nenhuma meta vigente hoje"}
        title="Metas"
      />

      <div className="mb-5 flex items-start gap-3 rounded-2xl bg-primary-soft p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          As metas são definidas por você ou pelo seu profissional de saúde. O app não calcula nem prescreve
          metas a partir do seu perfil.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          {base && base.id !== current?.id && (
            <p className="flex items-center justify-between gap-3 rounded-2xl border border-dashed px-4 py-3 text-sm">
              <span>
                Editando a partir das metas de <b className="tabular">{formatDate(base.startDate)}</b>.
              </span>
              {current && (
                <Button variant="ghost" size="sm" onClick={() => loadBase(current)}>
                  Voltar às vigentes
                </Button>
              )}
            </p>
          )}
          <section className="surface p-5 lg:p-6" aria-labelledby="principais">
            <h2 id="principais" className="text-xl font-bold">
              Principais
            </h2>
            <p className="text-sm text-muted-foreground">
              Calorias e macronutrientes são independentes entre si.
            </p>
            <ul className="mt-3 divide-y">{MAIN_GOAL_KEYS.map(row)}</ul>
          </section>
          <section className="surface p-5 lg:p-6" aria-labelledby="hidratacao">
            <h2 id="hidratacao" className="text-xl font-bold">
              Hidratação
            </h2>
            <p className="text-sm text-muted-foreground">
              Meta diária de água, acompanhada no resumo do dia.
            </p>
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
              <label htmlFor="meta-agua" className="flex min-w-0 items-center gap-2.5 font-medium">
                <Droplet className="h-4 w-4 shrink-0 fill-water text-water" aria-hidden />
                <span className="truncate">Água</span>
              </label>
              <div className="relative w-32 sm:w-[140px]">
                <Input
                  id="meta-agua"
                  inputMode="decimal"
                  value={water}
                  placeholder="sem meta"
                  onChange={(e) => setWater(e.target.value)}
                  aria-invalid={!!waterError}
                  aria-describedby={waterError ? "meta-agua-erro" : undefined}
                  className="h-10 rounded-xl pr-10 text-right tabular"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                  ml
                </span>
              </div>
              {waterError && (
                <p
                  id="meta-agua-erro"
                  className="col-span-full text-right text-xs font-medium text-destructive"
                >
                  {waterError}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {WATER_GOAL_PRESETS_ML.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setWater(String(v))}
                  aria-pressed={water === String(v)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium tabular transition-colors",
                    water === String(v)
                      ? "bg-water text-ink"
                      : "bg-water-soft text-water-strong hover:bg-water/25",
                  )}
                >
                  {formatNumber(v / 1000)} L
                </button>
              ))}
            </div>
          </section>
          <section className="surface p-5 lg:p-6" aria-labelledby="opcionais">
            <h2 id="opcionais" className="text-xl font-bold">
              Opcionais
            </h2>
            <p className="text-sm text-muted-foreground">
              Deixe em branco para acompanhar só o consumo, sem barra de progresso.
            </p>
            <ul className="mt-3 divide-y">{OPTIONAL_GOAL_KEYS.map(row)}</ul>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-10 lg:self-start">
          <section className="surface p-5" aria-labelledby="estimativa">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <h2 id="estimativa" className="font-bold">
                Estimativa pelos macros
              </h2>
            </div>
            <p className="mt-3 font-display text-3xl font-bold tabular">
              {estimate === null ? "—" : `≈ ${formatNutrient("kcal", estimate)}`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Proteínas e carboidratos × 4 kcal/g, gorduras × 9 kcal/g. É só uma estimativa: a meta de
              calorias continua {draft.kcal ? formatNutrient("kcal", draft.kcal.value) : "sem valor"}.
            </p>
          </section>

          <section className="space-y-4 surface p-5" aria-labelledby="salvar">
            <h2 id="salvar" className="font-bold">
              Salvar como nova versão
            </h2>
            <div className="space-y-1.5">
              <label htmlFor="inicio" className="text-xs font-medium">
                Data de início
              </label>
              <Input
                id="inicio"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                aria-invalid={!validDate}
                className="h-10 w-48 rounded-xl tabular"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {sameDate
                ? `Já existe uma versão iniciando em ${formatDate(startDate)}; ela será substituída.`
                : validDate && startDate < today
                  ? `Os dias a partir de ${formatDate(startDate)} passarão a usar estas metas.`
                  : "Dias anteriores continuam usando as metas que estavam vigentes na época."}
            </p>
            {showErrors && !result.ok && (
              <p className="text-xs font-medium text-destructive" role="alert">
                {result.empty ? "Defina ao menos uma meta." : "Corrija os valores destacados."}
              </p>
            )}
            <div className="grid gap-2">
              <Button onClick={requestSave} disabled={save.isPending || !validDate || (!dirty && !!sameDate)}>
                <Save /> {save.isPending ? "Salvando…" : "Salvar metas"}
              </Button>
              {dirty && base && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setForm(toGoalForm(base.goals));
                    setWater(toWaterField(base.waterMl));
                    setShowErrors(false);
                  }}
                >
                  <RotateCcw /> Descartar alterações
                </Button>
              )}
            </div>
          </section>

          <HistoryCard periods={periods} onUseAsBase={loadBase} />
        </aside>
      </div>

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "replace" ? "Substituir a versão existente?" : "Aplicar metas a dias passados?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "replace"
                ? `As metas que começam em ${formatDate(startDate)} serão trocadas por estas. Os dias desse período passam a ser comparados com os novos valores.`
                : `A partir de ${formatDate(startDate)}, os dias já registrados passarão a ser comparados com estas metas. Para mudar só daqui para frente, use a data de hoje.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doSave}>
              {confirm === "replace" ? "Substituir" : "Aplicar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function HistoryCard({
  periods,
  onUseAsBase,
}: {
  periods: VersionPeriod[];
  onUseAsBase: (version: GoalVersion) => void;
}) {
  const [deleting, setDeleting] = useState<VersionPeriod | null>(null);
  const remove = useDeleteGoalVersion();

  return (
    <section className="surface p-5" aria-labelledby="historico">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <h2 id="historico" className="font-bold">
          Histórico
        </h2>
      </div>
      {periods.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Nenhuma meta salva ainda. Preencha os valores e salve para começar.
        </p>
      ) : (
        <ol className="mt-4 space-y-3">
          {periods.map((p) => {
            const g = p.version.goals;
            return (
              <li
                key={p.version.id}
                className={cn("rounded-2xl border p-3.5", p.status === "current" && "border-primary-strong")}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold tabular">
                    {formatDate(p.version.startDate)}
                    {p.endDate ? ` – ${formatDate(p.endDate)}` : " em diante"}
                  </p>
                  {p.status !== "past" && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-bold",
                        p.status === "current" ? "bg-primary text-primary-foreground" : "bg-carbs-soft",
                      )}
                    >
                      {p.status === "current" ? "vigente" : "agendada"}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground tabular">
                  {g.kcal ? formatNutrient("kcal", g.kcal.value) : "kcal —"} · P{" "}
                  {g.protein ? formatNutrient("protein", g.protein.value) : "—"} · C{" "}
                  {g.carbs ? formatNutrient("carbs", g.carbs.value) : "—"} · G{" "}
                  {g.fat ? formatNutrient("fat", g.fat.value) : "—"} · Água{" "}
                  {p.version.waterMl ? `${formatNumber(p.version.waterMl / 1000)} L` : "—"}
                </p>
                <div className="mt-2 flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onUseAsBase(p.version)}>
                    Usar como base
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    aria-label={`Excluir versão de ${formatDate(p.version.startDate)}`}
                    onClick={() => setDeleting(p)}
                  >
                    <Trash2 /> Excluir
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir a versão de {deleting && formatDate(deleting.version.startDate)}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Os dias desse período passam a usar a versão anterior, ou ficam sem meta se não houver uma. Os
              registros de alimentos não mudam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleting &&
                remove.mutate(deleting.version.id, {
                  onSuccess: () => toast.success("Versão de metas excluída"),
                  onError: () => toast.error("Não foi possível excluir a versão."),
                })
              }
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
