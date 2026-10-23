import type { NutrientKey } from "@/domain/nutrition/nutrients";
import type { GoalKind } from "@/domain/nutrition/types";

export type Tone = { bar: string; soft: string; dot: string };

const DEFAULT_TONE: Tone = { bar: "bg-primary-strong", soft: "bg-muted", dot: "bg-primary-strong" };

const TONES: Partial<Record<NutrientKey, Tone>> = {
  kcal: { bar: "bg-primary", soft: "bg-primary-soft", dot: "bg-primary" },
  protein: { bar: "bg-protein", soft: "bg-protein-soft", dot: "bg-protein" },
  carbs: { bar: "bg-carbs", soft: "bg-carbs-soft", dot: "bg-carbs" },
  fat: { bar: "bg-fat", soft: "bg-fat-soft", dot: "bg-fat" },
  fiber: { bar: "bg-fiber", soft: "bg-fiber-soft", dot: "bg-fiber" },
};

export const toneOf = (key: NutrientKey): Tone => TONES[key] ?? DEFAULT_TONE;

export const GOAL_KIND_LABEL: Record<GoalKind, string> = { target: "meta", limit: "limite" };
