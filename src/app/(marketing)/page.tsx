import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma/client'

export const dynamic = 'force-dynamic'
import { HeroSection } from '@/components/marketing/HeroSection'
import { ProcessSteps } from '@/components/marketing/ProcessSteps'
import { CatalogSection } from '@/components/marketing/CatalogSection'
import { ReviewSection } from '@/components/marketing/ReviewSection'
import { SocialProof } from '@/components/marketing/SocialProof'
import { FaqAccordion } from '@/components/marketing/FaqAccordion'
import { FinalCta } from '@/components/marketing/FinalCta'

export const metadata: Metadata = {
  title: 'Afiladocs — Documentos legales a precio cerrado',
  description:
    'Redacción y revisión de documentos jurídicos por abogados colegiados. Precio cerrado, 100 % online, entrega en 48 h. Contratos, recursos, informes y más desde Valencia.',
}

export default async function HomePage() {
  const products = await prisma.products.findMany({
    where: { is_active: true },
    orderBy: { display_order: 'asc' },
    take: 6,
    select: {
      sku: true,
      slug: true,
      title: true,
      description_md: true,
      category: true,
      kind: true,
      price_cents: true,
      delivery_mode: true,
      eidas_level: true,
    },
  })

  return (
    <>
      <HeroSection />
      <ProcessSteps />
      <CatalogSection products={products} />
      <ReviewSection />
      <SocialProof />
      <FaqAccordion />
      <FinalCta />
    </>
  )
}
