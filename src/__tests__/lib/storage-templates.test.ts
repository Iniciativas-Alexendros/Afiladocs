import { describe, it, expect, vi, beforeEach } from "vitest";

const { createSignedUrl } = vi.hoisted(() => ({ createSignedUrl: vi.fn() }));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: () => ({
    storage: { from: () => ({ createSignedUrl }) },
  }),
}));

vi.mock("@/lib/env", () => ({
  serverEnv: { templatesBucket: "templates" },
}));

import {
  getTemplateSignedUrl,
  DEFAULT_TEMPLATE_TTL_SEC,
} from "@/lib/storage/templates";

describe("lib/storage/templates", () => {
  beforeEach(() => {
    createSignedUrl.mockReset();
  });

  it("exposes a 7-day default TTL", () => {
    expect(DEFAULT_TEMPLATE_TTL_SEC).toBe(60 * 60 * 24 * 7);
  });

  it("returns the signed URL on success and forwards the TTL", async () => {
    createSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed/url" },
      error: null,
    });

    const url = await getTemplateSignedUrl("rgpd/AFD-RGPD-001.docx", 3600);

    expect(url).toBe("https://signed/url");
    expect(createSignedUrl).toHaveBeenCalledWith(
      "rgpd/AFD-RGPD-001.docx",
      3600,
    );
  });

  it("uses the default TTL when none is provided", async () => {
    createSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://x" },
      error: null,
    });

    await getTemplateSignedUrl("rgpd/x.docx");

    expect(createSignedUrl).toHaveBeenCalledWith(
      "rgpd/x.docx",
      DEFAULT_TEMPLATE_TTL_SEC,
    );
  });

  it("throws when supabase returns an error", async () => {
    createSignedUrl.mockResolvedValue({
      data: null,
      error: { message: "object not found" },
    });

    await expect(getTemplateSignedUrl("missing.docx")).rejects.toThrow(
      /Failed to create signed URL for missing.docx: object not found/,
    );
  });

  it("throws when no signed URL is returned", async () => {
    createSignedUrl.mockResolvedValue({
      data: { signedUrl: null },
      error: null,
    });

    await expect(getTemplateSignedUrl("empty.docx")).rejects.toThrow(
      /no url returned/,
    );
  });
});
