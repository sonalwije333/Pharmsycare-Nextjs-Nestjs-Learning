/** Shop frontend — medicine-only mode (matches API MEDICINE_ONLY_MODE). */
export const MEDICINE_SCOPE = {
  enabled: process.env.NEXT_PUBLIC_MEDICINE_ONLY_MODE !== 'false',
  typeSlug: 'medicine',
  shopSlug: 'medicine',
} as const;

export function filterMedicineTypes<T extends { slug?: string }>(
  types?: T[],
): T[] {
  if (!MEDICINE_SCOPE.enabled || !types?.length) {
    return types ?? [];
  }
  return types.filter((type) => type.slug === MEDICINE_SCOPE.typeSlug);
}
