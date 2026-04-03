import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CartProvider } from '@/hooks/useCart'
import { CookieBanner } from '@/components/CookieBanner'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <Header />
      <main>{children}</main>
      <Footer />
      <CookieBanner />
    </CartProvider>
  )
}
