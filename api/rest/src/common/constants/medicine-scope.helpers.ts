import { MEDICINE_SCOPE } from './medicine-scope';

type WithSlug = { slug?: string };
type WithType = { type?: { slug?: string; id?: number }; type_id?: number };
type WithShop = { shop?: { slug?: string; id?: number }; shop_id?: number };

export function isMedicineScopeEnabled(): boolean {
  return MEDICINE_SCOPE.enabled;
}

export function isMedicineTypeSlug(slug?: string): boolean {
  return slug === MEDICINE_SCOPE.typeSlug;
}

export function isMedicineTypeEntity(item: WithType): boolean {
  const slug = item?.type?.slug;
  const typeId = item?.type?.id ?? item?.type_id;
  return (
    isMedicineTypeSlug(slug) ||
    typeId === MEDICINE_SCOPE.typeId
  );
}

export function isMedicineShopEntity(item: WithShop): boolean {
  const slug = item?.shop?.slug;
  const shopId = item?.shop?.id ?? item?.shop_id;
  return (
    slug === MEDICINE_SCOPE.shopSlug ||
    shopId === MEDICINE_SCOPE.shopId
  );
}

export function applyMedicineScopeToTypes<T extends WithSlug>(items: T[]): T[] {
  if (!isMedicineScopeEnabled()) {
    return items;
  }
  return items.filter((item) => isMedicineTypeSlug(item.slug));
}

export function applyMedicineScopeToShops<T extends WithSlug>(items: T[]): T[] {
  if (!isMedicineScopeEnabled()) {
    return items;
  }
  return items.filter((item) => item.slug === MEDICINE_SCOPE.shopSlug);
}

export function applyMedicineScopeToProducts<T extends WithType & WithShop>(
  items: T[],
): T[] {
  if (!isMedicineScopeEnabled()) {
    return items;
  }
  return items.filter(
    (item) => isMedicineTypeEntity(item) || isMedicineShopEntity(item),
  );
}

export function applyMedicineScopeToCategories<T extends WithType>(
  items: T[],
): T[] {
  if (!isMedicineScopeEnabled()) {
    return items;
  }
  return items.filter((item) => isMedicineTypeEntity(item));
}
