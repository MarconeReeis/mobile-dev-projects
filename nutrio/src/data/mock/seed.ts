// Dados de demonstração. Gerados em relação a "hoje" para o app sempre ter histórico recente.

import type { Food, GoalVersion, ISODate, Meal, MealItem, WaterEntry } from "@/domain/nutrition/types";
import type { Profile } from "@/domain/profile/types";
import { addDays } from "@/lib/dates";

export type Seed = {
  foods: Food[];
  meals: Meal[];
  goalVersions: GoalVersion[];
  waterEntries: WaterEntry[];
  profile: Profile;
};

type FoodSeed = Omit<Food, "favorite" | "archived" | "portions" | "baseAmount"> & {
  baseAmount?: number;
  favorite?: boolean;
  archived?: boolean;
  portions: { name: string; amount: number }[];
};

const FOODS: FoodSeed[] = [
  {
    id: "pao",
    name: "Pão de forma integral",
    brand: "Wickbold",
    category: "Padaria",
    base: "g",
    favorite: true,
    per100: {
      kcal: 253,
      protein: 11.3,
      carbs: 43.7,
      fat: 3.6,
      satFat: 0.8,
      transFat: 0,
      fiber: 6.9,
      sugar: 4.2,
      addedSugar: 2.1,
      sodium: 380,
      calcium: 102,
      iron: 2.4,
      potassium: null,
      vitC: null,
    },
    portions: [{ name: "1 fatia", amount: 25 }],
  },
  {
    id: "ovo",
    name: "Ovo de galinha cozido",
    category: "Proteínas",
    base: "g",
    favorite: true,
    per100: {
      kcal: 146,
      protein: 13.3,
      carbs: 0.6,
      fat: 9.5,
      satFat: 2.9,
      transFat: 0,
      fiber: 0,
      sugar: 0.4,
      addedSugar: 0,
      sodium: 146,
      calcium: 49,
      iron: 1.5,
      potassium: 140,
      vitC: 0,
    },
    portions: [{ name: "1 unidade", amount: 50 }],
  },
  {
    id: "arroz",
    name: "Arroz branco cozido",
    category: "Grãos",
    base: "g",
    per100: {
      kcal: 128,
      protein: 2.5,
      carbs: 28.1,
      fat: 0.2,
      satFat: 0.1,
      transFat: 0,
      fiber: 1.6,
      sugar: 0,
      addedSugar: 0,
      sodium: 1,
      calcium: 4,
      iron: 0.1,
      potassium: 15,
      vitC: 0,
    },
    portions: [{ name: "1 colher de servir", amount: 45 }],
  },
  {
    id: "feijao",
    name: "Feijão carioca cozido",
    category: "Grãos",
    base: "g",
    favorite: true,
    per100: {
      kcal: 76,
      protein: 4.8,
      carbs: 13.6,
      fat: 0.5,
      satFat: 0.1,
      transFat: 0,
      fiber: 8.5,
      sugar: 0.3,
      addedSugar: 0,
      sodium: 2,
      calcium: 27,
      iron: 1.3,
      potassium: 255,
      vitC: 0,
    },
    portions: [{ name: "1 concha", amount: 86 }],
  },
  {
    id: "frango",
    name: "Peito de frango grelhado",
    category: "Proteínas",
    base: "g",
    favorite: true,
    per100: {
      kcal: 159,
      protein: 32,
      carbs: 0,
      fat: 2.5,
      satFat: 0.7,
      transFat: 0,
      fiber: 0,
      sugar: 0,
      addedSugar: 0,
      sodium: 50,
      calcium: 5,
      iron: 0.3,
      potassium: 268,
      vitC: 0,
    },
    portions: [{ name: "1 filé", amount: 120 }],
  },
  {
    id: "banana",
    name: "Banana prata",
    category: "Frutas",
    base: "g",
    per100: {
      kcal: 98,
      protein: 1.3,
      carbs: 26,
      fat: 0.1,
      satFat: 0,
      transFat: 0,
      fiber: 2,
      sugar: 14,
      addedSugar: 0,
      sodium: 0,
      calcium: 8,
      iron: 0.4,
      potassium: 358,
      vitC: 21.6,
    },
    portions: [{ name: "1 unidade média", amount: 70 }],
  },
  {
    id: "leite",
    name: "Leite integral",
    brand: "Piracanjuba",
    category: "Laticínios",
    base: "ml",
    per100: {
      kcal: 61,
      protein: 3.2,
      carbs: 4.7,
      fat: 3.3,
      satFat: 2.1,
      transFat: 0,
      fiber: 0,
      sugar: 4.7,
      addedSugar: 0,
      sodium: 50,
      calcium: 123,
      iron: 0,
      potassium: 140,
      vitC: null,
    },
    portions: [{ name: "1 copo", amount: 200 }],
  },
  {
    id: "aveia",
    name: "Aveia em flocos",
    brand: "Quaker",
    category: "Grãos",
    base: "g",
    per100: {
      kcal: 394,
      protein: 13.9,
      carbs: 66.6,
      fat: 8.5,
      satFat: 1.5,
      transFat: 0,
      fiber: 9.1,
      sugar: 1,
      addedSugar: 0,
      sodium: null,
      calcium: 48,
      iron: 4.4,
      potassium: null,
      vitC: null,
    },
    portions: [{ name: "1 colher de sopa", amount: 15 }],
  },
  {
    id: "alface",
    name: "Salada de folhas",
    category: "Vegetais",
    base: "g",
    per100: {
      kcal: 15,
      protein: 1.4,
      carbs: 2.9,
      fat: 0.2,
      satFat: 0,
      transFat: 0,
      fiber: 2,
      sugar: 0.8,
      addedSugar: 0,
      sodium: 10,
      calcium: 38,
      iron: 0.6,
      potassium: 260,
      vitC: 15,
    },
    portions: [{ name: "1 prato de sobremesa", amount: 60 }],
  },
  {
    id: "azeite",
    name: "Azeite de oliva extravirgem",
    brand: "Gallo",
    category: "Óleos",
    base: "ml",
    per100: {
      kcal: 884,
      protein: 0,
      carbs: 0,
      fat: 100,
      satFat: 14,
      transFat: 0,
      fiber: 0,
      sugar: 0,
      addedSugar: 0,
      sodium: 0,
      calcium: null,
      iron: null,
      potassium: null,
      vitC: null,
    },
    portions: [{ name: "1 colher de sopa", amount: 13 }],
  },
  {
    id: "iogurte",
    name: "Iogurte natural integral",
    brand: "Nestlé",
    category: "Laticínios",
    base: "g",
    per100: {
      kcal: 61,
      protein: 3.5,
      carbs: 4.7,
      fat: 3.3,
      satFat: 2.1,
      transFat: 0,
      fiber: 0,
      sugar: 4.7,
      addedSugar: 0,
      sodium: 46,
      calcium: 121,
      iron: null,
      potassium: 155,
      vitC: null,
    },
    portions: [{ name: "1 pote", amount: 170 }],
  },
  {
    id: "tilapia",
    name: "Filé de tilápia assado",
    category: "Proteínas",
    base: "g",
    per100: {
      kcal: 128,
      protein: 26,
      carbs: 0,
      fat: 2.7,
      satFat: 0.9,
      transFat: 0,
      fiber: 0,
      sugar: 0,
      addedSugar: 0,
      sodium: 56,
      calcium: 14,
      iron: 0.7,
      potassium: 380,
      vitC: 0,
    },
    portions: [{ name: "1 filé", amount: 110 }],
  },
  {
    id: "batata",
    name: "Batata-doce cozida",
    category: "Vegetais",
    base: "g",
    per100: {
      kcal: 77,
      protein: 0.6,
      carbs: 18.4,
      fat: 0.1,
      satFat: 0,
      transFat: 0,
      fiber: 2.2,
      sugar: 5.7,
      addedSugar: 0,
      sodium: 27,
      calcium: 17,
      iron: 0.2,
      potassium: 230,
      vitC: 12.8,
    },
    portions: [{ name: "1 unidade média", amount: 150 }],
  },
  {
    id: "biscoito",
    name: "Biscoito recheado chocolate",
    brand: "Marca antiga",
    category: "Padaria",
    base: "g",
    archived: true,
    per100: {
      kcal: 472,
      protein: 6.4,
      carbs: 70.5,
      fat: 19.6,
      satFat: 6.2,
      transFat: 0,
      fiber: 3,
      sugar: 38,
      addedSugar: 36,
      sodium: 239,
      calcium: null,
      iron: null,
      potassium: null,
      vitC: null,
    },
    portions: [{ name: "1 unidade", amount: 12 }],
  },
];

export function createSeed(today: ISODate): Seed {
  const foods: Food[] = FOODS.map((f) => ({
    ...f,
    baseAmount: f.baseAmount ?? 100,
    favorite: f.favorite ?? false,
    archived: f.archived ?? false,
    portions: f.portions.map((p, i) => ({ id: `${f.id}-p${i}`, ...p })),
  }));
  const byId = new Map(foods.map((f) => [f.id, f]));

  let seq = 0;
  function item(foodId: string, amount: number, portion?: { name: string; count: number }): MealItem {
    const food = byId.get(foodId)!;
    const p = portion && food.portions.find((x) => x.name === portion.name);
    return {
      id: `seed-item-${++seq}`,
      foodId,
      snapshot: { name: food.name, brand: food.brand, base: food.base, per100: { ...food.per100 } },
      amount: p && portion ? p.amount * portion.count : amount,
      portion: p && portion ? { name: p.name, count: portion.count, amount: p.amount } : undefined,
    };
  }

  function dayMeals(date: ISODate, variant: number): Meal[] {
    const v = variant;
    const meals: Meal[] = [
      {
        id: `${date}-cafe`,
        date,
        name: "Café da manhã",
        time: "07:30",
        order: 0,
        items: [
          item("pao", 0, { name: "1 fatia", count: 2 }),
          item("ovo", 0, { name: "1 unidade", count: v % 2 ? 3 : 2 }),
          item("leite", 0, { name: "1 copo", count: 1 }),
        ],
      },
      {
        id: `${date}-almoco`,
        date,
        name: "Almoço",
        time: "12:40",
        order: 2,
        items:
          v % 3 === 1
            ? [
                item("batata", 220),
                item("tilapia", 0, { name: "1 filé", count: 2 }),
                item("alface", 80),
                item("azeite", 0, { name: "1 colher de sopa", count: 1 }),
              ]
            : [
                item("arroz", 0, { name: "1 colher de servir", count: 3 }),
                item("feijao", 0, { name: "1 concha", count: 1 }),
                item("frango", 150),
                item("alface", 60),
                item("azeite", 0, { name: "1 colher de sopa", count: 1 }),
              ],
      },
      {
        id: `${date}-lanche`,
        date,
        name: "Lanche da tarde",
        time: "16:10",
        order: 3,
        items: [
          item("banana", 0, { name: "1 unidade média", count: 1 }),
          item("aveia", 0, { name: "1 colher de sopa", count: 2 }),
        ],
      },
    ];
    meals.push({
      id: `${date}-jantar`,
      date,
      name: "Jantar",
      time: v === 0 ? undefined : "20:15",
      order: 4,
      items:
        v === 0
          ? []
          : v === 5
            ? [
                item("arroz", 0, { name: "1 colher de servir", count: 4 }),
                item("feijao", 0, { name: "1 concha", count: 2 }),
                item("frango", 0, { name: "1 filé", count: 2 }),
                item("azeite", 0, { name: "1 colher de sopa", count: 2 }),
              ]
            : [
                item("arroz", 0, { name: "1 colher de servir", count: 2 }),
                item("feijao", 0, { name: "1 concha", count: 1 }),
                item("ovo", 0, { name: "1 unidade", count: 2 }),
              ],
    });
    return meals;
  }

  // Últimos 7 dias; anteontem fica sem registros de propósito. Hoje tem o jantar ainda vazio.
  const variants: [offset: number, variant: number | null][] = [
    [-6, 2],
    [-5, 3],
    [-4, 1],
    [-3, 4],
    [-2, null],
    [-1, 5],
    [0, 0],
  ];
  const meals = variants.flatMap(([offset, v]) => (v === null ? [] : dayMeals(addDays(today, offset), v)));

  const goalVersions: GoalVersion[] = [
    {
      id: "goals-v1",
      startDate: addDays(today, -67),
      waterMl: 2000,
      goals: {
        kcal: { value: 2300, kind: "target" },
        protein: { value: 120, kind: "target" },
        carbs: { value: 270, kind: "target" },
        fat: { value: 75, kind: "limit" },
        fiber: { value: 28, kind: "target" },
        sodium: { value: 2300, kind: "limit" },
      },
    },
    {
      id: "goals-v2",
      startDate: addDays(today, -20),
      waterMl: 2500,
      goals: {
        kcal: { value: 2100, kind: "target" },
        protein: { value: 130, kind: "target" },
        carbs: { value: 240, kind: "target" },
        fat: { value: 70, kind: "limit" },
        fiber: { value: 30, kind: "target" },
        sodium: { value: 2000, kind: "limit" },
        satFat: { value: 20, kind: "limit" },
        calcium: { value: 1000, kind: "target" },
        iron: { value: 8, kind: "target" },
        vitC: { value: 90, kind: "target" },
      },
    },
  ];

  const profile: Profile = {
    name: "Usuário Demonstração",
    email: "demo@nutrio.app",
    weightKg: 78.4,
    heightCm: 178,
    activityLevel: "moderate",
    objective: "maintain",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  // Água nos últimos 7 dias; anteontem fica sem registros, como as refeições.
  const WATER_TIMES = ["07:15", "09:30", "11:45", "13:20", "15:10", "17:40", "20:00"];
  const waterPatterns: [offset: number, ml: number[]][] = [
    [-6, [300, 250, 500, 250, 300, 500, 250]],
    [-5, [250, 500, 250, 300, 500]],
    [-4, [500, 500, 250, 500, 300, 500, 250]],
    [-3, [250, 250, 300, 500, 250]],
    [-1, [500, 300, 500, 250, 500, 500]],
    [0, [300, 250, 500, 250]],
  ];
  const waterEntries: WaterEntry[] = waterPatterns.flatMap(([offset, mls]) => {
    const date = addDays(today, offset);
    return mls.map((ml, i) => ({ id: `${date}-w${i}`, date, time: WATER_TIMES[i], ml }));
  });

  return { foods, meals, goalVersions, waterEntries, profile };
}
