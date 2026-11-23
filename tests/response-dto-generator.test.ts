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
  generateResponseDto
} from "../src/generators/dto/response-dto-generator.js";

describe("generateResponseDto", () => {
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
      path.join(os.tmpdir(), "sprinkles-response-dto-")
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

  it("creates a response DTO in the correct directory", async () => {
    const filePath = await generateResponseDto(
      project,
      definition
    );

    expect(filePath).toBe(
      path.join(
        project.sourcePath,
        "dto",
        "BookResponse.java"
      )
    );

    const content = await readFile(filePath, "utf-8");

    expect(content).toContain(
      "package com.example.demo.dto;"
    );

    expect(content).toContain(
      "public record BookResponse("
    );

    expect(content).toContain("Long id");
    expect(content).toContain("String title");
  });

  it("does not overwrite an existing response DTO", async () => {
    await generateResponseDto(project, definition);

    await expect(
      generateResponseDto(project, definition)
    ).rejects.toMatchObject({
      code: "EEXIST"
    });
  });

  it("rejects invalid entity definitions", async () => {
    await expect(
      generateResponseDto(project, {
        name: "book",
        fields: definition.fields
      })
    ).rejects.toThrow();
  });
});
