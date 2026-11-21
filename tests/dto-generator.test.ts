import {
  afterEach,
  beforeEach,
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

import type { SpringProject } from "../src/types/spring-project.js";

import {
  generateDto
} from "../src/generators/dto/dto-generator.js";

describe("generateDto", () => {
  let temporaryDirectory: string;
  let project: SpringProject;

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

  beforeEach(async () => {
    temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), "sprinkles-dto-")
    );

    project = {
      rootPath: temporaryDirectory,
      sourcePath: path.join(
        temporaryDirectory,
        "src/main/java/com/example/demo"
      ),
      packageName: "com.example.demo",
      buildTool: "maven"
    };
  });

  afterEach(async () => {
    await rm(temporaryDirectory, {
      recursive: true,
      force: true
    });
  });

  it("creates a DTO in the correct directory", async () => {
    const filePath = await generateDto(
      project,
      definition
    );

    expect(filePath).toBe(
      path.join(
        project.sourcePath,
        "dto",
        "BookRequest.java"
      )
    );

    const content = await readFile(
      filePath,
      "utf-8"
    );

    expect(content).toContain(
      "package com.example.demo.dto;"
    );

    expect(content).toContain(
      "public record BookRequest("
    );

    expect(content).toContain("String title");
  });

  it("does not overwrite an existing DTO", async () => {
    await generateDto(project, definition);

    await expect(
      generateDto(project, definition)
    ).rejects.toMatchObject({
      code: "EEXIST"
    });
  });

  it("rejects invalid entity definitions", async () => {
    await expect(
      generateDto(project, {
        name: "book",
        fields: definition.fields
      })
    ).rejects.toThrow();
  });
});
