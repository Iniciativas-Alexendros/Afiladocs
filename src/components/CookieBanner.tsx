'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CookieConsent {
  analytics: boolean
  timestamp: string
  expiresAt: string // ISO — RGPD: re-consentimiento cada 12 meses
}

const STORAGE_KEY = 'afiladocs-cookie-consent'
const CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000 // 12 meses

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) { setVisible(true); return }

      const parsed: CookieConsent = JSON.parse(stored)
      // Validar expiración — si el consentimiento es antiguo o no tiene expiresAt, pedir de nuevo
      if (!parsed.expiresAt || new Date() > new Date(parsed.expiresAt)) {
        localStorage.removeItem(STORAGE_KEY)
        setVisible(true)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      setVisible(true)
    }
  }, [])

  function accept(analytics: boolean) {
    const now = new Date()
    const consent: CookieConsent = {
      analytics,
      timestamp: now.toISOString(),
      expiresAt: new Date(now.getTime() + CONSENT_TTL_MS).toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          Usamos cookies técnicas esenciales para el funcionamiento del sitio. Con tu
          permiso, también usamos cookies analíticas para mejorar la experiencia.{' '}
          <Link href="/legal/cookies" className="underline underline-offset-2 hover:text-foreground">
            Política de cookies
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => accept(false)}
          >
            Solo esenciales
          </Button>
          <Button
            size="sm"
            onClick={() => accept(true)}
          >
            Aceptar todas
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook para leer el consentimiento de analytics.
 * Úsalo antes de activar scripts de analítica (GA, Plausible, etc.).
 */
export function useAnalyticsConsent(): boolean {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return
      const parsed: CookieConsent = JSON.parse(stored)
      if (parsed.expiresAt && new Date() <= new Date(parsed.expiresAt)) {
        setConsented(parsed.analytics)
      }
    } catch {
      // Consentimiento inválido — tratar como no consentido
    }
  }, [])

  return consented
}
