import { Link } from "@tanstack/react-router";
import { Apple, ChefHat, Home, Leaf, Plus, Target, UserRound, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { isDemo } from "@/data";
import { initials } from "@/domain/profile/types";
import { AddFoodDialog } from "@/features/meals/components/add-food-dialog";
import { useProfile, useToday } from "@/features/profile/api";

const NAV: readonly { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Resumo", icon: Home },
  { to: "/refeicoes", label: "Refeições", icon: ChefHat },
  { to: "/alimentos", label: "Alimentos", icon: Apple },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/perfil", label: "Perfil", icon: UserRound },
];

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Leaf className="h-5 w-5" />
      </span>
      <span className="font-display text-xl font-bold tracking-tight">Nutrio</span>
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-carbs-soft px-3 py-1 text-xs font-semibold text-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-carbs" aria-hidden />
      Modo demonstração
    </span>
  );
}

function UserCard() {
  const profile = useProfile();
  const name = profile.data?.name || "Sua conta";
  return (
    <Link to="/perfil" className="mt-auto flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold">
        {(profile.data && initials(profile.data)) || "?"}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{name}</span>
        <span className="block truncate text-xs text-muted-foreground">{profile.data?.email}</span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const today = useToday();
  return (
    <div className="min-h-screen lg:flex">
      {/* Menu lateral — desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-card px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-10 flex flex-col gap-1" aria-label="Principal">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true, includeSearch: false }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-ink data-[status=active]:text-ink-foreground"
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 px-1">
          <AddFoodDialog date={today}>
            <Button className="w-full" size="lg">
              <Plus /> Registrar alimento
            </Button>
          </AddFoodDialog>
        </div>
        {isDemo ? (
          <div className="mt-auto space-y-3 rounded-2xl bg-muted p-4">
            <DemoBadge />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Os dados são fictícios e as alterações se perdem ao recarregar a página.
            </p>
          </div>
        ) : (
          <UserCard />
        )}
      </aside>

      <div className="min-w-0 flex-1">
        {/* Topo — celular */}
        <header className="flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] lg:hidden">
          <Logo />
          {isDemo && <DemoBadge />}
        </header>

        <main className="mx-auto w-full max-w-6xl px-5 pt-6 pb-32 lg:px-10 lg:pt-10 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Botão flutuante — celular */}
      <div className="fixed right-5 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+5.25rem)] z-30 lg:hidden">
        <AddFoodDialog date={today}>
          <Button variant="fab" className="h-14 w-14 [&_svg]:size-6" aria-label="Registrar alimento">
            <Plus />
          </Button>
        </AddFoodDialog>
      </div>

      {/* Navegação inferior — celular */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 grid grid-cols-5 rounded-3xl border bg-card/95 px-2 py-2 shadow-soft backdrop-blur lg:hidden"
      >
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true, includeSearch: false }}
            className="group flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-medium text-muted-foreground data-[status=active]:text-foreground"
          >
            <span className="grid h-8 w-12 place-items-center rounded-full transition-colors group-data-[status=active]:bg-primary">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
