import { describe, it, expect, vi, afterEach } from "vitest";
import { GET } from "@/app/api/health/route";

describe("api/health", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("returns ok status with an ISO timestamp", async () => {
    const res = GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(() => new Date(body.ts).toISOString()).not.toThrow();
    expect(body.ts).toBe(new Date(body.ts).toISOString());
  });

  it("reports the app version from env, defaulting to unknown", async () => {
    let body = await GET().json();
    expect(body.version).toBe("unknown");

    vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "1.2.3");
    body = await GET().json();
    expect(body.version).toBe("1.2.3");
  });
});
