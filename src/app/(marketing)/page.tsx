import type { Metadata } from 'next'

export const revalidate = 3600

import { HeroSection } from '@/components/marketing/HeroSection'
import { ProcessSteps } from '@/components/marketing/ProcessSteps'
import { CatalogSection } from '@/components/marketing/CatalogSection'
import { ReviewSection } from '@/components/marketing/ReviewSection'
import { SocialProof } from '@/components/marketing/SocialProof'
import { FaqAccordion } from '@/components/marketing/FaqAccordion'
import { FinalCta } from '@/components/marketing/FinalCta'
import { getActiveProducts } from '@/lib/catalog/query'

export const metadata: Metadata = {
  title: 'Afiladocs — Documentos legales a precio cerrado',
  description:
    'Redacción y revisión de documentos jurídicos por abogados colegiados. Precio cerrado, 100 % online, entrega en 48 h. Contratos, recursos, informes y más desde Valencia.',
}

export default async function HomePage() {
  const products = await getActiveProducts().catch(() => []).then(all => all.slice(0, 6))

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
