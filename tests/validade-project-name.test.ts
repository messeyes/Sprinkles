import { describe, it, expect } from "vitest";
import { isValidProjectName } from "../src/utils/validate-project-name.js";

describe("isValidProjectName", () => {
  it("should accept valid project names", () => {
    expect(isValidProjectName("my-api")).toBe(true);
    expect(isValidProjectName("my_api")).toBe(true);
    expect(isValidProjectName("myApi")).toBe(true);
    expect(isValidProjectName("myapi123")).toBe(true);
  });

  it("should reject names starting with numbers", () => {
    expect(isValidProjectName("123-api")).toBe(false);
  });

  it("should reject names containing spaces", () => {
    expect(isValidProjectName("my api")).toBe(false);
  });

  it("should reject special characters", () => {
    expect(isValidProjectName("my@api")).toBe(false);
  });

  it("should reject empty names", () => {
    expect(isValidProjectName("")).toBe(false);
  });
});