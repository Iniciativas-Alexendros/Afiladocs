/**
 * Abstraction layer for e-signature providers.
 * DocuSeal is the only active implementation (Documenso retired in F1, 2026-04-14).
 * Pattern mirrors src/lib/verifactu/adapter.ts.
 */
export interface SigningDocument {
  /** Provider-specific document ID */
  id: string
  status: 'pending' | 'completed' | 'declined' | 'expired'
  /** ISO timestamp when signing completed */
  completedAt?: string
}

export interface CreateDocumentInput {
  /** Internal order ID for tracking */
  orderId: string
  /** Title shown to signatories */
  title: string
  /** Signed PDF buffer or base64 string to be uploaded for signing */
  pdfBuffer: ArrayBuffer
  signatories: Array<{
    name: string
    email: string
  }>
  /** Redirect URL after signing */
  redirectUrl?: string
}

export interface SigningAdapter {
  /** Upload a document to the provider and initiate signing */
  createDocument(input: CreateDocumentInput): Promise<SigningDocument>
  /** Download the signed PDF as ArrayBuffer */
  getDocumentPdf(documentId: string): Promise<ArrayBuffer>
  /** Get current document status */
  getStatus(documentId: string): Promise<SigningDocument>
}

/**
 * Normalized webhook event — provider-agnostic.
 * Each provider webhook handler normalizes to this shape before processing.
 */
export interface SigningWebhookEvent {
  /** Provider-specific document ID */
  documentId: string
  /** Normalized event type */
  eventType: 'document.completed' | 'document.declined' | 'document.expired' | 'other'
  /** Raw payload for audit purposes */
  rawPayload: Record<string, unknown>
}
