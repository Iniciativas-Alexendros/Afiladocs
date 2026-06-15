import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireAuth, redirect, sessionsCreate } = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  sessionsCreate: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAuth }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/env", () => ({
  serverEnv: { stripeSecretKey: "sk_test_x" },
  publicEnv: { siteUrl: "https://afiladocs.com" },
}));
vi.mock("stripe", () => ({
  default: class {
    checkout = { sessions: { create: sessionsCreate } };
  },
}));

import { createCheckoutSession } from "@/lib/stripe/actions";

describe("lib/stripe/actions · createCheckoutSession", () => {
  beforeEach(() => {
    requireAuth.mockReset();
    sessionsCreate.mockReset();
    redirect.mockClear();
    requireAuth.mockResolvedValue({ id: "user-1", email: "a@b.com" });
  });

  it("creates a payment session with the user identity and redirects to its URL", async () => {
    sessionsCreate.mockResolvedValue({
      url: "https://checkout.stripe.com/s/1",
    });

    await expect(
      createCheckoutSession("price_123", "https://afiladocs.com/tienda"),
    ).rejects.toThrow("NEXT_REDIRECT:https://checkout.stripe.com/s/1");

    const [params] = sessionsCreate.mock.calls[0];
    expect(params.mode).toBe("payment");
    expect(params.customer_email).toBe("a@b.com");
    expect(params.client_reference_id).toBe("user-1");
    expect(params.line_items[0].price).toBe("price_123");
    expect(params.metadata).toEqual({
      userId: "user-1",
      productId: "price_123",
    });
    expect(params.success_url).toContain("/pago-exitoso");
    expect(redirect).toHaveBeenCalledWith("https://checkout.stripe.com/s/1");
  });

  it("throws when Stripe returns a session without URL", async () => {
    sessionsCreate.mockResolvedValue({ url: null });

    await expect(
      createCheckoutSession("price_123", "https://afiladocs.com/tienda"),
    ).rejects.toThrow("Could not create checkout session");
    expect(redirect).not.toHaveBeenCalled();
  });
});
