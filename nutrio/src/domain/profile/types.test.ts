import { describe, expect, it } from "vitest";

import { firstName, initials, isValidTimeZone, normalizeProfile, type ProfileInput } from "./types";

const TODAY = "2026-10-21";
const base: ProfileInput = { name: "  Ana Souza  ", timezone: "America/Sao_Paulo" };

describe("normalizeProfile", () => {
  it("apara o nome e aceita campos opcionais ausentes", () => {
    expect(normalizeProfile(base, TODAY)).toMatchObject({ name: "Ana Souza", weightKg: undefined });
  });

  it("rejeita nome vazio, nascimento no futuro e valores fora da faixa", () => {
    expect(() => normalizeProfile({ ...base, name: " " }, TODAY)).toThrow();
    expect(() => normalizeProfile({ ...base, birthDate: "2027-01-01" }, TODAY)).toThrow();
    expect(() => normalizeProfile({ ...base, weightKg: 7840 }, TODAY)).toThrow(/Peso/);
    expect(() => normalizeProfile({ ...base, heightCm: 1.78 }, TODAY)).toThrow(/Altura/);
    expect(() => normalizeProfile({ ...base, timezone: "Marte/Olympus" }, TODAY)).toThrow(/Fuso/);
  });
});

describe("utilitários", () => {
  it("fuso válido, primeiro nome e iniciais", () => {
    expect(isValidTimeZone("America/Manaus")).toBe(true);
    expect(firstName({ name: "Ana Maria Souza" })).toBe("Ana");
    expect(initials({ name: "Ana Maria Souza" })).toBe("AS");
    expect(initials({ name: "Ana" })).toBe("A");
  });
});
