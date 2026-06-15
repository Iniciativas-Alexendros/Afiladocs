import { describe, it, expect, vi, beforeEach } from "vitest";

const { queryRaw } = vi.hoisted(() => ({ queryRaw: vi.fn() }));

vi.mock("@/lib/prisma/client", () => ({
  prisma: { $queryRaw: queryRaw },
}));

import {
  rangeToDate,
  getRevenueMonthly,
  getSlaPercentiles,
  getFunnelCounts,
} from "@/lib/prisma/orders";

describe("lib/prisma/orders", () => {
  beforeEach(() => queryRaw.mockReset());

  describe("rangeToDate", () => {
    it("maps 7d/30d/90d to a date in the past", () => {
      const now = Date.now();
      expect(now - rangeToDate("7d").getTime()).toBeCloseTo(7 * 86400_000, -5);
      expect(now - rangeToDate("30d").getTime()).toBeCloseTo(
        30 * 86400_000,
        -5,
      );
      expect(now - rangeToDate("90d").getTime()).toBeCloseTo(
        90 * 86400_000,
        -5,
      );
    });

    it("mtd returns the first day of the current UTC month", () => {
      const d = rangeToDate("mtd");
      expect(d.getUTCDate()).toBe(1);
      expect(d.getUTCHours()).toBe(0);
    });
  });

  describe("getRevenueMonthly", () => {
    it("serializes month to ISO and converts bigint cents to number", async () => {
      queryRaw.mockResolvedValue([
        {
          month: new Date("2026-05-01T00:00:00Z"),
          revenue_cents: BigInt(12300),
        },
      ]);
      const out = await getRevenueMonthly("30d");
      expect(out).toEqual([
        { month: "2026-05-01T00:00:00.000Z", revenue_cents: 12300 },
      ]);
    });
  });

  describe("getSlaPercentiles", () => {
    it("rejects non-positive or non-integer days", async () => {
      await expect(getSlaPercentiles(0)).rejects.toThrow(/positive integer/);
      await expect(getSlaPercentiles(1.5)).rejects.toThrow(/positive integer/);
    });

    it("returns nulls when sample_size is zero", async () => {
      queryRaw.mockResolvedValue([
        { p50: null, p90: null, p99: null, sample_size: BigInt(0) },
      ]);
      const out = await getSlaPercentiles(30);
      expect(out).toEqual({ p50: null, p90: null, p99: null, sample_size: 0 });
    });

    it("maps percentiles and sample size when data exists", async () => {
      queryRaw.mockResolvedValue([
        { p50: 1.2, p90: 3.4, p99: 5.6, sample_size: BigInt(42) },
      ]);
      const out = await getSlaPercentiles(30);
      expect(out).toEqual({ p50: 1.2, p90: 3.4, p99: 5.6, sample_size: 42 });
    });

    it("returns the empty shape when the query yields no rows", async () => {
      queryRaw.mockResolvedValue([]);
      const out = await getSlaPercentiles(30);
      expect(out.sample_size).toBe(0);
    });
  });

  describe("getFunnelCounts", () => {
    it("converts all bigint counters to numbers", async () => {
      queryRaw.mockResolvedValue([
        {
          created: BigInt(10),
          paid: BigInt(7),
          intake_complete: BigInt(5),
          signed: BigInt(3),
        },
      ]);
      const out = await getFunnelCounts("30d");
      expect(out).toEqual({
        created: 10,
        paid: 7,
        intake_complete: 5,
        signed: 3,
      });
    });

    it("returns zeros when the query yields no rows", async () => {
      queryRaw.mockResolvedValue([]);
      const out = await getFunnelCounts();
      expect(out).toEqual({
        created: 0,
        paid: 0,
        intake_complete: 0,
        signed: 0,
      });
    });
  });
});
