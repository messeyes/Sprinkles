import {
  describe,
  expect,
  it
} from "vitest";

import {
  validateProjectConfig
} from "../src/services/project-config.js";

const validConfig = {
  buildTool: "gradle",
  javaVersion: "21",
  springBootVersion: "4.1.2",
  dependencies: ["web", "data-jpa"],
  groupId: "com.messeyes",
  artifactId: "my-api",
  packageName: "com.messeyes.myapi",
  description: "My Spring Boot API",
  packaging: "jar"
};

describe("Project configuration", () => {
  it("accepts valid configurations", () => {
    expect(
      validateProjectConfig(validConfig)
    ).toEqual(validConfig);
  });

  it("rejects invalid build tools", () => {
    expect(() =>
      validateProjectConfig({
        ...validConfig,
        buildTool: "ant"
      })
    ).toThrow("Invalid build tool.");
  });

  it("rejects invalid dependencies", () => {
    expect(() =>
      validateProjectConfig({
        ...validConfig,
        dependencies: [123]
      })
    ).toThrow("Invalid dependencies.");
  });

  it("rejects invalid package names", () => {
    expect(() =>
      validateProjectConfig({
        ...validConfig,
        packageName: "com.example.my-api"
      })
    ).toThrow("Invalid package name.");
  });

  it("rejects invalid packaging", () => {
    expect(() =>
      validateProjectConfig({
        ...validConfig,
        packaging: "ear"
      })
    ).toThrow("Invalid packaging.");
  });
});
