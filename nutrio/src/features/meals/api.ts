import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  repositories,
  type AddMealItemInput,
  type ItemQuantityInput,
  type MealInput,
  type MoveTarget,
} from "@/data";
import type { ISODate } from "@/domain/nutrition/types";
import { foodsKeys } from "@/features/foods/api";

export const mealsKeys = {
  all: ["meals"] as const,
  range: (start: ISODate, end: ISODate) => [...mealsKeys.all, "range", start, end] as const,
};

export const mealsRangeQuery = (start: ISODate, end: ISODate) =>
  queryOptions({
    queryKey: mealsKeys.range(start, end),
    queryFn: () => repositories.meals.listRange(start, end),
  });

export function useMealsRange(start: ISODate, end: ISODate) {
  return useQuery(mealsRangeQuery(start, end));
}

export function useMealsOn(date: ISODate) {
  return useMealsRange(date, date);
}

/**
 * Mutation que invalida as refeições (e os dados de alimentos derivados delas) ao concluir.
 * Toda escrita em refeições passa por aqui para o cache nunca ficar desatualizado.
 */
function useMealsMutation<TInput, TResult>(mutationFn: (input: TInput) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: mealsKeys.all }),
        // Recentes e "em uso" dependem dos registros.
        queryClient.invalidateQueries({ queryKey: foodsKeys.all }),
      ]),
  });
}

export const useCreateMeal = () =>
  useMealsMutation(({ date, ...input }: MealInput & { date: ISODate }) =>
    repositories.meals.createMeal(date, input),
  );

export const useUpdateMeal = () =>
  useMealsMutation(({ mealId, ...input }: MealInput & { mealId: string }) =>
    repositories.meals.updateMeal(mealId, input),
  );

export const useMoveMeal = () =>
  useMealsMutation(({ mealId, direction }: { mealId: string; direction: "up" | "down" }) =>
    repositories.meals.moveMeal(mealId, direction),
  );

export const useDuplicateMeal = () =>
  useMealsMutation(({ mealId, targetDate }: { mealId: string; targetDate: ISODate }) =>
    repositories.meals.duplicateMeal(mealId, targetDate),
  );

export const useDeleteMeal = () =>
  useMealsMutation((mealId: string) => repositories.meals.deleteMeal(mealId));

export const useAddMealItem = () =>
  useMealsMutation((input: AddMealItemInput) => repositories.meals.addItem(input));

export const useUpdateMealItem = () =>
  useMealsMutation(({ mealId, itemId, ...input }: ItemQuantityInput & { mealId: string; itemId: string }) =>
    repositories.meals.updateItem(mealId, itemId, input),
  );

export const useMoveMealItem = () =>
  useMealsMutation(({ mealId, itemId, target }: { mealId: string; itemId: string; target: MoveTarget }) =>
    repositories.meals.moveItem(mealId, itemId, target),
  );

export const useRemoveMealItem = () =>
  useMealsMutation(({ mealId, itemId }: { mealId: string; itemId: string }) =>
    repositories.meals.removeItem(mealId, itemId),
  );
