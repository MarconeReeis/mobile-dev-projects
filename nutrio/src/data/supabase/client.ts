import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** Supabase configurado? Sem as variáveis, o app roda em modo demonstração (mock). */
export const isSupabaseConfigured = Boolean(url && key);

export type Supabase = SupabaseClient<Database>;

let client: Supabase | null = null;

/** Cliente único do Supabase. Só chame quando `isSupabaseConfigured` for verdadeiro. */
export function getSupabase(): Supabase {
  if (!url || !key) {
    throw new Error("Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.");
  }
  client ??= createClient<Database>(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}
