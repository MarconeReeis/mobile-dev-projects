import { describe, expect, it } from "vitest";

import { profileFormSchema, toProfileForm, toProfileInput, UNSET } from "./profile-form";

const profile = {
  name: "Ana",
  email: "ana@exemplo.com",
  weightKg: 78.4,
  heightCm: 178,
  objective: "maintain" as const,
  timezone: "America/Sao_Paulo",
};

describe("formulário de perfil", () => {
  it("ida e volta com vírgula decimal e campos não informados", () => {
    const values = toProfileForm(profile);
    expect(values).toMatchObject({ weightKg: "78,4", heightCm: "178", activityLevel: UNSET, birthDate: "" });
    const input = toProfileInput(profileFormSchema.parse(values));
    expect(input).toMatchObject({ weightKg: 78.4, heightCm: 178, objective: "maintain" });
    expect(input.activityLevel).toBeUndefined();
    expect(input.birthDate).toBeUndefined();
    expect(input).not.toHaveProperty("email");
  });

  it("acusa peso em gramas, altura em metros e fuso inválido", () => {
    const values = { ...toProfileForm(profile), weightKg: "78400", heightCm: "1,78", timezone: "Lua/Base" };
    const result = profileFormSchema.safeParse(values);
    expect(result.success).toBe(false);
    expect(result.error!.issues.map((i) => i.path[0]).sort()).toEqual(["heightCm", "timezone", "weightKg"]);
  });
});
