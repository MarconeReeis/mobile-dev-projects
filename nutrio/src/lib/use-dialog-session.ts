import { useState } from "react";

/**
 * Número que muda a cada abertura de um diálogo. Use como `key` do conteúdo:
 * o formulário recomeça do zero ao abrir e continua visível durante a animação de saída
 * (o que não acontece com `{open && <Conteúdo />}`, que esvazia o diálogo antes de ele sumir).
 */
export function useDialogSession(open: boolean): number {
  const [state, setState] = useState({ open, session: 0 });
  // Ajuste de estado durante o render (padrão recomendado pelo React para reagir a props).
  if (open !== state.open) setState({ open, session: open ? state.session + 1 : state.session });
  return state.session;
}
