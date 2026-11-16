import { describe, expect, it } from "vitest";

import {
  normalizeVersion,
  isStableVersion
} from "../src/services/spring-metadata.js";

describe("Spring Boot version normalization", () => {
  it.each([
    ["4.1.2.RELEASE", "4.1.2"],
    ["4.0.10.BUILD-SNAPSHOT", "4.0.10-SNAPSHOT"],
    ["4.1.0.RC1", "4.1.0-RC1"],
    ["4.1.0.M1", "4.1.0-M1"],
    ["4.1.2", "4.1.2"]
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeVersion(input)).toBe(expected);
  });
});

describe("Spring Boot stable versions", () => {
  it.each([
    ["4.1.2", true],
    ["3.5.7", true],
    ["4.1.3-SNAPSHOT", false],
    ["4.1.0-RC1", false],
    ["4.1.0-M1", false]
  ])("checks stability of %s", (version, expected) => {
    expect(isStableVersion(version)).toBe(expected);
  });
});