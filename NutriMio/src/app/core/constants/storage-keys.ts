export const STORAGE_KEYS = {
  USER_PROFILE: 'nutrimio:user_profile',
  DAILY_LOGS: 'nutrimio:daily_logs',
  FOOD_CATALOG: 'nutrimio:food_catalog',
  /** @deprecated removido na migração v4 */
  SEED_VERSION: 'nutrimio:seed_version',
  DATA_MIGRATION_VERSION: 'nutrimio:data_migration_version',
} as const;

/** v4: remove dados mockados e passa a usar apenas storage real */
/** v5: adiciona referenceQuantity nos alimentos salvos em refeições */
export const CURRENT_DATA_MIGRATION_VERSION = 5;
