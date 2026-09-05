import { describe, expect, it } from "vitest";
import { isValidSummary } from "./validation";

describe("isValidSummary", () => {
  it("accepts a non-empty string with visible characters", () => {
    expect(isValidSummary("The owner asked about deployment options.")).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(isValidSummary("")).toBe(false);
  });

  it("rejects a whitespace-only string", () => {
    expect(isValidSummary("   \n\t  ")).toBe(false);
  });

  it("rejects a missing value", () => {
    expect(isValidSummary(undefined)).toBe(false);
  });

  it("rejects a non-string value", () => {
    expect(isValidSummary(42 as unknown as string)).toBe(false);
  });
});
