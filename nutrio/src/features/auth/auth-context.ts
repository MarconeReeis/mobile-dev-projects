import type { Session } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

export type AuthState =
  /** Sem Supabase configurado: dados de demonstração, sem login. */
  | { status: "demo" }
  | { status: "loading" }
  | { status: "signed-out" }
  /** `recovering`: entrou pelo link de redefinição de senha. */
  | { status: "signed-in"; session: Session; recovering: boolean };

export const AuthContext = createContext<AuthState>({ status: "loading" });

export function useAuth() {
  return useContext(AuthContext);
}
