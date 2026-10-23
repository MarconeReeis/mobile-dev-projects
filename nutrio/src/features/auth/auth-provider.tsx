import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { isDemo } from "@/data";
import { getSupabase } from "@/data/supabase/client";

import { AuthContext, type AuthState } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(isDemo ? { status: "demo" } : { status: "loading" });
  const queryClient = useQueryClient();
  const userId = useRef<string | null>(null);

  useEffect(() => {
    if (isDemo) return;
    const supabase = getSupabase();

    function apply(session: Session | null, recovering = false) {
      const next = session?.user.id ?? null;
      // Troca de usuário (ou saída): nada do cache anterior pode aparecer para o próximo.
      if (next !== userId.current) queryClient.clear();
      userId.current = next;
      setState(session ? { status: "signed-in", session, recovering } : { status: "signed-out" });
    }

    void supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, session) =>
      apply(session, event === "PASSWORD_RECOVERY"),
    );
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
