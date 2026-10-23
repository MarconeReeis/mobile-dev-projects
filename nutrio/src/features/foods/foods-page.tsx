import { Archive, Plus, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { matchesFoodQuery } from "@/domain/nutrition/foods";
import { useFoods, useUsedFoodIds } from "@/features/foods/api";
import { cn } from "@/lib/utils";

import { FoodCard } from "./components/food-card";
import { FoodDialog } from "./components/food-dialog";

export function FoodsPage() {
  const foods = useFoods();
  const used = useUsedFoodIds();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [creating, setCreating] = useState(false);

  const visible = useMemo(
    () => (foods.data ?? []).filter((f) => f.archived === showArchived),
    [foods.data, showArchived],
  );
  const categories = useMemo(
    () =>
      [...new Set(visible.flatMap((f) => (f.category ? [f.category] : [])))].sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      ),
    [visible],
  );
  // Categoria escolhida pode sumir ao alternar arquivados; nesse caso o filtro volta para "Todas".
  const activeCategory = category && categories.includes(category) ? category : null;
  const list = visible.filter(
    (f) =>
      (!activeCategory || f.category === activeCategory) &&
      (!favoritesOnly || f.favorite) &&
      matchesFoodQuery(f, query),
  );
  const activeCount = (foods.data ?? []).filter((f) => !f.archived).length;
  const filtering = !!query.trim() || !!activeCategory || favoritesOnly;

  return (
    <>
      <PageHeader
        eyebrow={
          foods.data
            ? `${activeCount} ${activeCount === 1 ? "alimento cadastrado" : "alimentos cadastrados"}`
            : "Biblioteca pessoal"
        }
        title="Alimentos"
        action={
          <Button variant="ink" onClick={() => setCreating(true)} aria-label="Novo alimento">
            <Plus /> <span className="hidden sm:inline">Novo alimento</span>
          </Button>
        }
      />

      <div className="space-y-4 surface p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou marca"
              aria-label="Buscar alimento"
              className="h-11 rounded-full pl-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:contents">
            <Button
              variant={favoritesOnly ? "default" : "outline"}
              className="h-11"
              aria-pressed={favoritesOnly}
              onClick={() => setFavoritesOnly(!favoritesOnly)}
            >
              <Star className={cn(favoritesOnly && "fill-current")} /> Favoritos
            </Button>
            <Button
              variant={showArchived ? "ink" : "outline"}
              className="h-11"
              aria-pressed={showArchived}
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive /> Arquivados
            </Button>
          </div>
        </div>
        {categories.length > 0 && (
          <div
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            role="group"
            aria-label="Filtrar por categoria"
          >
            {[null, ...categories].map((c) => (
              <button
                key={c ?? "todas"}
                onClick={() => setCategory(c)}
                aria-pressed={activeCategory === c}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  activeCategory === c
                    ? "bg-ink text-ink-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {c ?? "Todas"}
              </button>
            ))}
          </div>
        )}
      </div>

      {showArchived && (
        <p className="mt-4 text-sm text-muted-foreground">
          Alimentos arquivados não aparecem ao registrar, mas continuam no histórico. Restaure pelo menu do
          card.
        </p>
      )}

      {foods.isPending ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy>
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-56" />
            </li>
          ))}
        </ul>
      ) : foods.isError ? (
        <section
          className="mt-5 flex flex-col items-center gap-3 surface px-6 py-12 text-center"
          role="alert"
        >
          <h2 className="text-xl font-bold">Não foi possível carregar os alimentos</h2>
          <Button variant="outline" onClick={() => void foods.refetch()}>
            Tentar novamente
          </Button>
        </section>
      ) : list.length === 0 ? (
        <section className="mt-5 flex flex-col items-center gap-3 surface px-6 py-12 text-center">
          <h2 className="text-xl font-bold">
            {filtering
              ? "Nada encontrado"
              : showArchived
                ? "Nenhum alimento arquivado"
                : "Sua biblioteca está vazia"}
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {filtering
              ? "Ajuste a busca ou os filtros, ou cadastre um alimento novo."
              : showArchived
                ? "Arquive alimentos que você não usa mais para tirá-los da busca de registro."
                : "Cadastre os alimentos que você consome com a composição da embalagem ou de uma tabela."}
          </p>
          {!showArchived && (
            <Button className="mt-2" onClick={() => setCreating(true)}>
              <Plus /> Novo alimento
            </Button>
          )}
        </section>
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((f) => (
            <FoodCard key={f.id} food={f} used={used.data?.has(f.id) ?? true} />
          ))}
        </ul>
      )}

      <FoodDialog open={creating} onOpenChange={setCreating} mode="create" />
    </>
  );
}
