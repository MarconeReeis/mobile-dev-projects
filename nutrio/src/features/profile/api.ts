import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { repositories } from "@/data";
import type { ProfileInput } from "@/domain/profile/types";
import { today } from "@/lib/dates";

export const profileKeys = {
  all: ["profile"] as const,
};

export function useProfile() {
  return useQuery({ queryKey: profileKeys.all, queryFn: () => repositories.profile.get() });
}

/** Data de hoje no fuso do perfil (enquanto o perfil carrega, no fuso do navegador). */
export function useToday() {
  const profile = useProfile();
  return today(profile.data?.timezone || undefined);
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileInput) => repositories.profile.update(input),
    onSuccess: (profile) => queryClient.setQueryData(profileKeys.all, profile),
  });
}

export function useExportData() {
  return useMutation({ mutationFn: () => repositories.account.exportData() });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => repositories.account.deleteAccount(),
    // Tudo no cache pertence à conta excluída.
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
