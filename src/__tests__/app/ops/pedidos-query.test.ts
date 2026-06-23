import { describe, expect, it } from "vitest";
import {
  buildOrderOrderBy,
  buildOrderWhere,
  OrderFiltersSchema,
} from "@/app/ops/pedidos/query";

describe("buildOrderWhere", () => {
  it("returns empty object for empty filters", () => {
    expect(buildOrderWhere({})).toEqual({});
  });

  it("applies direct equality filters", () => {
    const where = buildOrderWhere({
      status: "processing",
      product_sku: "AFD-PCK-001",
      eidas_level: "AES",
    });
    expect(where).toMatchObject({
      status: "processing",
      product_sku: "AFD-PCK-001",
      eidas_level: "AES",
    });
  });

  it("builds created_at range from from/to", () => {
    const where = buildOrderWhere({ from: "2026-01-01", to: "2026-04-15" }) as {
      created_at: { gte: Date; lte: Date };
    };
    expect(where.created_at.gte).toBeInstanceOf(Date);
    expect(where.created_at.lte).toBeInstanceOf(Date);
  });

  it("expands q freetext into OR over user fields + id prefix", () => {
    const where = buildOrderWhere({ q: "acme" }) as { OR: unknown[] };
    expect(Array.isArray(where.OR)).toBe(true);
    expect(where.OR).toHaveLength(3);
  });

  it("trims whitespace-only q", () => {
    const where = buildOrderWhere({ q: "   " });
    expect(where).not.toHaveProperty("OR");
  });
});

describe("buildOrderOrderBy", () => {
  it("defaults to created_at desc", () => {
    expect(buildOrderOrderBy({})).toEqual({ created_at: "desc" });
  });

  it("respects sort + dir", () => {
    expect(buildOrderOrderBy({ sort: "amount_cents", dir: "asc" })).toEqual({
      amount_cents: "asc",
    });
  });

  it("ignores unsafe sort keys (falls back to created_at)", () => {
    expect(
      buildOrderOrderBy({ sort: "drop_table" as unknown as "created_at" }),
    ).toEqual({ created_at: "desc" });
  });
});

describe("OrderFiltersSchema", () => {
  it("parses valid input", () => {
    const parsed = OrderFiltersSchema.parse({
      status: "processing",
      sort: "created_at",
      dir: "desc",
    });
    expect(parsed.status).toBe("processing");
  });

  it("rejects invalid sort", () => {
    expect(() => OrderFiltersSchema.parse({ sort: "drop_table" })).toThrow();
  });
});
