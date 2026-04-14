import type { SigningAdapter, SigningDocument, CreateDocumentInput } from './adapter'
import { serverEnv } from '@/lib/env'

export interface CreateFromTemplateInput {
  templateId: number
  orderId: string
  productSku: string
  submitter: {
    name: string
    email: string
    role?: string
    fields?: Record<string, string | number | boolean>
  }
  sendEmail?: boolean
  redirectUrl?: string
}

export function buildSubmitterPayload(input: CreateFromTemplateInput) {
  const { submitter } = input
  const values = submitter.fields
    ? Object.entries(submitter.fields).map(([name, default_value]) => ({ name, default_value }))
    : undefined
  return [
    {
      name: submitter.name,
      email: submitter.email,
      role: submitter.role ?? 'First Party',
      ...(values ? { values } : {}),
    },
  ]
}

/**
 * DocuSeal implementation of SigningAdapter.
 * Docs: https://www.docuseal.com/docs/api
 */
export class DocuSealAdapter implements SigningAdapter {
  private readonly apiUrl: string
  private readonly apiKey: string

  constructor() {
    const apiKey = serverEnv.docusealApiKey
    if (!apiKey) {
      throw new Error('DOCUSEAL_API_KEY must be configured')
    }
    this.apiUrl = serverEnv.docusealApiUrl
    this.apiKey = apiKey
  }

  private async request(path: string, op: string, init: RequestInit = {}): Promise<Response> {
    const hasBody = init.body != null
    const res = await fetch(`${this.apiUrl}${path}`, {
      ...init,
      headers: {
        'X-Auth-Token': this.apiKey,
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers ?? {}),
      },
    })
    if (!res.ok) {
      throw new Error(`DocuSeal ${op} failed (${res.status}): ${await res.text()}`)
    }
    return res
  }

  async createFromTemplate(input: CreateFromTemplateInput): Promise<SigningDocument> {
    const res = await this.request('/submissions', 'createFromTemplate', {
      method: 'POST',
      body: JSON.stringify({
        template_id: input.templateId,
        send_email: input.sendEmail ?? true,
        submitters: buildSubmitterPayload(input),
        ...(input.redirectUrl ? { completed_redirect_url: input.redirectUrl } : {}),
        metadata: { orderId: input.orderId, productSku: input.productSku },
      }),
    })
    const data = (await res.json()) as Array<{ submission_id: number; status?: string }>
    const first = data[0]
    if (!first?.submission_id) {
      throw new Error(`DocuSeal createFromTemplate returned no submission_id: ${JSON.stringify(data)}`)
    }
    return {
      id: String(first.submission_id),
      status: this.normalizeStatus(first.status ?? 'pending'),
    }
  }

  async createDocument(input: CreateDocumentInput): Promise<SigningDocument> {
    const base64 = Buffer.from(input.pdfBuffer).toString('base64')
    const res = await this.request('/templates/pdf', 'createDocument', {
      method: 'POST',
      body: JSON.stringify({
        name: input.title,
        documents: [{ name: input.title, file: `data:application/pdf;base64,${base64}` }],
        submitters: input.signatories.map((s) => ({ name: s.name, email: s.email, role: 'Form Submitter' })),
        send_email: true,
        bcc_completed: false,
        ...(input.redirectUrl ? { completed_redirect_url: input.redirectUrl } : {}),
        metadata: { orderId: input.orderId },
      }),
    })
    const data = (await res.json()) as { id: number; status: string; completed_at?: string }
    return {
      id: String(data.id),
      status: this.normalizeStatus(data.status),
      completedAt: data.completed_at,
    }
  }

  async getDocumentPdf(documentId: string): Promise<ArrayBuffer> {
    const res = await this.request(`/submissions/${documentId}/download`, 'getDocumentPdf')
    return res.arrayBuffer()
  }

  async getStatus(documentId: string): Promise<SigningDocument> {
    const res = await this.request(`/submissions/${documentId}`, 'getStatus')
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
