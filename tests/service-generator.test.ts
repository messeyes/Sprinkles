import {
  describe,
  expect,
  it
} from "vitest";

import {
  mkdtemp,
  readFile,
  rm
} from "node:fs/promises";

import os from "node:os";
import path from "node:path";

import {
  generateService
} from "../src/generators/service/service-generator.js";

import type {
  SpringProject
} from "../src/types/spring-project.js";

describe("generateService", () => {
  it("creates a Java service file", async () => {
    const rootPath = await mkdtemp(
      path.join(os.tmpdir(), "sprinkles-service-")
    );

    try {
      const project: SpringProject = {
        rootPath,
        sourcePath: path.join(
          rootPath,
          "src/main/java/com/example/demo"
        ),
        packageName: "com.example.demo",
        buildTool: "maven"
      };

      const definition = {
        name: "Book",
        fields: [
          {
            name: "title",
            type: "String" as const,
            required: true
          }
        ]
      };

      const filePath = await generateService(
        project,
        definition
      );

      expect(filePath).toBe(
        path.join(
          project.sourcePath,
          "service",
          "BookService.java"
        )
      );

      const content = await readFile(
        filePath,
        "utf8"
      );

      expect(content).toContain(
        "public class BookService"
      );

      expect(content).toContain(
        "repository.save(entity)"
      );
    } finally {
      await rm(rootPath, {
        recursive: true,
        force: true
      });
    }
  });

  it("does not overwrite an existing service", async () => {
    const rootPath = await mkdtemp(
      path.join(os.tmpdir(), "sprinkles-service-")
    );

    try {
      const project: SpringProject = {
        rootPath,
        sourcePath: path.join(
          rootPath,
          "src/main/java/com/example/demo"
        ),
        packageName: "com.example.demo",
        buildTool: "maven"
      };

      const definition = {
        name: "Book",
        fields: [
          {
            name: "title",
            type: "String" as const,
            required: true
          }
        ]
      };

      await generateService(project, definition);

      await expect(
        generateService(project, definition)
      ).rejects.toMatchObject({
        code: "EEXIST"
      });

    } finally {
      await rm(rootPath, {
        recursive: true,
        force: true
      });
    }
  });
});
