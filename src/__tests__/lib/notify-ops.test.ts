import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { getUrl } = vi.hoisted(() => ({ getUrl: vi.fn() }));

vi.mock("@/lib/env", () => ({
  serverEnv: {
    get n8nErrorWebhookUrl() {
      return getUrl();
    },
  },
}));

import { notifyOpsError } from "@/lib/alerts/notify-ops";

describe("lib/alerts/notify-ops", () => {
  const ORIG_FETCH = globalThis.fetch;

  beforeEach(() => getUrl.mockReset());
  afterEach(() => {
    globalThis.fetch = ORIG_FETCH;
    vi.restoreAllMocks();
  });

  it("returns silently when no webhook URL is configured", async () => {
    getUrl.mockReturnValue("");
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await notifyOpsError({ event: "e", message: "m" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("POSTs the payload with default severity warning and a timestamp", async () => {
    getUrl.mockReturnValue("https://n8n.test/error");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await notifyOpsError({
      event: "dispatch.failed",
      message: "boom",
      metadata: { orderId: "o1" },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://n8n.test/error");
    const body = JSON.parse(init.body);
    expect(body.event).toBe("dispatch.failed");
    expect(body.severity).toBe("warning");
    expect(body.metadata).toEqual({ orderId: "o1" });
    expect(body.ts).toBeDefined();
  });

  it("never throws when fetch rejects (fail-safe)", async () => {
    getUrl.mockReturnValue("https://n8n.test/error");
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new Error("network")) as unknown as typeof fetch;
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      notifyOpsError({ event: "e", message: "m", severity: "critical" }),
    ).resolves.toBeUndefined();
    expect(errSpy).toHaveBeenCalledOnce();
  });
});
