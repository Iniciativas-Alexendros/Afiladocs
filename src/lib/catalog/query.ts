import { cache } from 'react'
import { prisma } from '@/lib/prisma/client'

export type ProductKind = 'template' | 'review' | 'pack'
export type DeliveryMode =
  | 'docuseal_fill_and_sign'
  | 'docuseal_fill_only'
  | 'download_after_payment'
  | 'human_review'
export type EidasLevel = 'SES' | 'AES'
export type ProductCategory =
  | 'rgpd'
  | 'arrendamiento'
  | 'civil'
  | 'mercantil'
  | 'pack'
  | 'reclamacion'
  | 'review'

export const getActiveProducts = cache(async () => {
  return prisma.products.findMany({
    where: { is_active: true },
    orderBy: [{ display_order: 'asc' }, { title: 'asc' }],
  })
})

export const getProductsByCategory = cache(async (category: ProductCategory) => {
  return prisma.products.findMany({
    where: { is_active: true, category },
    orderBy: [{ display_order: 'asc' }, { title: 'asc' }],
  })
})

export const getProductBySlug = cache(async (slug: string) => {
  return prisma.products.findFirst({ where: { slug, is_active: true } })
})

export const getProductBySku = cache(async (sku: string) => {
  return prisma.products.findUnique({ where: { sku } })
})
