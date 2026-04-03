import type { SigningAdapter } from './adapter'
import { DocuSealAdapter } from './docuseal'
import { DocumensoAdapter } from './documenso'

/**
 * Factory: returns the active signing provider adapter based on SIGNING_PROVIDER env var.
 * Default: 'docuseal'
 *
 * Set SIGNING_PROVIDER=documenso to use Documenso (legacy).
 * Set SIGNING_PROVIDER=docuseal to use DocuSeal (default, new).
 */
export function getSigningAdapter(): SigningAdapter {
  const provider = process.env.SIGNING_PROVIDER ?? 'docuseal'

  if (provider === 'documenso') {
    return new DocumensoAdapter()
  }

  return new DocuSealAdapter()
}

export type { SigningAdapter, SigningDocument, CreateDocumentInput, SigningWebhookEvent } from './adapter'
