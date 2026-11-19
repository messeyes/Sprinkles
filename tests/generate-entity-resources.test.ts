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
  rm,
  writeFile,
  mkdir,
  access
} from "node:fs/promises";

import os from "node:os";
import path from "node:path";

import type { SpringProject } from "../src/types/spring-project.js";

import {
  generateEntityResources
} from "../src/generators/generate-entity-resources.js";

describe("generateEntityResources", () => {
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
      path.join(os.tmpdir(), "sprinkles-resources-")
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

  it("generates an entity and its repository", async () => {
    const { entityPath, repositoryPath } =
      await generateEntityResources(project, definition);

    const entity = await readFile(entityPath, "utf-8");
    const repository = await readFile(repositoryPath, "utf-8");

    expect(entity).toContain("class Book");
    expect(repository).toContain(
      "extends JpaRepository<Book, Long>"
    );
  });

  it("does not overwrite an existing entity", async () => {
    const entityDirectory = path.join(
      project.sourcePath,
      "entity"
    );

    await mkdir(entityDirectory, { recursive: true });

    const entityPath = path.join(
      entityDirectory,
      "Book.java"
    );

    await writeFile(entityPath, "// Existing entity");

    await expect(
      generateEntityResources(project, definition)
    ).rejects.toThrow("Entity already exists");

    expect(await readFile(entityPath, "utf-8")).toBe(
      "// Existing entity"
    );
  });

  it("does not create an entity if the repository already exists", async () => {
    const repositoryDirectory = path.join(
      project.sourcePath,
      "repository"
    );

    await mkdir(repositoryDirectory, { recursive: true });

    await writeFile(
      path.join(repositoryDirectory, "BookRepository.java"),
      "// Existing repository"
    );

    await expect(
      generateEntityResources(project, definition)
    ).rejects.toThrow("Repository already exists");

    const entityPath = path.join(
      project.sourcePath,
      "entity",
      "Book.java"
    );

    await expect(access(entityPath)).rejects.toMatchObject({
      code: "ENOENT"
    });
  });

  it("rejects invalid entity definitions", async () => {
    await expect(
      generateEntityResources(project, {
        name: "book",
        fields: definition.fields
      })
    ).rejects.toThrow();
  });
});
