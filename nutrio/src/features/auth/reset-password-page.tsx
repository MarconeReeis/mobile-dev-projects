import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/data/supabase/client";

import { useAuth } from "./auth-context";
import { authErrorMessage } from "./auth-errors";

const schema = z
  .object({
    password: z.string().min(8, "Use pelo menos 8 caracteres.").max(72, "Use até 72 caracteres."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "As senhas não conferem." });

type Values = z.infer<typeof schema>;

/** Destino do link de recuperação: o Supabase abre uma sessão temporária e aqui se define a nova senha. */
export function ResetPasswordPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: Values) {
    setServerError(null);
    const { error } = await getSupabase().auth.updateUser({ password: values.password });
    if (error) return setServerError(authErrorMessage(error));
    toast.success("Senha alterada");
    void navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-8 sm:px-12">
      <Logo />
      <main className="mx-auto my-auto w-full max-w-sm py-10">
        <h1 className="text-4xl font-bold">Nova senha</h1>
        {auth.status === "loading" ? (
          <p className="mt-2 text-muted-foreground">Validando o link…</p>
        ) : auth.status !== "signed-in" ? (
          <div className="mt-4 space-y-4">
            <p className="text-muted-foreground">
              Este link expirou ou já foi usado. Peça um novo na tela de entrada, em “Esqueci minha senha”.
            </p>
            <Button asChild variant="outline">
              <Link to="/entrar">Ir para o login</Link>
            </Button>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="nova-senha">Nova senha</Label>
              <Input
                id="nova-senha"
                type="password"
                autoComplete="new-password"
                className="h-12 rounded-xl"
                aria-invalid={!!errors.password}
                {...form.register("password")}
              />
              {errors.password && (
                <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
              <Input
                id="confirmar-senha"
                type="password"
                autoComplete="new-password"
                className="h-12 rounded-xl"
                aria-invalid={!!errors.confirm}
                {...form.register("confirm")}
              />
              {errors.confirm && (
                <p className="text-xs font-medium text-destructive">{errors.confirm.message}</p>
              )}
            </div>
            {serverError && (
              <p
                className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
                role="alert"
              >
                {serverError}
              </p>
            )}
            <Button type="submit" variant="ink" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Salvando…" : "Salvar nova senha"}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
