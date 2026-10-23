/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL do projeto Supabase (local: http://127.0.0.1:54321). */
  readonly VITE_SUPABASE_URL?: string;
  /** Chave pública (publishable/anon). Nunca use a service_role no frontend. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
