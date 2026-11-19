import { describe, expect, it } from "vitest";

import {
  filterJavaVersions,
  getMinimumJavaVersion,
  isJavaCompatible,
  validateJavaVersion
} from "../src/spring/java-compatibility.js";

const javaVersions = [
  { id: "17", name: "17" },
  { id: "21", name: "21" },
  { id: "25", name: "25" }
];

describe("Java and Spring Boot compatibility", () => {
  it("gets the minimum Java version", () => {
    expect(getMinimumJavaVersion("3.5.0")).toBe(17);
    expect(getMinimumJavaVersion("4.1.2")).toBe(17);
  });

  it("accepts Java 17 with Spring Boot 3", () => {
    expect(isJavaCompatible("17", "3.5.0")).toBe(true);
  });

  it("accepts Java 21 with Spring Boot 4", () => {
    expect(isJavaCompatible("21", "4.1.2")).toBe(true);
  });

  it("rejects Java below the minimum", () => {
    expect(isJavaCompatible("11", "4.1.2")).toBe(false);
  });

  it("filters incompatible Java versions", () => {
    const result = filterJavaVersions(
      [{ id: "11", name: "11" }, ...javaVersions],
      "4.1.2"
    );

    expect(result.map((version) => version.id)).toEqual([
      "17", "21", "25"
    ]);
  });

  it("rejects unavailable Java versions", () => {
    expect(() =>
      validateJavaVersion("23", "4.1.2", javaVersions)
    ).toThrow("not available");
  });

  it("accepts a valid selection", () => {
    expect(() =>
      validateJavaVersion("21", "4.1.2", javaVersions)
    ).not.toThrow();
  });

  it("rejects unsupported Spring Boot major versions", () => {
    expect(() =>
      getMinimumJavaVersion("5.0.0")
    ).toThrow("Unsupported Spring Boot major version");
  });
});
