import {
  describe,
  expect,
  it
} from "vitest";

import type {
  ProjectConfig
} from "../src/core/config/project-config.js";

import {
  resolveProjectOptions
} from "../src/utils/resolve-project-options.js";

const config: ProjectConfig = {
  buildTool: "gradle",
  javaVersion: "21",
  springBootVersion: "4.1.2",
  dependencies: ["web"],
  groupId: "com.messeyes",
  artifactId: "original-api",
  packageName: "com.messeyes.originalapi",
  description: "Spring Boot application",
  packaging: "jar"
};

describe("Resolve project options", () => {
  it("preserves configuration metadata by default", () => {
    const options = resolveProjectOptions(
      "new-api",
      config
    );

    expect(options.projectName).toBe("new-api");
    expect(options.artifactId).toBe("original-api");
    expect(options.packageName).toBe(
      "com.messeyes.originalapi"
    );
  });

  it("overrides artifactId using the project name", () => {
    const options = resolveProjectOptions(
      "new-api",
      config,
      true
    );

    expect(options.artifactId).toBe("new-api");
  });

  it("regenerates packageName using the project name", () => {
    const options = resolveProjectOptions(
      "new-api",
      config,
      true
    );

    expect(options.packageName).toBe(
      "com.messeyes.newapi"
    );
  });

  it("preserves dependencies and Spring Boot settings", () => {
    const options = resolveProjectOptions(
      "new-api",
      config,
      true
    );

    expect(options.dependencies).toEqual(["web"]);
    expect(options.springBootVersion).toBe("4.1.2");
    expect(options.javaVersion).toBe("21");
  });

  it("rejects invalid artifact IDs when using project name", () => {
    expect(() =>
      resolveProjectOptions(
        "MyApi",
        config,
        true
      )
    ).toThrow("Invalid Artifact ID");
  });

  it("rejects project names starting with numbers", () => {
    expect(() =>
      resolveProjectOptions(
        "123api",
        config,
        true
      )
    ).toThrow("Invalid Artifact ID");
  });

  it("accepts valid project names as artifact IDs", () => {
    const options = resolveProjectOptions(
      "my-api",
      config,
      true
    );

    expect(options.artifactId).toBe("my-api");
    expect(options.packageName).toBe(
      "com.messeyes.myapi"
    );
  });
});
