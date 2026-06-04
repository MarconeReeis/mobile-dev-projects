/**
 * Push exige Apple Developer Program (capability + aps-environment).
 * Ativar quando a conta paga e o Firebase/APNs estiverem configurados.
 */
export const FEATURE_FLAGS = {
  pushNotifications: false,
} as const;
