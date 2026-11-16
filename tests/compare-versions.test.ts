import { describe, expect, it } from "vitest";

import {
  compareVersions
} from "../src/utils/compare-versions.js";

describe("Version comparison", () => {
  it("compares stable versions", () => {
    expect(compareVersions("4.1.2", "4.1.1")).toBe(1);
    expect(compareVersions("4.1.1", "4.1.2")).toBe(-1);
    expect(compareVersions("4.1.2", "4.1.2")).toBe(0);
  });

  it("compares release candidates", () => {
    expect(compareVersions("4.1.2-RC1", "4.1.2")).toBe(-1);
    expect(compareVersions("4.1.2-RC2", "4.1.2-RC1")).toBe(1);
  });

  it("compares milestones", () => {
    expect(compareVersions("4.1.2-M1", "4.1.2-RC1")).toBe(-1);
    expect(compareVersions("4.1.2-M2", "4.1.2-M1")).toBe(1);
  });

  it("compares snapshots", () => {
    expect(compareVersions("4.1.2-SNAPSHOT", "4.1.2-M1")).toBe(-1);
  });

  it("normalizes Spring Initializr versions", () => {
    expect(
      compareVersions("4.1.2.RELEASE", "4.1.2")
    ).toBe(0);
  });

  it("rejects invalid versions", () => {
    expect(() =>
      compareVersions("invalid", "4.1.2")
    ).toThrow("Invalid version");
  });
});
