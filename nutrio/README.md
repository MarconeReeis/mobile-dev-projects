# Nutrio

Diário alimentar e acompanhamento de nutrientes, em português do Brasil.
O layout parte de um protótipo feito no Lovable; o código foi reestruturado para crescer.

Veja o [roadmap](docs/ROADMAP.md).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui (Radix) + lucide-react
- TanStack Router (rotas por arquivo) + TanStack Query
- react-hook-form + zod, date-fns, recharts, sonner
- Vitest + Testing Library, oxlint, Prettier

## Comandos

```bash
npm install        # dependências
npm run dev        # servidor em http://localhost:5173
npm test           # testes
npm run typecheck  # gera as rotas e checa os tipos
npm run lint       # oxlint
npm run format     # prettier
npm run build      # build de produção em dist/
```

## Supabase (back-end)

O app roda em **modo demonstração** (dados em memória) enquanto as variáveis do Supabase não estão definidas.

```bash
npm run db:start   # sobe o Supabase local (precisa do Docker Desktop aberto)
npm run db:test    # testes do banco (RLS e regras) em supabase/tests
npm run db:reset   # recria o banco aplicando as migrações
npm run db:types   # gera os tipos TypeScript a partir do banco local
npm run db:stop
```

- Schema, RLS e funções: `supabase/migrations/`.
- Copie `.env.example` para `.env.local` com a URL e a chave **pública**. A `service_role` nunca vai no frontend.

## Estrutura

```
src/
  app/            # router, query client, providers
  routes/         # rotas (finas: só ligam URL → feature)
  features/       # uma pasta por área: dashboard, meals, foods, goals, profile
  components/
    layout/       # shell, cabeçalhos
    ui/           # shadcn/ui
  domain/         # regras de negócio puras (cálculos, tipos), sem React
  data/           # repositórios: interfaces + implementações (mock e Supabase)
  lib/            # utilitários: formatação pt-BR, datas locais, cn()
  styles/         # design system (tokens em oklch)
```

Regras de dependência: `routes → features → (components, data, domain, lib)`.
`domain` não importa nada de React nem de `data`.

## Convenções

- Datas são strings locais `AAAA-MM-DD`; nada de `toISOString()` para dias.
- Nutriente vazio é `null` (não informado), diferente de `0`.
- Totais são calculados a partir dos itens; arredondamento só na exibição.
- Itens de refeição guardam um snapshot dos nutrientes do alimento.
