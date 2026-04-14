import type { SigningAdapter } from './adapter'
import { DocuSealAdapter } from './docuseal'

export function getSigningAdapter(): SigningAdapter {
  return new DocuSealAdapter()
}

export type { SigningAdapter, SigningDocument, CreateDocumentInput, SigningWebhookEvent } from './adapter'
