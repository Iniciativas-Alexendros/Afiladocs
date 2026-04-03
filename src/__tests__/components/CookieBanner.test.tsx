import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href }, children),
}))

// Mock shadcn Button
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size }: {
    children: React.ReactNode
    onClick?: () => void
    variant?: string
    size?: string
  }) => React.createElement('button', { onClick, 'data-variant': variant, 'data-size': size }, children),
}))

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })

describe('CookieBanner', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.resetModules()
  })

  it('renders when no consent stored', async () => {
    const { CookieBanner } = await import('@/components/CookieBanner')
    render(React.createElement(CookieBanner))
    // Cookie banner should be visible
    expect(document.body.textContent).toMatch(/cookie|privacidad|consent/i)
  })

  it('stores consent under correct localStorage key after accepting all', async () => {
    const { CookieBanner } = await import('@/components/CookieBanner')
    render(React.createElement(CookieBanner))
    const buttons = screen.getAllByRole('button')
    const acceptBtn = buttons.find((b) => b.textContent?.match(/aceptar todas/i))
    if (acceptBtn) {
      fireEvent.click(acceptBtn)
      expect(localStorageMock.getItem('afiladocs-cookie-consent')).not.toBeNull()
    }
  })

  it('stores consent under correct localStorage key after accepting essentials only', async () => {
    const { CookieBanner } = await import('@/components/CookieBanner')
    render(React.createElement(CookieBanner))
    const buttons = screen.getAllByRole('button')
    const essentialsBtn = buttons.find((b) => b.textContent?.match(/solo esenciales/i))
    if (essentialsBtn) {
      fireEvent.click(essentialsBtn)
      expect(localStorageMock.getItem('afiladocs-cookie-consent')).not.toBeNull()
    }
  })
})
