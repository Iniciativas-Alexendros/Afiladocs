import type { VerifactuAdapter, InvoiceData, VerifactuResult } from './adapter'

/**
 * EasyVerifactu implementation of the VerifactuAdapter.
 * Ref: https://easyverifactu.com/docs
 */
export class EasyVerifactuAdapter implements VerifactuAdapter {
  private readonly apiUrl: string
  private readonly apiKey: string

  constructor() {
    const apiUrl = process.env.EASYVERIFACTU_API_URL
    const apiKey = process.env.EASYVERIFACTU_API_KEY

    if (!apiUrl || !apiKey) {
      throw new Error('EasyVerifactu API URL and API Key must be configured')
    }

    this.apiUrl = apiUrl
    this.apiKey = apiKey
  }

  async createInvoice(data: InvoiceData): Promise<VerifactuResult> {
    const res = await fetch(`${this.apiUrl}/invoices`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: data.orderId,
        userId: data.userId,
        productId: data.productId,
        amountCents: data.amountCents,
        currency: data.currency,
        issuedAt: data.issuedAt.toISOString(),
        customerNif: data.customerNif,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`EasyVerifactu createInvoice failed (${res.status}): ${body}`)
    }

    return res.json() as Promise<VerifactuResult>
  }

  async cancelInvoice(invoiceId: string): Promise<void> {
    const res = await fetch(`${this.apiUrl}/invoices/${invoiceId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`EasyVerifactu cancelInvoice failed (${res.status}): ${body}`)
    }
  }

  async getStatus(invoiceId: string): Promise<{ status: string; lastError?: string }> {
    const res = await fetch(`${this.apiUrl}/invoices/${invoiceId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`EasyVerifactu getStatus failed (${res.status}): ${body}`)
    }

    return res.json() as Promise<{ status: string; lastError?: string }>
  }
}
