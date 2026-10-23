import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Link, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/features/auth/auth-context";

export type RouterContext = { queryClient: QueryClient };

/** Telas acessíveis sem login. */
const PUBLIC_PATHS = ["/entrar", "/redefinir-senha"];

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: RouteError,
});

function RootLayout() {
  return (
    <>
      <AuthGate />
      <Toaster position="top-center" />
    </>
  );
}

/** Decide entre o app (com o shell), as telas de acesso e os redirecionamentos de login. */
function AuthGate() {
  const auth = useAuth();
  // Usa a rota que está de fato renderizada, e não o endereço: durante uma navegação o endereço
  // já mudou, mas o <Outlet/> ainda mostra a tela anterior (que dispararia consultas sem sessão).
  const pathname = useRouterState({ select: (s) => s.matches[s.matches.length - 1]?.pathname ?? "/" });
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (auth.status === "loading") return <Splash />;
  if (auth.status === "demo" && isPublic) return <Navigate to="/" replace />;
  if (auth.status === "signed-out" && !isPublic) return <Navigate to="/entrar" replace />;
  if (auth.status === "signed-in") {
    // Quem chega pelo link de recuperação define a senha antes de qualquer outra coisa.
    if (auth.recovering && pathname !== "/redefinir-senha") return <Navigate to="/redefinir-senha" replace />;
    if (pathname === "/entrar") return <Navigate to="/" replace />;
  }
  if (isPublic) return <Outlet />;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function Splash() {
  return (
    <div className="grid min-h-screen place-items-center" role="status" aria-label="Carregando">
      <span className="grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-primary text-primary-foreground">
        <Leaf className="h-7 w-7" />
      </span>
    </div>
  );
}

function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-7xl font-bold">404</h1>
      <p className="mt-4 text-xl font-semibold">Página não encontrada</p>
      <p className="mt-2 text-sm text-muted-foreground">
        A página que você procura não existe ou foi movida.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Voltar ao início</Link>
      </Button>
    </div>
  );
}

function RouteError({ reset }: { reset: () => void }) {
  return (
    <div className="py-20 text-center">
      <h1 className="text-xl font-semibold">Esta página não carregou</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Algo deu errado. Tente novamente ou volte ao início.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button onClick={reset}>Tentar novamente</Button>
        <Button variant="outline" asChild>
          <Link to="/">Início</Link>
        </Button>
      </div>
    </div>
  );
}
