import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/rate-limit", () => ({
  contactRateLimit: null,
  checkoutRateLimit: null,
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
  applyRateLimit: vi.fn().mockResolvedValue({ limited: false }),
}));

vi.mock("@/lib/csrf", () => ({
  isAllowedOrigin: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/env", () => ({
  serverEnv: {
    n8nContactWebhook: "",
    resendFromEmail: "noreply@afiladocs.com",
  },
  publicEnv: { siteUrl: "http://localhost:3000" },
}));

function makeRequest(
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "127.0.0.1",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns 400 when rgpd_accepted is false", async () => {
    const { POST } = await import("@/app/api/contact/route");
    const req = makeRequest({
      name: "Test User",
      email: "test@example.com",
      case_type: "Consulta",
      message: "Hello",
      rgpd_accepted: false,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when required fields are missing", async () => {
    const { POST } = await import("@/app/api/contact/route");
    const req = makeRequest({ name: "Test" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    vi.doMock("@/lib/rate-limit", () => ({
      contactRateLimit: {},
      checkoutRateLimit: null,
      getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
      applyRateLimit: vi
        .fn()
        .mockResolvedValue({ limited: true, reset: Date.now() + 60000 }),
    }));
    vi.resetModules();
    const { POST } = await import("@/app/api/contact/route");
    const req = makeRequest({
      name: "Test User",
      email: "test@example.com",
      case_type: "Consulta",
      message: "Hello",
      rgpd_accepted: true,
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  // Re-fija los guards "buenos" — necesario porque vi.doMock de tests previos
  // (rate-limit limited:true, csrf false) persiste a través de resetModules.
  function stubGoodGuards() {
    vi.doMock("@/lib/rate-limit", () => ({
      contactRateLimit: null,
      checkoutRateLimit: null,
      getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
      applyRateLimit: vi.fn().mockResolvedValue({ limited: false }),
    }));
    vi.doMock("@/lib/csrf", () => ({
      isAllowedOrigin: vi.fn().mockReturnValue(true),
    }));
  }

  it("returns 200 without relaying when n8n webhook is not configured", async () => {
    stubGoodGuards();
    vi.resetModules();
    const { POST } = await import("@/app/api/contact/route");
    const res = await POST(
      makeRequest({
        name: "Ana",
        email: "a@b.com",
        case_type: "Consulta",
        message: "Mensaje suficientemente largo",
        rgpd_accepted: true,
      }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  it("relays to n8n when configured and still returns 200", async () => {
    stubGoodGuards();
    vi.doMock("@/lib/env", () => ({
      serverEnv: {
        n8nContactWebhook: "https://n8n.test/hook",
        resendFromEmail: "noreply@afiladocs.com",
      },
      publicEnv: { siteUrl: "http://localhost:3000" },
    }));
    vi.resetModules();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const { POST } = await import("@/app/api/contact/route");
    const res = await POST(
      makeRequest({
        name: "Ana",
        email: "a@b.com",
        message: "Mensaje suficientemente largo",
        rgpd_accepted: true,
      }),
    );
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://n8n.test/hook",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("swallows n8n failure and still returns 200", async () => {
    stubGoodGuards();
    vi.doMock("@/lib/env", () => ({
      serverEnv: {
        n8nContactWebhook: "https://n8n.test/hook",
        resendFromEmail: "noreply@afiladocs.com",
      },
      publicEnv: { siteUrl: "http://localhost:3000" },
    }));
    vi.resetModules();
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new Error("down")) as unknown as typeof fetch;
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await import("@/app/api/contact/route");
    const res = await POST(
      makeRequest({
        name: "Ana",
        email: "a@b.com",
        message: "Mensaje suficientemente largo",
        rgpd_accepted: true,
      }),
    );
    expect(res.status).toBe(200);
    expect(errSpy).toHaveBeenCalled();
  });

  it("returns 500 when the body is not valid JSON", async () => {
    stubGoodGuards();
    vi.resetModules();
    const { POST } = await import("@/app/api/contact/route");
    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
      body: "not-json{",
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  // Va al final: el doMock de csrf=false persiste tras este test.
  it("returns 403 when the origin is not allowed", async () => {
    vi.doMock("@/lib/csrf", () => ({
      isAllowedOrigin: vi.fn().mockReturnValue(false),
    }));
    vi.resetModules();
    const { POST } = await import("@/app/api/contact/route");
    const res = await POST(makeRequest({ name: "x" }));
    expect(res.status).toBe(403);
  });
});
