import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getSigningAdapter } from "@/lib/signing";
import { DocuSealAdapter } from "@/lib/signing/docuseal";

describe("lib/signing/index · getSigningAdapter", () => {
  const ORIG = {
    url: process.env.DOCUSEAL_API_URL,
    key: process.env.DOCUSEAL_API_KEY,
  };

  beforeEach(() => {
    process.env.DOCUSEAL_API_URL = "https://docuseal.test/api";
    process.env.DOCUSEAL_API_KEY = "k";
  });
  afterEach(() => {
    process.env.DOCUSEAL_API_URL = ORIG.url;
    process.env.DOCUSEAL_API_KEY = ORIG.key;
  });

  it("returns a DocuSeal adapter instance", () => {
    expect(getSigningAdapter()).toBeInstanceOf(DocuSealAdapter);
  });
});
