import { createServiceRoleClient } from '@/lib/supabase/service'
import { serverEnv } from '@/lib/env'

export const DEFAULT_TEMPLATE_TTL_SEC = 60 * 60 * 24 * 7

/**
 * Generate a time-limited signed URL for a master template stored in the
 * private `templates` bucket. Used by the `download_after_payment` flow and
 * by the portal to regenerate links after expiry.
 *
 * @param storagePath path within the bucket (e.g. `rgpd/AFD-RGPD-001.docx`)
 * @param ttlSec seconds the URL stays valid — defaults to 7 days
 */
export async function getTemplateSignedUrl(
  storagePath: string,
  ttlSec: number = DEFAULT_TEMPLATE_TTL_SEC,
): Promise<string> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .storage
    .from(serverEnv.templatesBucket)
    .createSignedUrl(storagePath, ttlSec)

  if (error || !data?.signedUrl) {
    throw new Error(
      `Failed to create signed URL for ${storagePath}: ${error?.message ?? 'no url returned'}`,
    )
  }
  return data.signedUrl
}
