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
  generateController
} from "../src/generators/controller/controller-generator.js";

describe("generateController", () => {
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
      path.join(os.tmpdir(), "sprinkles-controller-")
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

  it("creates a Java controller file", async () => {
    const filePath = await generateController(
      project,
      definition
    );

    expect(filePath).toBe(
      path.join(
        project.sourcePath,
        "controller",
        "BookController.java"
      )
    );

    const content = await readFile(
      filePath,
      "utf8"
    );

    expect(content).toContain(
      "package com.example.demo.controller;"
    );

    expect(content).toContain(
      "public class BookController"
    );

    expect(content).toContain(
      '@RequestMapping("/api/books")'
    );
  });

  it("generates REST endpoints", async () => {
    const filePath = await generateController(
      project,
      definition
    );

    const content = await readFile(
      filePath,
      "utf8"
    );

    expect(content).toContain("@PostMapping");
    expect(content).toContain("@GetMapping");
    expect(content).toContain('@GetMapping("/{id}")');
    expect(content).toContain('@PutMapping("/{id}")');
    expect(content).toContain('@DeleteMapping("/{id}")');
  });

  it("does not overwrite an existing controller", async () => {
    const filePath = await generateController(
      project,
      definition
    );

    await expect(
      generateController(project, definition)
    ).rejects.toMatchObject({
      code: "EEXIST"
    });

    const content = await readFile(
      filePath,
      "utf8"
    );

    expect(content).toContain(
      "public class BookController"
    );
  });

  it("rejects invalid entity definitions", async () => {
    await expect(
      generateController(project, {
        name: "book",
        fields: definition.fields
      })
    ).rejects.toThrow();
  });
});
