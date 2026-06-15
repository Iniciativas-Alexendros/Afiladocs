import { describe, it, expect, beforeEach, vi } from "vitest";

describe("env — publicEnv", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("resolveSiteUrl: uses NEXT_PUBLIC_SITE_URL when set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://afiladocs.com");
    const { publicEnv } = await import("@/lib/env");
    expect(publicEnv.siteUrl).toBe("https://afiladocs.com");
    vi.unstubAllEnvs();
  });

  it("resolveSiteUrl: prepends https:// to VERCEL_URL when no custom domain", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_URL", "afiladocs.vercel.app");
    const { publicEnv } = await import("@/lib/env");
    expect(publicEnv.siteUrl).toBe("https://afiladocs.vercel.app");
    vi.unstubAllEnvs();
  });

  it("resolveSiteUrl: falls back to localhost in development", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    const { publicEnv } = await import("@/lib/env");
    expect(publicEnv.siteUrl).toBe("http://localhost:3000");
    vi.unstubAllEnvs();
  });
});

describe("env — serverEnv lazy getters", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("optional getters return empty string when not set", async () => {
    vi.stubEnv("N8N_CONTACT_WEBHOOK_URL", "");
    const { serverEnv } = await import("@/lib/env");
    expect(serverEnv.n8nContactWebhook).toBe("");
    vi.unstubAllEnvs();
  });

  it("docusealApiUrl falls back to api.docuseal.com default", async () => {
    vi.stubEnv("DOCUSEAL_API_URL", "");
    const { serverEnv } = await import("@/lib/env");
    expect(serverEnv.docusealApiUrl).toBe("https://api.docuseal.com");
    vi.unstubAllEnvs();
  });

  it("reads required secrets verbatim when present", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_abc");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_abc");
    vi.stubEnv("RESEND_API_KEY", "re_abc");
    vi.stubEnv("DATABASE_URL", "postgres://x");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role");
    const { serverEnv } = await import("@/lib/env");
    expect(serverEnv.stripeSecretKey).toBe("sk_test_abc");
    expect(serverEnv.stripeWebhookSecret).toBe("whsec_abc");
    expect(serverEnv.resendApiKey).toBe("re_abc");
    expect(serverEnv.databaseUrl).toBe("postgres://x");
    expect(serverEnv.supabaseServiceRoleKey).toBe("service-role");
    vi.unstubAllEnvs();
  });

  it("applies defaults for resendFromEmail, templatesBucket and opsEmail", async () => {
    vi.stubEnv("RESEND_FROM_EMAIL", "");
    vi.stubEnv("TEMPLATES_BUCKET", "");
    vi.stubEnv("OPS_EMAIL", "");
    const { serverEnv } = await import("@/lib/env");
    expect(serverEnv.resendFromEmail).toBe("noreply@afiladocs.com");
    expect(serverEnv.templatesBucket).toBe("templates");
    expect(serverEnv.opsEmail).toBe("ops@afiladocs.com");
    vi.unstubAllEnvs();
  });

  it("reviewSlaHours defaults to 72 and parses a custom number", async () => {
    vi.stubEnv("REVIEW_SLA_HOURS", "");
    let env = (await import("@/lib/env")).serverEnv;
    expect(env.reviewSlaHours).toBe(72);
    vi.resetModules();
    vi.stubEnv("REVIEW_SLA_HOURS", "48");
    env = (await import("@/lib/env")).serverEnv;
    expect(env.reviewSlaHours).toBe(48);
    vi.unstubAllEnvs();
  });

  it("easyVerifactu getters expose EASYVERIFACTU_* values", async () => {
    vi.stubEnv("EASYVERIFACTU_API_URL", "https://ev.test");
    vi.stubEnv("EASYVERIFACTU_API_KEY", "ev-key");
    const { serverEnv } = await import("@/lib/env");
    expect(serverEnv.easyVerifactuApiUrl).toBe("https://ev.test");
    expect(serverEnv.easyVerifactuApiKey).toBe("ev-key");
    vi.unstubAllEnvs();
  });

  it("geoBlockedCountries parses, trims, uppercases and drops empties", async () => {
    vi.stubEnv("GEO_BLOCKED_COUNTRIES", " es , fr ,,ru ");
    const { serverEnv } = await import("@/lib/env");
    expect(serverEnv.geoBlockedCountries).toEqual(["ES", "FR", "RU"]);
    vi.unstubAllEnvs();
  });

  it("geoBlockedCountries is empty by default (RGPD-safe)", async () => {
    vi.stubEnv("GEO_BLOCKED_COUNTRIES", "");
    const { serverEnv } = await import("@/lib/env");
    expect(serverEnv.geoBlockedCountries).toEqual([]);
    vi.unstubAllEnvs();
  });

  it("throws for a missing required var when NODE_ENV=production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    const { serverEnv } = await import("@/lib/env");
    expect(() => serverEnv.stripeSecretKey).toThrow(
      /Missing required environment variable: STRIPE_SECRET_KEY/,
    );
    vi.unstubAllEnvs();
  });
});
