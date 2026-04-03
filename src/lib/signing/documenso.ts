import type { SigningAdapter, SigningDocument, CreateDocumentInput } from './adapter'

/**
 * Documenso implementation of SigningAdapter.
 * Docs: https://docs.documenso.com/developers/public-api
 */
export class DocumensoAdapter implements SigningAdapter {
  private readonly apiUrl: string
  private readonly apiKey: string

  constructor() {
    const apiUrl = process.env.DOCUMENSO_API_URL ?? 'https://app.documenso.com/api/v1'
    const apiKey = process.env.DOCUMENSO_API_KEY ?? ''

    if (!apiKey) {
      throw new Error('DOCUMENSO_API_KEY must be configured')
    }

    this.apiUrl = apiUrl
    this.apiKey = apiKey
  }

  async createDocument(input: CreateDocumentInput): Promise<SigningDocument> {
    // Convert ArrayBuffer to base64
    const base64 = Buffer.from(input.pdfBuffer).toString('base64')

    const res = await fetch(`${this.apiUrl}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: input.title,
        documentData: base64,
        recipients: input.signatories.map((s) => ({
          name: s.name,
          email: s.email,
          role: 'SIGNER',
        })),
        meta: {
          redirectUrl: input.redirectUrl,
          subject: input.title,
        },
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Documenso createDocument failed (${res.status}): ${body}`)
    }

    const data = (await res.json()) as { id: string; status: string; completedAt?: string }
    return {
      id: String(data.id),
      status: this.normalizeStatus(data.status),
      completedAt: data.completedAt,
    }
  }

  async getDocumentPdf(documentId: string): Promise<ArrayBuffer> {
    const res = await fetch(
      `${this.apiUrl}/documents/${documentId}/download`,
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      }
    )

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Documenso getDocumentPdf failed (${res.status}): ${body}`)
    }

    return res.arrayBuffer()
  }

  async getStatus(documentId: string): Promise<SigningDocument> {
    const res = await fetch(`${this.apiUrl}/documents/${documentId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Documenso getStatus failed (${res.status}): ${body}`)
    }

    const data = (await res.json()) as { id: string; status: string; completedAt?: string }
    return {
      id: String(data.id),
      status: this.normalizeStatus(data.status),
      completedAt: data.completedAt,
    }
  }

  private normalizeStatus(status: string): SigningDocument['status'] {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'completed'
      case 'DECLINED': return 'declined'
      case 'EXPIRED': return 'expired'
      default: return 'pending'
    }
  }
}
