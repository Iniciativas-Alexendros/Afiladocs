import { describe, it, expect, vi, beforeEach } from "vitest";

const { findUnique, dispatchByProductKind, safeSendEmail, notifyOpsError } =
  vi.hoisted(() => ({
    findUnique: vi.fn(),
    dispatchByProductKind: vi.fn(),
    safeSendEmail: vi.fn(),
    notifyOpsError: vi.fn(),
  }));

vi.mock("@/lib/prisma/client", () => ({
  prisma: { products: { findUnique } },
}));
vi.mock("@/lib/orders/dispatch", () => ({ dispatchByProductKind }));
vi.mock("@/lib/email/send", () => ({ safeSendEmail }));
vi.mock("@/lib/alerts/notify-ops", () => ({ notifyOpsError }));
vi.mock("@/lib/env", () => ({
  publicEnv: { siteUrl: "https://afiladocs.com" },
}));

import { fulfillOrderFromSession } from "@/lib/orders/fulfillment";

type OrderArg = Parameters<typeof fulfillOrderFromSession>[0];

function makeOrder(overrides: Record<string, unknown> = {}): OrderArg {
  return {
    id: "order-1",
    product_sku: "AFD-RGPD-BASE-001",
    user: { full_name: "Ana" },
    ...overrides,
  } as unknown as OrderArg;
}

describe("lib/orders/fulfillment", () => {
  beforeEach(() => {
    findUnique.mockReset();
    dispatchByProductKind.mockReset();
    safeSendEmail.mockReset();
    notifyOpsError.mockReset();
  });

  it("returns early when the order has no product_sku", async () => {
    await fulfillOrderFromSession(makeOrder({ product_sku: null }), "a@b.com");
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("returns without dispatching when the product is not found", async () => {
    findUnique.mockResolvedValue(null);
    await fulfillOrderFromSession(makeOrder(), "a@b.com");
    expect(dispatchByProductKind).not.toHaveBeenCalled();
    expect(notifyOpsError).not.toHaveBeenCalled();
  });

  it("sends the download email for a download_url dispatch result", async () => {
    findUnique.mockResolvedValue({
      sku: "AFD-RGPD-BASE-001",
      title: "Pack RGPD",
      delivery_mode: "download_after_payment",
    });
    dispatchByProductKind.mockResolvedValue({
      kind: "download_url",
      signedUrl: "https://signed/url",
      expiresAt: "2026-06-22T00:00:00.000Z",
    });

    await fulfillOrderFromSession(makeOrder(), "a@b.com");

    expect(safeSendEmail).toHaveBeenCalledOnce();
    const [opts] = safeSendEmail.mock.calls[0];
    expect(opts.to).toBe("a@b.com");
    expect(opts.subject).toContain("Pack RGPD");
    expect(notifyOpsError).not.toHaveBeenCalled();
  });

  it("does not email for a non-download dispatch result", async () => {
    findUnique.mockResolvedValue({
      sku: "s",
      title: "t",
      delivery_mode: "human_review",
    });
    dispatchByProductKind.mockResolvedValue({ kind: "human_review_pending" });

    await fulfillOrderFromSession(makeOrder(), "a@b.com");

    expect(safeSendEmail).not.toHaveBeenCalled();
  });

  it("notifies ops with critical severity when dispatch throws", async () => {
    findUnique.mockResolvedValue({
      sku: "s",
      title: "t",
      delivery_mode: "docuseal_fill_only",
    });
    dispatchByProductKind.mockRejectedValue(new Error("docuseal down"));

    await fulfillOrderFromSession(makeOrder(), "a@b.com");

    expect(notifyOpsError).toHaveBeenCalledOnce();
    const [payload] = notifyOpsError.mock.calls[0];
    expect(payload.event).toBe("dispatch.failed");
    expect(payload.severity).toBe("critical");
    expect(payload.message).toBe("docuseal down");
  });
});
