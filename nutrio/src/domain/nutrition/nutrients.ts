// Catálogo de nutrientes suportados pelo app.

export type NutrientUnit = "kcal" | "g" | "mg";

export const NUTRIENTS = {
  kcal: { label: "Calorias", short: "kcal", unit: "kcal" },
  protein: { label: "Proteínas", short: "P", unit: "g" },
  carbs: { label: "Carboidratos", short: "C", unit: "g" },
  fat: { label: "Gorduras totais", short: "G", unit: "g" },
  satFat: { label: "Gorduras saturadas", short: "GS", unit: "g" },
  transFat: { label: "Gorduras trans", short: "GT", unit: "g" },
  fiber: { label: "Fibras", short: "F", unit: "g" },
  sugar: { label: "Açúcares totais", short: "AT", unit: "g" },
  addedSugar: { label: "Açúcares adicionados", short: "AA", unit: "g" },
  sodium: { label: "Sódio", short: "Na", unit: "mg" },
  calcium: { label: "Cálcio", short: "Ca", unit: "mg" },
  iron: { label: "Ferro", short: "Fe", unit: "mg" },
  potassium: { label: "Potássio", short: "K", unit: "mg" },
  vitC: { label: "Vitamina C", short: "VC", unit: "mg" },
} as const satisfies Record<string, { label: string; short: string; unit: NutrientUnit }>;

export type NutrientKey = keyof typeof NUTRIENTS;

export const NUTRIENT_KEYS = Object.keys(NUTRIENTS) as NutrientKey[];

/** Nutrientes exibidos em destaque no resumo do dia. */
export const MACRO_KEYS = ["protein", "carbs", "fat", "fiber"] as const satisfies readonly NutrientKey[];

/** Estimativa energética dos macros (kcal por grama). Usada só como informação auxiliar. */
export const KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;
