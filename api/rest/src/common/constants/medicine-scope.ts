/**
 * PharmSyCare — medicine-only mode.
 * Set MEDICINE_ONLY_MODE=false in .env to restore all PickBazar verticals.
 */
export const MEDICINE_SCOPE = {
  enabled: process.env.MEDICINE_ONLY_MODE !== 'false',
  typeSlug: 'medicine',
  typeId: 11,
  shopSlug: 'medicine',
  shopId: 11,
} as const;
