import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));
vi.mock("@/lib/env", () => ({
  serverEnv: {
    resendApiKey: "re_test",
    resendFromEmail: "no-reply@afiladocs.com",
  },
}));

import { sendEmail, safeSendEmail } from "@/lib/email/send";

const element = React.createElement("div");

describe("lib/email/send", () => {
  beforeEach(() => send.mockReset());

  describe("sendEmail", () => {
    it("normalizes a single recipient to an array and returns data", async () => {
      send.mockResolvedValue({ data: { id: "email-1" }, error: null });

      const out = await sendEmail({
        to: "a@b.com",
        subject: "Hola",
        react: element,
      });

      const [params] = send.mock.calls[0];
      expect(params.from).toBe("no-reply@afiladocs.com");
      expect(params.to).toEqual(["a@b.com"]);
      expect(params.subject).toBe("Hola");
      expect(out).toEqual({ id: "email-1" });
    });

    it("passes through an array of recipients", async () => {
      send.mockResolvedValue({ data: {}, error: null });
      await sendEmail({
        to: ["a@b.com", "c@d.com"],
        subject: "s",
        react: element,
      });
      expect(send.mock.calls[0][0].to).toEqual(["a@b.com", "c@d.com"]);
    });

    it("throws when Resend returns an error", async () => {
      send.mockResolvedValue({
        data: null,
        error: { message: "rate limited" },
      });
      await expect(
        sendEmail({ to: "a@b.com", subject: "s", react: element }),
      ).rejects.toThrow(/Resend error: rate limited/);
    });
  });

  describe("safeSendEmail", () => {
    it("resolves silently on success", async () => {
      send.mockResolvedValue({ data: {}, error: null });
      await expect(
        safeSendEmail({ to: "a@b.com", subject: "s", react: element }, "evt"),
      ).resolves.toBeUndefined();
    });

    it("swallows errors instead of throwing", async () => {
      send.mockResolvedValue({ data: null, error: { message: "boom" } });
      await expect(
        safeSendEmail(
          { to: "a@b.com", subject: "s", react: element },
          "email.failed",
          { orderId: "o1" },
        ),
      ).resolves.toBeUndefined();
    });
  });
});
