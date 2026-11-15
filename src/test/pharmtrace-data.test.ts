import { describe, expect, it } from "vitest";

import { buildGs1DataMatrixPayload, isValidGtin } from "@/lib/pharmtrace-data";

describe("PharmTrace GS1 serialization", () => {
  it("accepts the check-digit-valid demo GTIN", () => {
    expect(isValidGtin("05012345678903")).toBe(true);
  });

  it("rejects a GTIN with an invalid check digit", () => {
    expect(isValidGtin("05012345678904")).toBe(false);
  });

  it("encodes fixed and variable GS1 fields with the required separator", () => {
    expect(buildGs1DataMatrixPayload({
      gtin: "05012345678903",
      batch: "LOT-42",
      expiry: "2028-12-31",
      serial: "UNIT-01",
    })).toBe("01050123456789031728123110LOT-42\u001d21UNIT-01");
  });

  it("rejects a non-calendar expiry date", () => {
    expect(() => buildGs1DataMatrixPayload({
      gtin: "05012345678903",
      batch: "LOT-42",
      expiry: "2028-02-30",
      serial: "UNIT-01",
    })).toThrow("real expiry date");
  });
});