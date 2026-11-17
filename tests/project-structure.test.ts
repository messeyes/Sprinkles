import {
  afterEach,
  describe,
  expect,
  it
} from "vitest";

import {
  mkdtemp,
  rm,
  stat
} from "node:fs/promises";

import os from "node:os";
import path from "node:path";

import {
  generateProjectStructure
} from "../src/services/project-structure.js";

const temporaryDirectories: string[] = [];

async function createTestDirectory(): Promise<string> {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "sprinkles-structure-")
  );

  temporaryDirectories.push(directory);

  return directory;
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
      "com.messeyes.myapi",
      "standard"
    );

    expect(
      await directoryExists(
        path.join(
          projectPath,
          "src/main/java/com/messeyes/myapi/controller"
        )
      )
    ).toBe(false);
  });

  it("creates main packages for layered architecture", async () => {
    const projectPath = await createTestDirectory();

    await generateProjectStructure(
      projectPath,
      "com.messeyes.myapi",
      "layered"
    );

    const layers = [
      "controller",
      "service",
      "repository",
      "entity",
      "dto",
      "config",
      "exception"
    ];

    for (const layer of layers) {
      const directory = path.join(
        projectPath,
        "src",
        "main",
        "java",
        "com",
        "messeyes",
        "myapi",
        layer
      );

      expect(
        await directoryExists(directory)
      ).toBe(true);
    }
  });

  it("creates test packages", async () => {
    const projectPath = await createTestDirectory();

    await generateProjectStructure(
      projectPath,
      "com.messeyes.myapi",
      "layered"
    );

    for (const layer of [
      "controller",
      "service",
      "repository"
    ]) {
      expect(
        await directoryExists(
          path.join(
            projectPath,
            "src/test/java/com/messeyes/myapi",
            layer
          )
        )
      ).toBe(true);
    }
  });

  it("rejects unsupported architectures", async () => {
    const projectPath = await createTestDirectory();

    await expect(
      generateProjectStructure(
        projectPath,
        "com.messeyes.myapi",
        "unknown" as "layered"
      )
    ).rejects.toThrow(
      "Unsupported project architecture"
    );
  });
});
