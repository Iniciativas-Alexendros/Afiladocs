import { describe, it, expect, vi, beforeEach } from "vitest";

const { getUser, from, redirect, createClient } = vi.hoisted(() => {
  const getUser = vi.fn();
  const from = vi.fn();
  const redirect = vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  });
  const createClient = vi.fn(async () => ({ auth: { getUser }, from }));
  return { getUser, from, redirect, createClient };
});

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/navigation", () => ({ redirect }));

import { requireAuth, requireRole, getUser as getUserFn } from "@/lib/auth";

describe("lib/auth", () => {
  beforeEach(() => {
    getUser.mockReset();
    from.mockReset();
    redirect.mockClear();
  });

  describe("requireAuth", () => {
    it("returns the user when authenticated", async () => {
      getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      await expect(requireAuth()).resolves.toEqual({ id: "u1" });
      expect(redirect).not.toHaveBeenCalled();
    });

    it("redirects to /login when there is no user", async () => {
      getUser.mockResolvedValue({ data: { user: null }, error: null });
      await expect(requireAuth()).rejects.toThrow("NEXT_REDIRECT:/login");
    });

    it("redirects to /login on auth error", async () => {
      getUser.mockResolvedValue({
        data: { user: null },
        error: new Error("x"),
      });
      await expect(requireAuth()).rejects.toThrow("NEXT_REDIRECT:/login");
    });
  });

  describe("requireRole", () => {
    function mockProfile(role: string | null) {
      from.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: role ? { role } : null }),
          }),
        }),
      });
    }

    it("returns user + role when the role is allowed", async () => {
      getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      mockProfile("admin");
      await expect(requireRole(["admin", "ops"])).resolves.toEqual({
        user: { id: "u1" },
        role: "admin",
      });
    });

    it("redirects to /portal when the role is not allowed", async () => {
      getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      mockProfile("client");
      await expect(requireRole(["admin"])).rejects.toThrow(
        "NEXT_REDIRECT:/portal",
      );
    });

    it("redirects to /portal when there is no profile", async () => {
      getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      mockProfile(null);
      await expect(requireRole(["admin"])).rejects.toThrow(
        "NEXT_REDIRECT:/portal",
      );
    });
  });

  describe("getUser", () => {
    it("returns the user without redirecting", async () => {
      getUser.mockResolvedValue({ data: { user: { id: "u9" } } });
      await expect(getUserFn()).resolves.toEqual({ id: "u9" });
      expect(redirect).not.toHaveBeenCalled();
    });
  });
});
