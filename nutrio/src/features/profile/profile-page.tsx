import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FileText, Info, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Controller, useForm, useWatch, type FieldError } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { isDemo } from "@/data";
import { getSupabase } from "@/data/supabase/client";
import { ACTIVITY_LABEL, initials, OBJECTIVE_LABEL, type Profile } from "@/domain/profile/types";
import {
  useDeleteAccount,
  useExportData,
  useProfile,
  useToday,
  useUpdateProfile,
} from "@/features/profile/api";
import { cn } from "@/lib/utils";

import {
  profileFormSchema,
  BRAZIL_TIME_ZONES,
  otherTimeZones,
  toProfileForm,
  toProfileInput,
  UNSET,
  type ProfileFormValues,
} from "./profile-form";

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function ProfilePage() {
  const profile = useProfile();

  return (
    <>
      <PageHeader eyebrow="Sua conta" title="Perfil" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {profile.isPending ? (
          <Skeleton className="h-[560px]" />
        ) : profile.isError ? (
          <section className="flex flex-col items-center gap-3 surface px-6 py-12 text-center" role="alert">
            <h2 className="text-xl font-bold">Não foi possível carregar o perfil</h2>
            <Button variant="outline" onClick={() => void profile.refetch()}>
              Tentar novamente
            </Button>
          </section>
        ) : (
          // Remonta o formulário quando o perfil salvo muda (ex.: depois de excluir a conta).
          <ProfileForm key={JSON.stringify(profile.data)} profile={profile.data} />
        )}
        <aside className="space-y-5">
          <PrivacyCard />
          <AccountCard />
          <LegalCard />
        </aside>
      </div>
    </>
  );
}

function ProfileForm({ profile }: { profile: Profile }) {
  const today = useToday();
  const update = useUpdateProfile();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: toProfileForm(profile),
  });
  const { errors, isDirty } = form.formState;
  const zones = otherTimeZones(profile.timezone);
  const timezone = useWatch({ control: form.control, name: "timezone" });

  function onSubmit(values: ProfileFormValues) {
    update.mutate(toProfileInput(values), {
      onSuccess: (saved) => {
        form.reset(toProfileForm(saved));
        toast.success("Perfil atualizado");
      },
      onError: (e) => toast.error(e.message || "Não foi possível salvar o perfil."),
    });
  }

  return (
    <form className="surface p-5 lg:p-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="mb-6 flex items-center gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary font-display text-2xl font-bold text-primary-foreground">
          {initials(profile) || "?"}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold">{profile.name || "Sem nome"}</h2>
          <p className="truncate text-sm text-muted-foreground">
            {profile.email || "E-mail definido no login"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="nome" label="Nome" error={errors.name} className="sm:col-span-2">
          <Input
            id="nome"
            autoComplete="name"
            className="h-11 rounded-xl"
            aria-invalid={!!errors.name}
            {...form.register("name")}
          />
        </Field>
        <Field id="nasc" label="Data de nascimento" optional error={errors.birthDate}>
          <Input
            id="nasc"
            type="date"
            max={today}
            className="h-11 rounded-xl"
            aria-invalid={!!errors.birthDate}
            {...form.register("birthDate")}
          />
        </Field>
        <Field
          id="tz"
          label="Fuso horário"
          error={errors.timezone}
          hint={
            <>
              Define o “hoje” do diário.{" "}
              {timezone !== BROWSER_TZ && (
                <button
                  type="button"
                  className="font-semibold text-primary-strong underline-offset-2 hover:underline"
                  onClick={() => form.setValue("timezone", BROWSER_TZ, { shouldDirty: true })}
                >
                  Usar o do navegador ({BROWSER_TZ})
                </button>
              )}
            </>
          }
        >
          <select
            id="tz"
            className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            {...form.register("timezone")}
          >
            <optgroup label="Brasil">
              {BRAZIL_TIME_ZONES.map(({ zone, label }) => (
                <option key={zone} value={zone}>
                  {label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Outros">
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z.replaceAll("_", " ")}
                </option>
              ))}
            </optgroup>
          </select>
        </Field>
        <Field id="peso" label="Peso (kg)" optional error={errors.weightKg}>
          <Input
            id="peso"
            inputMode="decimal"
            placeholder="não informado"
            className="h-11 rounded-xl"
            aria-invalid={!!errors.weightKg}
            {...form.register("weightKg")}
          />
        </Field>
        <Field id="altura" label="Altura (cm)" optional error={errors.heightCm}>
          <Input
            id="altura"
            inputMode="decimal"
            placeholder="não informado"
            className="h-11 rounded-xl"
            aria-invalid={!!errors.heightCm}
            {...form.register("heightCm")}
          />
        </Field>
        <Field id="atividade" label="Nível de atividade" optional>
          <Controller
            control={form.control}
            name="activityLevel"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="atividade" className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>Prefiro não informar</SelectItem>
                  {Object.entries(ACTIVITY_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field id="objetivo" label="Objetivo" optional>
          <Controller
            control={form.control}
            name="objective"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="objetivo" className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>Prefiro não informar</SelectItem>
                  {Object.entries(OBJECTIVE_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-muted p-3.5 text-xs text-muted-foreground">
        <Info className="mt-px h-3.5 w-3.5 shrink-0" />
        Esses dados servem apenas como contexto do seu acompanhamento. Eles não geram metas nem recomendações
        automáticas: as metas são definidas por você ou por um profissional.
      </p>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {isDirty && (
          <Button type="button" variant="ghost" onClick={() => form.reset()}>
            Descartar alterações
          </Button>
        )}
        <Button type="submit" disabled={!isDirty || update.isPending}>
          {update.isPending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}

function PrivacyCard() {
  const exportData = useExportData();

  function download() {
    exportData.mutate(undefined, {
      onSuccess: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nutrio-dados-${data.exportedAt.slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Arquivo de dados gerado", {
          description: `${data.foods.length} alimentos, ${data.meals.length} refeições e ${data.goalVersions.length} versões de metas.`,
        });
      },
      onError: () => toast.error("Não foi possível exportar os dados."),
    });
  }

  return (
    <section className="surface p-5" aria-labelledby="privacidade">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary-strong" />
        <h2 id="privacidade" className="font-bold">
          Privacidade
        </h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Peso, medidas e histórico alimentar são privados. O app não envia esses dados para ferramentas de
        análise.
      </p>
      <Button variant="outline" className="mt-4 w-full" onClick={download} disabled={exportData.isPending}>
        <Download /> {exportData.isPending ? "Gerando arquivo…" : "Exportar meus dados (JSON)"}
      </Button>
    </section>
  );
}

const CONFIRM_WORD = "EXCLUIR";

function AccountCard() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const deleteAccount = useDeleteAccount();
  const confirmed = typed.trim().toUpperCase() === CONFIRM_WORD;

  return (
    <section className="surface p-5" aria-labelledby="conta">
      <h2 id="conta" className="font-bold">
        Conta
      </h2>
      {isDemo ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No modo demonstração não há login. Configure o Supabase para usar uma conta.
        </p>
      ) : (
        <Button
          variant="secondary"
          className="mt-4 w-full"
          disabled={signingOut}
          onClick={async () => {
            setSigningOut(true);
            const { error } = await getSupabase().auth.signOut();
            setSigningOut(false);
            if (error) toast.error("Não foi possível sair. Tente novamente.");
          }}
        >
          <LogOut /> {signingOut ? "Saindo…" : "Sair"}
        </Button>
      )}
      <Button
        variant="ghost"
        className="mt-2 w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => {
          setTyped("");
          setOpen(true);
        }}
      >
        <Trash2 /> Excluir conta
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Serão removidos:</p>
                <ul className="list-disc space-y-0.5 pl-5">
                  <li>seu perfil (nome, nascimento, peso, altura, objetivo);</li>
                  <li>todos os alimentos cadastrados e suas porções;</li>
                  <li>todas as refeições e registros alimentares;</li>
                  <li>todo o histórico de metas.</li>
                </ul>
                <p>Essa ação não pode ser desfeita. Se quiser guardar uma cópia, exporte seus dados antes.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="confirmar-exclusao">
              Digite <b>{CONFIRM_WORD}</b> para confirmar
            </Label>
            <Input
              id="confirmar-exclusao"
              autoComplete="off"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={!confirmed || deleteAccount.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteAccount.mutate(undefined, {
                  onSuccess: () =>
                    toast.success("Conta excluída", {
                      description: isDemo
                        ? "Modo demonstração: recarregue a página para restaurar os dados de exemplo."
                        : "Seus dados foram removidos.",
                    }),
                  onError: () => toast.error("Não foi possível excluir a conta."),
                })
              }
            >
              Excluir conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function LegalCard() {
  return (
    <section className="space-y-3 rounded-2xl border border-dashed p-5 text-sm" aria-labelledby="documentos">
      <h2 id="documentos" className="font-bold">
        Documentos
      </h2>
      <ul className="space-y-2">
        {["Termos de uso", "Aviso de privacidade"].map((doc) => (
          <li key={doc} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" /> {doc}
            </span>
            <span className="rounded-full bg-carbs-soft px-2 py-0.5 text-[11px] font-semibold">
              pendente de elaboração
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        O Nutrio é uma ferramenta de registro e não substitui o acompanhamento de um profissional de saúde.
      </p>
    </section>
  );
}

function Field({
  id,
  label,
  optional,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: FieldError;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {optional && <span className="font-normal text-muted-foreground"> (opcional)</span>}
      </Label>
      {children}
      {error?.message ? (
        <p className="text-xs font-medium text-destructive">{error.message}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
