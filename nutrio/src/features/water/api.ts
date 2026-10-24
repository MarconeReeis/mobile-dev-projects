import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { repositories } from "@/data";
import type { ISODate } from "@/domain/nutrition/types";

export const waterKeys = {
  all: ["water"] as const,
  range: (start: ISODate, end: ISODate) => [...waterKeys.all, "range", start, end] as const,
};

export function useWaterOn(date: ISODate) {
  return useQuery({
    queryKey: waterKeys.range(date, date),
    queryFn: () => repositories.water.listRange(date, date),
  });
}

function useWaterMutation<TInput, TResult>(mutationFn: (input: TInput) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: waterKeys.all }),
  });
}

export const useAddWater = () =>
  useWaterMutation(({ date, ml, time }: { date: ISODate; ml: number; time?: string }) =>
    repositories.water.add(date, ml, time),
  );

export const useRemoveWater = () => useWaterMutation((entryId: string) => repositories.water.remove(entryId));
