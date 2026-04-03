import type { SigningAdapter, SigningDocument, CreateDocumentInput } from './adapter'

/**
 * DocuSeal implementation of SigningAdapter.
 * Docs: https://www.docuseal.com/docs/api
 */
export class DocuSealAdapter implements SigningAdapter {
  private readonly apiUrl: string
  private readonly apiKey: string

  constructor() {
    const apiUrl = process.env.DOCUSEAL_API_URL ?? 'https://api.docuseal.com'
    const apiKey = process.env.DOCUSEAL_API_KEY ?? ''

    if (!apiKey) {
      throw new Error('DOCUSEAL_API_KEY must be configured')
    }

    this.apiUrl = apiUrl
    this.apiKey = apiKey
  }

  async createDocument(input: CreateDocumentInput): Promise<SigningDocument> {
    // Convert ArrayBuffer to base64 data URL for DocuSeal
    const base64 = Buffer.from(input.pdfBuffer).toString('base64')

    const res = await fetch(`${this.apiUrl}/templates/pdf`, {
      method: 'POST',
      headers: {
        'X-Auth-Token': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: input.title,
        documents: [{ name: input.title, file: `data:application/pdf;base64,${base64}` }],
        submitters: input.signatories.map((s) => ({
          name: s.name,
          email: s.email,
          role: 'Form Submitter',
        })),
        send_email: true,
        bcc_completed: false,
        ...(input.redirectUrl ? { completed_redirect_url: input.redirectUrl } : {}),
        metadata: { orderId: input.orderId },
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`DocuSeal createDocument failed (${res.status}): ${body}`)
    }

    const data = (await res.json()) as { id: number; status: string; completed_at?: string }
    return {
      id: String(data.id),
      status: this.normalizeStatus(data.status),
      completedAt: data.completed_at,
    }
  }

  async getDocumentPdf(documentId: string): Promise<ArrayBuffer> {
    // DocuSeal: download completed submission PDF
    const res = await fetch(`${this.apiUrl}/submissions/${documentId}/download`, {
      headers: { 'X-Auth-Token': this.apiKey },
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`DocuSeal getDocumentPdf failed (${res.status}): ${body}`)
    }

    return res.arrayBuffer()
  }

  async getStatus(documentId: string): Promise<SigningDocument> {
    const res = await fetch(`${this.apiUrl}/submissions/${documentId}`, {
      headers: { 'X-Auth-Token': this.apiKey },
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`DocuSeal getStatus failed (${res.status}): ${body}`)
    }

    const data = (await res.json()) as { id: number; status: string; completed_at?: string }
    return {
      id: String(data.id),
      status: this.normalizeStatus(data.status),
      completedAt: data.completed_at,
    }
  }

  private normalizeStatus(status: string): SigningDocument['status'] {
    switch (status?.toLowerCase()) {
      case 'completed': return 'completed'
      case 'declined': return 'declined'
      case 'expired': return 'expired'
      default: return 'pending'
    }
  }
}
