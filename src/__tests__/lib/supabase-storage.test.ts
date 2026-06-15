import { describe, it, expect, vi, beforeEach } from "vitest";

const { createSignedUrl } = vi.hoisted(() => ({ createSignedUrl: vi.fn() }));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: () => ({
    storage: { from: () => ({ createSignedUrl }) },
  }),
}));

import { getSignedDownloadUrl } from "@/lib/supabase/storage";

describe("lib/supabase/storage · getSignedDownloadUrl", () => {
  beforeEach(() => createSignedUrl.mockReset());

  it("returns the signed URL and forwards bucket/path/expiry", async () => {
    createSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://s/u" },
      error: null,
    });
    const url = await getSignedDownloadUrl("documents", "o1/doc.pdf", 120);
    expect(url).toBe("https://s/u");
    expect(createSignedUrl).toHaveBeenCalledWith("o1/doc.pdf", 120);
  });

  it("defaults expiry to 3600s", async () => {
    createSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://x" },
      error: null,
    });
    await getSignedDownloadUrl("documents", "p.pdf");
    expect(createSignedUrl).toHaveBeenCalledWith("p.pdf", 3600);
  });

  it("throws when supabase returns an error", async () => {
    createSignedUrl.mockResolvedValue({
      data: null,
      error: { message: "denied" },
    });
    await expect(getSignedDownloadUrl("documents", "p.pdf")).rejects.toThrow(
      /Failed to generate signed URL: denied/,
    );
  });

  it("throws when no signed URL is returned", async () => {
    createSignedUrl.mockResolvedValue({
      data: { signedUrl: null },
      error: null,
    });
    await expect(getSignedDownloadUrl("documents", "p.pdf")).rejects.toThrow(
      /No URL returned/,
    );
  });
});
