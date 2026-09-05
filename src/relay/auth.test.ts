import { describe, expect, it } from "vitest";
import { isAuthorized } from "./auth";

describe("isAuthorized", () => {
  it("passes when the provided secret matches the configured secret", () => {
    expect(isAuthorized("correct-secret", "correct-secret")).toBe(true);
  });

  it("rejects a wrong secret", () => {
    expect(isAuthorized("wrong-secret", "correct-secret")).toBe(false);
  });

  it("rejects a missing provided secret", () => {
    expect(isAuthorized(undefined, "correct-secret")).toBe(false);
  });

  it("rejects when the configured secret is empty, even if the provided secret is also empty", () => {
    expect(isAuthorized("", "")).toBe(false);
  });
});
