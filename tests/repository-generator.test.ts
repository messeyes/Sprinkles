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

import type {
  SpringProject
} from "../src/types/spring-project.js";

import {
  generateRepository
} from "../src/generators/repository/repository-generator.js";

describe("generateRepository", () => {
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
      path.join(os.tmpdir(), "sprinkles-repository-")
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

  it("creates a repository in the correct directory", async () => {
    const filePath = await generateRepository(
      project,
      definition
    );

    expect(filePath).toBe(
      path.join(
        project.sourcePath,
        "repository",
        "BookRepository.java"
      )
    );

    const content = await readFile(
      filePath,
      "utf-8"
    );

    expect(content).toContain(
      "package com.example.demo.repository;"
    );

    expect(content).toContain(
      "extends JpaRepository<Book, Long>"
    );
  });

  it("does not overwrite an existing repository", async () => {
    await generateRepository(project, definition);

    await expect(
      generateRepository(project, definition)
    ).rejects.toMatchObject({
      code: "EEXIST"
    });
  });

  it("rejects invalid entity definitions", async () => {
    await expect(
      generateRepository(project, {
        name: "book",
        fields: definition.fields
      })
    ).rejects.toThrow();
  });
});
