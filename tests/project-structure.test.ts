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
  stat
} from "node:fs/promises";

import os from "node:os";
import path from "node:path";

import {
  generateProjectStructure
} from "../src/generators/project/project-structure.js";

const temporaryDirectories: string[] = [];

const PACKAGE_NAME = "com.messeyes.myapi";

const MAIN_LAYERS = [
  "controller",
  "service",
  "repository",
  "entity",
  "dto",
  "config",
  "exception"
];

const TEST_LAYERS = [
  "controller",
  "service",
  "repository"
];

async function createTestDirectory(): Promise<string> {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "sprinkles-structure-")
  );

  temporaryDirectories.push(directory);

  return directory;
}

function getPackagePath(
  projectPath: string,
  source: "main" | "test"
): string {
  return path.join(
    projectPath,
    "src",
    source,
    "java",
    ...PACKAGE_NAME.split(".")
  );
}

async function fileExists(
  filePath: string
): Promise<boolean> {
  try {
    const info = await stat(filePath);
    return info.isFile();
  } catch {
    return false;
  }
}

async function directoryExists(
  directory: string
): Promise<boolean> {
  try {
    const info = await stat(directory);
    return info.isDirectory();
  } catch {
    return false;
  }
}

afterEach(async () => {
  for (const directory of temporaryDirectories) {
    await rm(directory, {
      recursive: true,
      force: true
    });
  }

  temporaryDirectories.length = 0;
});

describe("Project structure generation", () => {
  it("does not create layers for standard architecture", async () => {
    const projectPath = await createTestDirectory();

    await generateProjectStructure(
      projectPath,
      PACKAGE_NAME,
      "standard",
      ["web"],
      "4.0.0"
    );

    expect(
      await directoryExists(
        path.join(
          getPackagePath(projectPath, "main"),
          "controller"
        )
      )
    ).toBe(false);
  });

  it("creates main packages for layered architecture", async () => {
    const projectPath = await createTestDirectory();

    await generateProjectStructure(
      projectPath,
      PACKAGE_NAME,
      "layered"
    );

    for (const layer of MAIN_LAYERS) {
      const directory = path.join(
        getPackagePath(projectPath, "main"),
        layer
      );

      expect(
        await directoryExists(directory)
      ).toBe(true);
    }
  });

  it("creates test packages for layered architecture", async () => {
    const projectPath = await createTestDirectory();

    await generateProjectStructure(
      projectPath,
      PACKAGE_NAME,
      "layered"
    );

    for (const layer of TEST_LAYERS) {
      const directory = path.join(
        getPackagePath(projectPath, "test"),
        layer
      );

      expect(
        await directoryExists(directory)
      ).toBe(true);
    }
  });

  it("creates .gitkeep in empty main layers", async () => {
    const projectPath = await createTestDirectory();

    await generateProjectStructure(
      projectPath,
      PACKAGE_NAME,
      "layered",
      ["web"],
      "4.0.0"
    );

    const emptyLayers = MAIN_LAYERS.filter(
      layer => layer !== "controller"
    );

    for (const layer of emptyLayers) {
      const gitkeepPath = path.join(
        getPackagePath(projectPath, "main"),
        layer,
        ".gitkeep"
      );

      expect(await fileExists(gitkeepPath)).toBe(true);
      expect(await readFile(gitkeepPath, "utf8")).toBe("");
    }
  });

  it("creates .gitkeep in empty test layers", async () => {
    const projectPath = await createTestDirectory();

    await generateProjectStructure(
      projectPath,
      PACKAGE_NAME,
      "layered",
      ["web"],
      "4.0.0"
    );

    const emptyLayers = TEST_LAYERS.filter(
      layer => layer !== "controller"
    );

    for (const layer of emptyLayers) {
      const gitkeepPath = path.join(
        getPackagePath(projectPath, "test"),
        layer,
        ".gitkeep"
      );

      expect(await fileExists(gitkeepPath)).toBe(true);
      expect(await readFile(gitkeepPath, "utf8")).toBe("");
    }
  });

  it("generates HelloController when Spring Web is selected", async () => {
    const projectPath = await createTestDirectory();

    await generateProjectStructure(
      projectPath,
      PACKAGE_NAME,
      "layered",
      ["web"],
      "4.0.0"
    );

    const controllerPath = path.join(
      getPackagePath(projectPath, "main"),
      "controller",
      "HelloController.java"
    );

    expect(await fileExists(controllerPath)).toBe(true);

    const content = await readFile(controllerPath, "utf8");

    expect(content).toContain(
      "package com.messeyes.myapi.controller;"
    );

    expect(content).toContain("@RestController");
    expect(content).toContain('@GetMapping("/hello")');
    expect(content).toContain('return "Hello, World!";');
  });

  it("generates HelloControllerTest for Spring Boot 4", async () => {
    const projectPath = await createTestDirectory();

    await generateProjectStructure(
      projectPath,
      PACKAGE_NAME,
      "layered",
      ["web"],
      "4.0.0"
    );

    const testPath = path.join(
      getPackagePath(projectPath, "test"),
      "controller",
      "HelloControllerTest.java"
    );

    expect(await fileExists(testPath)).toBe(true);

    const content = await readFile(testPath, "utf8");

    expect(content).toContain(
      "org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest"
    );

    expect(content).toContain(
      "@WebMvcTest(HelloController.class)"
    );

    expect(content).toContain(
      'mockMvc.perform(get("/hello"))'
    );

    expect(content).toContain(
      ".andExpect(status().isOk())"
    );
  });

  it("generates a compatible test import for Spring Boot 3", async () => {
    const projectPath = await createTestDirectory();

    await generateProjectStructure(
      projectPath,
      PACKAGE_NAME,
      "layered",
      ["web"],
      "3.5.0"
    );

    const testPath = path.join(
      getPackagePath(projectPath, "test"),
      "controller",
      "HelloControllerTest.java"
    );

    const content = await readFile(testPath, "utf8");

    expect(content).toContain(
      "org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest"
    );
  });

  it("does not generate HelloController without Spring Web", async () => {
    const projectPath = await createTestDirectory();

    await generateProjectStructure(
      projectPath,
      PACKAGE_NAME,
      "layered",
      [],
      "4.0.0"
    );

    const controllerPath = path.join(
      getPackagePath(projectPath, "main"),
      "controller",
      "HelloController.java"
    );

    const testPath = path.join(
      getPackagePath(projectPath, "test"),
      "controller",
      "HelloControllerTest.java"
    );

    expect(await fileExists(controllerPath)).toBe(false);
    expect(await fileExists(testPath)).toBe(false);
  });

  it("does not create .gitkeep in controllers containing Java files", async () => {
    const projectPath = await createTestDirectory();

    await generateProjectStructure(
      projectPath,
      PACKAGE_NAME,
      "layered",
      ["web"],
      "4.0.0"
    );

    const mainGitkeep = path.join(
      getPackagePath(projectPath, "main"),
      "controller",
      ".gitkeep"
    );

    const testGitkeep = path.join(
      getPackagePath(projectPath, "test"),
      "controller",
      ".gitkeep"
    );

    expect(await fileExists(mainGitkeep)).toBe(false);
    expect(await fileExists(testGitkeep)).toBe(false);
  });

  it("preserves .gitkeep when Spring Web is not selected", async () => {
    const projectPath = await createTestDirectory();

    await generateProjectStructure(
      projectPath,
      PACKAGE_NAME,
      "layered",
      [],
      "4.0.0"
    );

    const mainGitkeep = path.join(
      getPackagePath(projectPath, "main"),
      "controller",
      ".gitkeep"
    );

    const testGitkeep = path.join(
      getPackagePath(projectPath, "test"),
      "controller",
      ".gitkeep"
    );

    expect(await fileExists(mainGitkeep)).toBe(true);
    expect(await fileExists(testGitkeep)).toBe(true);
  });

  it("rejects unsupported architectures", async () => {
    const projectPath = await createTestDirectory();

    await expect(
      generateProjectStructure(
        projectPath,
        PACKAGE_NAME,
        "unknown" as "layered"
      )
    ).rejects.toThrow(
      "Unsupported project architecture"
    );
  });
});