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
  generateEntity
} from "../src/generators/entity/entity-generator.js";

describe("generateEntity", () => {
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
      path.join(os.tmpdir(), "sprinkles-entity-")
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

  it("creates an entity in the correct directory", async () => {
    const filePath = await generateEntity(
      project,
      definition
    );

    expect(filePath).toBe(
      path.join(
        project.sourcePath,
        "entity",
        "Book.java"
      )
    );

    const content = await readFile(
      filePath,
      "utf-8"
    );

    expect(content).toContain("class Book");
    expect(content).toContain("package com.example.demo.entity;");
  });

  it("does not overwrite an existing entity", async () => {
    await generateEntity(project, definition);

    await expect(
      generateEntity(project, definition)
    ).rejects.toMatchObject({
      code: "EEXIST"
    });
  });

  it("rejects invalid entity definitions", async () => {
    await expect(
      generateEntity(project, {
        name: "book",
        fields: definition.fields
      })
    ).rejects.toThrow();
  });
});
