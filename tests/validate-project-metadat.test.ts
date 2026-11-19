import { describe, expect, it } from "vitest";

import {
  validateGroupId,
  validateArtifactId,
  validatePackageName,
  getDefaultPackageName
} from "../src/utils/validate-project-metadata.js";

describe("Project metadata validation", () => {
  it("accepts valid Group IDs", () => {
    expect(validateGroupId("com.messeyes")).toBe(true);
    expect(validateGroupId("org.example.api")).toBe(true);
  });

  it("rejects invalid Group IDs", () => {
    expect(validateGroupId("com..example")).toBe(false);
    expect(validateGroupId("com-example")).toBe(false);
  });

  it("accepts valid Artifact IDs", () => {
    expect(validateArtifactId("my-api")).toBe(true);
    expect(validateArtifactId("backend2")).toBe(true);
  });

  it("rejects invalid Artifact IDs", () => {
    expect(validateArtifactId("My API")).toBe(false);
    expect(validateArtifactId("my_api")).toBe(false);
  });

  it("accepts valid package names", () => {
    expect(
      validatePackageName("com.messeyes.myapi")
    ).toBe(true);

    expect(
      validatePackageName("com.example.demo")
    ).toBe(true);

    expect(
      validatePackageName("br.com.sprinkles.api")
    ).toBe(true);

    expect(
      validatePackageName("my_project")
    ).toBe(true);
  });

  it("rejects Java reserved words in packages", () => {
    expect(
      validatePackageName("com.class.demo")
    ).toBe(false);

    expect(
      validatePackageName("com.public.api")
    ).toBe(false);

    expect(
      validatePackageName("package")
    ).toBe(false);
  });

  it("rejects invalid package names", () => {
    expect(
      validatePackageName("com.example.my-api")
    ).toBe(false);

    expect(
      validatePackageName("com.123demo.api")
    ).toBe(false);

    expect(
      validatePackageName("com..demo")
    ).toBe(false);

    expect(
      validatePackageName("")
    ).toBe(false);
  });

  it("generates the default package name", () => {
    expect(
      getDefaultPackageName("com.messeyes", "my-api")
    ).toBe("com.messeyes.myapi");
  });
});
