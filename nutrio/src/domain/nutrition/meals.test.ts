import { describe, expect, it } from "vitest";

import { insertionIndex, suggestMealName } from "./meals";

describe("insertionIndex", () => {
  it("encaixa nomes sugeridos na ordem do dia", () => {
    expect(insertionIndex(["Almoço", "Jantar"], "Café da manhã")).toBe(0);
    expect(insertionIndex(["Café da manhã", "Jantar"], "Almoço")).toBe(1);
    expect(insertionIndex(["Café da manhã", "Almoço"], "Ceia")).toBe(2);
  });

  it("nome repetido entra depois do existente", () => {
    expect(insertionIndex(["Almoço", "Jantar"], "Almoço")).toBe(1);
  });

  it("nome livre vai para o fim", () => {
    expect(insertionIndex(["Café da manhã", "Almoço"], "Pré-treino")).toBe(2);
  });

  it("respeita reordenações do usuário", () => {
    // Usuário colocou o Jantar antes do Almoço; o lanche entra depois do último que o precede.
    expect(insertionIndex(["Jantar", "Almoço"], "Lanche da tarde")).toBe(2);
  });
});

it("sugere refeição pela hora", () => {
  expect(suggestMealName(7)).toBe("Café da manhã");
  expect(suggestMealName(13)).toBe("Almoço");
  expect(suggestMealName(23)).toBe("Ceia");
});
