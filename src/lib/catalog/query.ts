import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma/client";

export type ProductKind = "template" | "review" | "pack";
export type DeliveryMode =
  | "docuseal_fill_and_sign"
  | "docuseal_fill_only"
  | "download_after_payment"
  | "human_review";
export type EidasLevel = "SES" | "AES";
export type ProductCategory =
  | "rgpd"
  | "arrendamiento"
  | "civil"
  | "mercantil"
  | "pack"
  | "reclamacion"
  | "review";

export const PRODUCTS_CACHE_TAG = "products";
const PRODUCTS_REVALIDATE_SECONDS = 3600;

/**
 * Detecta si estamos en `next build` / `next export` para evitar que el build
 * contacte PostgreSQL. Devuelve fallbacks vacíos en esa fase; el runtime
 * (ISR / SSR) rellena el caché real en el primer request.
 */
function isBuildPhase(): boolean {
  const phase = process.env.NEXT_PHASE ?? "";
  return phase === "phase-production-build" || phase === "phase-export";
}

const loadActiveProducts = unstable_cache(
  async () => {
    if (isBuildPhase()) return [];
    return prisma.products.findMany({
      where: { is_active: true },
      orderBy: [{ display_order: "asc" }, { title: "asc" }],
    });
  },
  ["catalog:active-products"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: PRODUCTS_REVALIDATE_SECONDS },
);

const loadProductsByCategory = unstable_cache(
  async (category: ProductCategory) => {
    if (isBuildPhase()) return [];
    return prisma.products.findMany({
      where: { is_active: true, category },
      orderBy: [{ display_order: "asc" }, { title: "asc" }],
    });
  },
  ["catalog:products-by-category"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: PRODUCTS_REVALIDATE_SECONDS },
);

const loadProductBySlug = unstable_cache(
  async (slug: string) => {
    if (isBuildPhase()) return null;
    return prisma.products.findFirst({ where: { slug, is_active: true } });
  },
  ["catalog:product-by-slug"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: PRODUCTS_REVALIDATE_SECONDS },
);

const loadProductBySku = unstable_cache(
  async (sku: string) => {
    if (isBuildPhase()) return null;
    return prisma.products.findUnique({ where: { sku } });
  },
  ["catalog:product-by-sku"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: PRODUCTS_REVALIDATE_SECONDS },
);

export async function getActiveProducts() {
  return loadActiveProducts().catch(() => []);
}

export async function getProductsByCategory(category: ProductCategory) {
  return loadProductsByCategory(category).catch(() => []);
}

export async function getProductBySlug(slug: string) {
  return loadProductBySlug(slug).catch(() => null);
}

export async function getProductBySku(sku: string) {
  return loadProductBySku(sku).catch(() => null);
}

export function revalidateProductsCache() {
  revalidateTag(PRODUCTS_CACHE_TAG, "default");
}
