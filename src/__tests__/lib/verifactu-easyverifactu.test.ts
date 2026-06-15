import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EasyVerifactuAdapter } from "@/lib/verifactu/easyverifactu";
import type { InvoiceData } from "@/lib/verifactu/adapter";

const ORIG_FETCH = globalThis.fetch;
const ORIG_URL = process.env.EASYVERIFACTU_API_URL;
const ORIG_KEY = process.env.EASYVERIFACTU_API_KEY;

function sampleInvoice(): InvoiceData {
  return {
    orderId: "order-1",
    userId: "user-1",
    productId: "AFD-RGPD-BASE-001",
    amountCents: 4900,
    currency: "eur",
    issuedAt: new Date("2026-06-15T10:00:00.000Z"),
    customerNif: "21002968N",
  };
}

describe("lib/verifactu/easyverifactu (RD 1007/2023)", () => {
  beforeEach(() => {
    process.env.EASYVERIFACTU_API_URL = "https://easyverifactu.test/api";
    process.env.EASYVERIFACTU_API_KEY = "test-key";
  });

  afterEach(() => {
    globalThis.fetch = ORIG_FETCH;
    process.env.EASYVERIFACTU_API_URL = ORIG_URL;
    process.env.EASYVERIFACTU_API_KEY = ORIG_KEY;
  });

  describe("constructor", () => {
    it("throws when API URL is missing", () => {
      delete process.env.EASYVERIFACTU_API_URL;
      expect(() => new EasyVerifactuAdapter()).toThrow(/must be configured/);
    });

    it("throws when API Key is missing", () => {
      delete process.env.EASYVERIFACTU_API_KEY;
      expect(() => new EasyVerifactuAdapter()).toThrow(/must be configured/);
    });
  });

  describe("createInvoice", () => {
    it("POSTs /invoices with Bearer auth and ISO-serialized issuedAt", async () => {
      const result = {
        invoiceId: "inv-1",
        qrCode: "data:qr",
        csvSignature: "CSV123",
        chainHash: "hash123",
      };
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => result });
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      const adapter = new EasyVerifactuAdapter();
      const out = await adapter.createInvoice(sampleInvoice());

      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://easyverifactu.test/api/invoices");
      expect(init.method).toBe("POST");
      expect(init.headers.Authorization).toBe("Bearer test-key");
      expect(init.headers["Content-Type"]).toBe("application/json");
      const body = JSON.parse(init.body);
      expect(body.orderId).toBe("order-1");
      expect(body.amountCents).toBe(4900);
      expect(body.issuedAt).toBe("2026-06-15T10:00:00.000Z");
      expect(body.customerNif).toBe("21002968N");
      expect(out).toEqual(result);
    });

    it("throws with status + body on non-ok response", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "upstream error",
      }) as unknown as typeof fetch;

      const adapter = new EasyVerifactuAdapter();
      await expect(adapter.createInvoice(sampleInvoice())).rejects.toThrow(
        /createInvoice failed \(500\): upstream error/,
      );
    });
  });

  describe("cancelInvoice", () => {
    it("POSTs the cancel endpoint and resolves on ok", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      const adapter = new EasyVerifactuAdapter();
      await expect(adapter.cancelInvoice("inv-9")).resolves.toBeUndefined();
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://easyverifactu.test/api/invoices/inv-9/cancel");
      expect(init.method).toBe("POST");
      expect(init.headers.Authorization).toBe("Bearer test-key");
    });

    it("throws on non-ok response", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => "not found",
      }) as unknown as typeof fetch;

      const adapter = new EasyVerifactuAdapter();
      await expect(adapter.cancelInvoice("inv-9")).rejects.toThrow(
        /cancelInvoice failed \(404\): not found/,
      );
    });
  });

  describe("getStatus", () => {
    it("GETs the invoice and returns its status", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "registered" }),
      });
      globalThis.fetch = fetchMock as unknown as typeof fetch;

      const adapter = new EasyVerifactuAdapter();
      const out = await adapter.getStatus("inv-3");
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe("https://easyverifactu.test/api/invoices/inv-3");
      expect(out.status).toBe("registered");
    });

    it("throws on non-ok response", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => "forbidden",
      }) as unknown as typeof fetch;

      const adapter = new EasyVerifactuAdapter();
      await expect(adapter.getStatus("inv-3")).rejects.toThrow(
        /getStatus failed \(403\): forbidden/,
      );
    });
  });
});
