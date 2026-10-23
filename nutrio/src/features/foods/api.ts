import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { repositories } from "@/data";
import type { FoodInput } from "@/domain/nutrition/foods";

export const foodsKeys = {
  all: ["foods"] as const,
  list: () => [...foodsKeys.all, "list"] as const,
  recent: () => [...foodsKeys.all, "recent"] as const,
  used: () => [...foodsKeys.all, "used"] as const,
};

export function useFoods() {
  return useQuery({ queryKey: foodsKeys.list(), queryFn: () => repositories.foods.list() });
}

export function useRecentFoods(limit = 6) {
  return useQuery({
    queryKey: [...foodsKeys.recent(), limit],
    queryFn: () => repositories.foods.listRecent(limit),
  });
}

/** Ids dos alimentos já registrados em refeições. */
export function useUsedFoodIds() {
  return useQuery({
    queryKey: foodsKeys.used(),
    queryFn: async () => new Set(await repositories.foods.listUsedIds()),
  });
}

/** Mutation que invalida todo o cache de alimentos ao concluir. */
function useFoodsMutation<TInput, TResult>(mutationFn: (input: TInput) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: foodsKeys.all }),
  });
}

export const useCreateFood = () => useFoodsMutation((input: FoodInput) => repositories.foods.create(input));

export const useUpdateFood = () =>
  useFoodsMutation(({ foodId, input }: { foodId: string; input: FoodInput }) =>
    repositories.foods.update(foodId, input),
  );

export const useDuplicateFood = () =>
  useFoodsMutation((foodId: string) => repositories.foods.duplicate(foodId));

export const useSetFavorite = () =>
  useFoodsMutation(({ foodId, favorite }: { foodId: string; favorite: boolean }) =>
    repositories.foods.setFavorite(foodId, favorite),
  );

export const useSetArchived = () =>
  useFoodsMutation(({ foodId, archived }: { foodId: string; archived: boolean }) =>
    repositories.foods.setArchived(foodId, archived),
  );

export const useDeleteFood = () => useFoodsMutation((foodId: string) => repositories.foods.remove(foodId));
