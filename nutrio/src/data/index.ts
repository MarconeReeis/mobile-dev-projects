// Ponto único de escolha da implementação de dados.
// Com VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY definidas, usa o Supabase;
// sem elas, roda em modo demonstração com dados em memória.

import { createMockRepositories } from "./mock/mock-repositories";
import type { Repositories } from "./repositories";
import { getSupabase, isSupabaseConfigured } from "./supabase/client";
import { createSupabaseRepositories } from "./supabase/supabase-repositories";

export const isDemo = !isSupabaseConfigured;

export const repositories: Repositories = isSupabaseConfigured
  ? createSupabaseRepositories(getSupabase())
  : createMockRepositories();

export type * from "./repositories";
