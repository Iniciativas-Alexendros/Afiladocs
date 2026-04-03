import { createServiceRoleClient } from './service'

/**
 * Generates a signed download URL for a file in Supabase Storage.
 * URL expires after `expiresIn` seconds (default: 3600 = 1 hour).
 * Uses the service role client to bypass RLS.
 */
export async function getSignedDownloadUrl(
  bucket: string,
  path: string,
  expiresIn = 3600
): Promise<string> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to generate signed URL: ${error?.message ?? 'No URL returned'}`)
  }

  return data.signedUrl
}
