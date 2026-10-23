import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { repositories } from "@/data";
import { goalsFor } from "@/domain/nutrition/calculations";
import type { Goals } from "@/domain/nutrition/goals";
import type { GoalVersion, ISODate } from "@/domain/nutrition/types";

export const goalsKeys = {
  all: ["goals"] as const,
  versions: () => [...goalsKeys.all, "versions"] as const,
};

export function useGoalVersions() {
  return useQuery({ queryKey: goalsKeys.versions(), queryFn: () => repositories.goals.listVersions() });
}

/** Versão de metas vigente na data (null = sem meta configurada). */
export function useGoalsOn(date: ISODate) {
  return useQuery({
    queryKey: goalsKeys.versions(),
    queryFn: () => repositories.goals.listVersions(),
    select: (versions: GoalVersion[]) => goalsFor(versions, date) ?? null,
  });
}

function useGoalsMutation<TInput, TResult>(mutationFn: (input: TInput) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: goalsKeys.all }),
  });
}

export const useSaveGoalVersion = () =>
  useGoalsMutation(({ startDate, goals }: { startDate: ISODate; goals: Goals }) =>
    repositories.goals.saveVersion(startDate, goals),
  );

export const useDeleteGoalVersion = () =>
  useGoalsMutation((versionId: string) => repositories.goals.deleteVersion(versionId));
