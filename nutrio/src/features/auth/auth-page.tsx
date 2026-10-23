import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import vegetais from "@/assets/vegetais.jpg";
import { Logo } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/data/supabase/client";
import { cn } from "@/lib/utils";

import { authErrorMessage } from "./auth-errors";

type Mode = "entrar" | "cadastro" | "recuperar";

const email = z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido.");
const password = z.string().min(8, "Use pelo menos 8 caracteres.").max(72, "Use até 72 caracteres.");

const schemas = {
  entrar: z.object({ email, password: z.string().min(1, "Informe sua senha.") }),
  cadastro: z.object({ name: z.string().trim().min(1, "Informe seu nome.").max(80), email, password }),
  recuperar: z.object({ email }),
};

type Values = { name?: string; email: string; password?: string };

const TITLE: Record<Mode, string> = {
  entrar: "Boas-vindas de volta",
  cadastro: "Criar conta",
  recuperar: "Recuperar senha",
};

export function AuthPage() {
  const [mode, setMode] = useState<Mode>("entrar");
  const [sent, setSent] = useState<{ kind: "confirmar" | "recuperar"; email: string } | null>(null);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-muted lg:block">
        <img
          src={vegetais}
          alt=""
          width={1024}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute top-10 left-10 max-w-md">
          <h2 className="font-display text-5xl leading-[1.05] font-bold">
            Seu diário alimentar, <span className="rounded-2xl bg-primary px-2">leve</span> e do seu jeito.
          </h2>
        </div>
      </div>

      <div className="flex flex-col px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-8 sm:px-12">
        <Logo />

        <main className="mx-auto my-auto w-full max-w-sm py-10">
          {sent ? (
            <SentMessage
              {...sent}
              onBack={() => {
                setSent(null);
                setMode("entrar");
              }}
            />
          ) : (
            <>
              <h1 className="text-4xl font-bold">{TITLE[mode]}</h1>
              <p className="mt-2 text-muted-foreground">
                {mode === "recuperar"
                  ? "Enviaremos um link para redefinir sua senha."
                  : "Registre refeições e acompanhe suas metas."}
              </p>

              {mode !== "recuperar" && (
                <div className="mt-8 flex rounded-full bg-muted p-1" role="tablist" aria-label="Acesso">
                  {(["entrar", "cadastro"] as const).map((m) => (
                    <button
                      key={m}
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => setMode(m)}
                      className={cn(
                        "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
                        mode === m ? "bg-card shadow-soft" : "text-muted-foreground",
                      )}
                    >
                      {m === "entrar" ? "Entrar" : "Cadastrar"}
                    </button>
                  ))}
                </div>
              )}

              <AuthForm key={mode} mode={mode} onModeChange={setMode} onSent={setSent} />
            </>
          )}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Termos de uso e aviso de privacidade em elaboração. O Nutrio é uma ferramenta de registro e não
            substitui acompanhamento profissional.
          </p>
        </main>
      </div>
    </div>
  );
}

function AuthForm({
  mode,
  onModeChange,
  onSent,
}: {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onSent: (sent: { kind: "confirmar" | "recuperar"; email: string }) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<Values>({
    // Um schema por modo; todos produzem o mesmo formato de valores.
    resolver: zodResolver(schemas[mode]) as unknown as Resolver<Values>,
    defaultValues: { name: "", email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: Values) {
    setServerError(null);
    const auth = getSupabase().auth;
    const origin = window.location.origin;
    const emailAddress = values.email.trim();

    if (mode === "entrar") {
      const { error } = await auth.signInWithPassword({ email: emailAddress, password: values.password! });
      if (error) setServerError(authErrorMessage(error));
      // Com sucesso, o AuthProvider recebe a sessão e o app abre sozinho.
      return;
    }

    if (mode === "cadastro") {
      const { data, error } = await auth.signUp({
        email: emailAddress,
        password: values.password!,
        options: {
          emailRedirectTo: origin,
          // Lidos pelo trigger que cria o perfil.
          data: { name: values.name!.trim(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        },
      });
      if (error) return setServerError(authErrorMessage(error));
      // Sem sessão = o projeto exige confirmação por e-mail.
      if (!data.session) onSent({ kind: "confirmar", email: emailAddress });
      return;
    }

    const { error } = await auth.resetPasswordForEmail(emailAddress, {
      redirectTo: `${origin}/redefinir-senha`,
    });
    if (error) return setServerError(authErrorMessage(error));
    onSent({ kind: "recuperar", email: emailAddress });
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {mode === "cadastro" && (
        <Field id="nome" label="Nome" error={errors.name?.message}>
          <Input
            id="nome"
            autoComplete="name"
            className="h-12 rounded-xl"
            placeholder="Como quer ser chamado"
            aria-invalid={!!errors.name}
            {...form.register("name")}
          />
        </Field>
      )}
      <Field id="email" label="E-mail" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          className="h-12 rounded-xl"
          aria-invalid={!!errors.email}
          {...form.register("email")}
        />
      </Field>
      {mode !== "recuperar" && (
        <Field
          id="senha"
          label="Senha"
          error={errors.password?.message}
          action={
            mode === "entrar" && (
              <button
                type="button"
                onClick={() => onModeChange("recuperar")}
                className="text-xs font-semibold text-primary-strong hover:underline"
              >
                Esqueci minha senha
              </button>
            )
          }
        >
          <Input
            id="senha"
            type="password"
            autoComplete={mode === "cadastro" ? "new-password" : "current-password"}
            className="h-12 rounded-xl"
            aria-invalid={!!errors.password}
            {...form.register("password")}
          />
        </Field>
      )}

      {serverError && (
        <p
          className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
          role="alert"
        >
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        variant="ink"
        size="lg"
        disabled={isSubmitting}
        className="w-full justify-between pr-2 pl-7"
      >
        {isSubmitting
          ? "Aguarde…"
          : mode === "entrar"
            ? "Entrar"
            : mode === "cadastro"
              ? "Criar conta"
              : "Enviar link"}
        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
          <ArrowRight />
        </span>
      </Button>
      {mode === "recuperar" && (
        <button
          type="button"
          onClick={() => onModeChange("entrar")}
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          Voltar para o login
        </button>
      )}
    </form>
  );
}

function SentMessage({
  kind,
  email: address,
  onBack,
}: {
  kind: "confirmar" | "recuperar";
  email: string;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4" role="status">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft">
        <MailCheck className="h-6 w-6" />
      </span>
      <h1 className="text-3xl font-bold">Confira seu e-mail</h1>
      <p className="text-muted-foreground">
        {kind === "confirmar"
          ? `Enviamos um link de confirmação para ${address}. Depois de confirmar, entre com seu e-mail e senha.`
          : `Se existir uma conta com ${address}, você vai receber um link para criar uma nova senha.`}
      </p>
      <p className="text-sm text-muted-foreground">
        Não chegou? Veja a caixa de spam ou tente de novo em alguns minutos.
      </p>
      <Button variant="outline" onClick={onBack}>
        Voltar para o login
      </Button>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  action,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {action}
      </div>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
