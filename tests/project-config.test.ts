import {
  afterEach,
  describe,
  expect,
  it
} from "vitest";

import {
  mkdtemp,
  readFile,
  rm,
  writeFile
} from "node:fs/promises";

import os from "node:os";
import path from "node:path";

import {
  loadProjectConfig,
  saveProjectConfig,
  validateProjectConfig
} from "../src/core/config/project-config.js";

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

const temporaryDirectories: string[] = [];

afterEach(async () => {
  for (const directory of temporaryDirectories) {
    await rm(directory, {
      recursive: true,
      force: true
    });
  }

  temporaryDirectories.length = 0;
});

async function createTemporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "sprinkles-test-")
  );

  temporaryDirectories.push(directory);

  return directory;
}

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

  it("rejects Java versions incompatible with Spring Boot", () => {
    expect(() =>
      validateProjectConfig({
        ...validConfig,
        javaVersion: "11"
      })
    ).toThrow(
      "Java 11 is not compatible with Spring Boot 4.1.2."
    );
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

  it("ignores legacy architecture fields", () => {
    expect(
      validateProjectConfig({
        ...validConfig,
        architecture: "layered"
      })
    ).toEqual(validConfig);
  });

  it("reports missing configuration files", async () => {
    const directory = await createTemporaryDirectory();

    await expect(
      loadProjectConfig(
        path.join(directory, "missing.json")
      )
    ).rejects.toThrow(
      "Could not read configuration file:"
    );
  });

  it("reports invalid JSON", async () => {
    const directory = await createTemporaryDirectory();
    const filePath = path.join(
      directory,
      "sprinkles.json"
    );

    await writeFile(filePath, "{ nope");

    await expect(
      loadProjectConfig(filePath)
    ).rejects.toThrow(
      "Configuration file contains invalid JSON."
    );
  });

  it("loads a legacy configuration with architecture", async () => {
    const directory = await createTemporaryDirectory();
    const filePath = path.join(
      directory,
      "sprinkles.json"
    );

    await writeFile(
      filePath,
      JSON.stringify({
        ...validConfig,
        architecture: "layered"
      })
    );

    await expect(
      loadProjectConfig(filePath)
    ).resolves.toEqual(validConfig);
  });

  it("saves a configuration without the project name", async () => {
    const directory = await createTemporaryDirectory();
    const filePath = path.join(
      directory,
      "sprinkles.json"
    );

    await saveProjectConfig(
      { projectName: "my-api", ...validConfig } as never,
      filePath
    );

    const saved = JSON.parse(
      await readFile(filePath, "utf-8")
    );

    expect(saved).toEqual(validConfig);
    expect("projectName" in saved).toBe(false);
  });

  it("does not overwrite an existing configuration", async () => {
    const directory = await createTemporaryDirectory();
    const filePath = path.join(
      directory,
      "sprinkles.json"
    );

    await writeFile(filePath, "original");

    await expect(
      saveProjectConfig(
        { projectName: "my-api", ...validConfig } as never,
        filePath
      )
    ).rejects.toThrow();

    expect(
      await readFile(filePath, "utf-8")
    ).toBe("original");
  });
});
