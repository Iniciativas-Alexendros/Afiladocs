// Feature flags via Vercel Edge Config.
// Graceful fallback to false when Edge Config is not configured (local dev, CI).
//
// Usage (server component or API route):
//   const enabled = await getFeatureFlag('new-checkout-flow')
//   if (enabled) { ... }
//
// Setup: add EDGE_CONFIG env var in Vercel Dashboard after creating an Edge Config store.
// Each flag is a boolean key in the Edge Config JSON, e.g. { "new-checkout-flow": true }.

let edgeConfigClient: { get: (key: string) => Promise<unknown> } | null = null

async function getEdgeConfigClient() {
  if (edgeConfigClient) return edgeConfigClient

  const connectionString = process.env.EDGE_CONFIG
  if (!connectionString) return null

  try {
    // Dynamic import avoids build-time errors when @vercel/edge-config is not installed
    const { createClient } = await import('@vercel/edge-config')
    edgeConfigClient = createClient(connectionString)
    return edgeConfigClient
  } catch {
    // Package not installed — silently degrade
    return null
  }
}

/**
 * Returns the value of a feature flag from Vercel Edge Config.
 * Falls back to `defaultValue` (default: false) when Edge Config is not configured
 * or the key does not exist.
 */
export async function getFeatureFlag(flag: string, defaultValue = false): Promise<boolean> {
  try {
    const client = await getEdgeConfigClient()
    if (!client) return defaultValue

    const value = await client.get(flag)
    if (typeof value === 'boolean') return value
    return defaultValue
  } catch {
    return defaultValue
  }
}
