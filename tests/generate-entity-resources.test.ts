import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
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

import type {
  SpringProject
} from "../src/types/spring-project.js";

import {
  generateEntityResources
} from "../src/generators/generate-entity-resources.js";

import {
  generateDto
} from "../src/generators/dto/dto-generator.js";

import {
  generateService
} from "../src/generators/service/service-generator.js";

vi.mock(
  "../src/generators/dto/dto-generator.js",
  async (importOriginal) => {
    const original = await importOriginal<
      typeof import("../src/generators/dto/dto-generator.js")
    >();

    return {
      ...original,
      generateDto: vi.fn(original.generateDto)
    };
  }
);

vi.mock(
  "../src/generators/service/service-generator.js",
  async (importOriginal) => {
    const original = await importOriginal<
      typeof import("../src/generators/service/service-generator.js")
    >();

    return {
      ...original,
      generateService: vi.fn(original.generateService)
    };
  }
);

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
    vi.clearAllMocks();

    await rm(temporaryDirectory, {
      recursive: true,
      force: true
    });
  });

  it("generates an entity, repository, DTOs and service", async () => {
    const {
      entityPath,
      repositoryPath,
      dtoPath,
      responseDtoPath,
      servicePath
    } = await generateEntityResources(project, definition);

    const entity = await readFile(entityPath, "utf8");
    const repository = await readFile(repositoryPath, "utf8");
    const requestDto = await readFile(dtoPath, "utf8");
    const responseDto = await readFile(responseDtoPath, "utf8");
    const service = await readFile(servicePath, "utf8");

    expect(entity).toContain("class Book");

    expect(repository).toContain(
      "extends JpaRepository<Book, Long>"
    );

    expect(requestDto).toContain(
      "public record BookRequest("
    );

    expect(requestDto).toContain("String title");

    expect(responseDto).toContain(
      "public record BookResponse("
    );

    expect(responseDto).toContain("Long id");
    expect(responseDto).toContain("String title");

    expect(service).toContain(
      "public class BookService"
    );

    expect(service).toContain(
      "public BookResponse create(BookRequest request)"
    );

    expect(service).toContain(
      "public List<BookResponse> findAll()"
    );

    expect(service).toContain(
      "public BookResponse findById(Long id)"
    );

    expect(service).toContain(
      "public BookResponse update(Long id, BookRequest request)"
    );

    expect(service).toContain(
      "public void delete(Long id)"
    );
  });

  it("does not create an entity if the repository already exists", async () => {
    const repositoryDirectory = path.join(
      project.sourcePath,
      "repository"
    );

    await mkdir(repositoryDirectory, {
      recursive: true
    });

    await writeFile(
      path.join(
        repositoryDirectory,
        "BookRepository.java"
      ),
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

    await expect(
      access(entityPath)
    ).rejects.toMatchObject({
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

  it("does not generate resources if the DTO already exists", async () => {
    const dtoDirectory = path.join(
      project.sourcePath,
      "dto"
    );

    await mkdir(dtoDirectory, {
      recursive: true
    });

    const dtoPath = path.join(
      dtoDirectory,
      "BookRequest.java"
    );

    await writeFile(
      dtoPath,
      "// Existing DTO"
    );

    await expect(
      generateEntityResources(project, definition)
    ).rejects.toThrow("DTO already exists");

    expect(
      await readFile(dtoPath, "utf8")
    ).toBe("// Existing DTO");

    for (const filePath of [
      path.join(
        project.sourcePath,
        "entity",
        "Book.java"
      ),
      path.join(
        project.sourcePath,
        "repository",
        "BookRepository.java"
      )
    ]) {
      await expect(
        access(filePath)
      ).rejects.toMatchObject({
        code: "ENOENT"
      });
    }
  });

  it("removes generated files when DTO generation fails", async () => {
    vi.mocked(generateDto).mockRejectedValueOnce(
      new Error("Failed to generate DTO")
    );

    await expect(
      generateEntityResources(project, definition)
    ).rejects.toThrow("Failed to generate DTO");

    const expectedFiles = [
      path.join(
        project.sourcePath,
        "entity",
        "Book.java"
      ),
      path.join(
        project.sourcePath,
        "repository",
        "BookRepository.java"
      ),
      path.join(
        project.sourcePath,
        "dto",
        "BookRequest.java"
      ),
      path.join(
        project.sourcePath,
        "dto",
        "BookResponse.java"
      ),
      path.join(
        project.sourcePath,
        "service",
        "BookService.java"
      )
    ];

    for (const filePath of expectedFiles) {
      await expect(
        access(filePath)
      ).rejects.toMatchObject({
        code: "ENOENT"
      });
    }
  });

  it("does not generate resources if the response DTO exists", async () => {
    const dtoDirectory = path.join(
      project.sourcePath,
      "dto"
    );

    await mkdir(dtoDirectory, {
      recursive: true
    });

    const responseDtoPath = path.join(
      dtoDirectory,
      "BookResponse.java"
    );

    await writeFile(
      responseDtoPath,
      "// Existing response DTO"
    );

    await expect(
      generateEntityResources(project, definition)
    ).rejects.toThrow(
      "Response DTO already exists"
    );

    expect(
      await readFile(responseDtoPath, "utf8")
    ).toBe("// Existing response DTO");

    for (const filePath of [
      path.join(
        project.sourcePath,
        "entity",
        "Book.java"
      ),
      path.join(
        project.sourcePath,
        "repository",
        "BookRepository.java"
      ),
      path.join(
        project.sourcePath,
        "dto",
        "BookRequest.java"
      )
    ]) {
      await expect(
        access(filePath)
      ).rejects.toMatchObject({
        code: "ENOENT"
      });
    }
  });

  it("does not generate resources if the service already exists", async () => {
    const serviceDirectory = path.join(
      project.sourcePath,
      "service"
    );

    await mkdir(serviceDirectory, {
      recursive: true
    });

    const servicePath = path.join(
      serviceDirectory,
      "BookService.java"
    );

    await writeFile(
      servicePath,
      "// Existing service"
    );

    await expect(
      generateEntityResources(project, definition)
    ).rejects.toThrow("Service already exists");

    expect(
      await readFile(servicePath, "utf8")
    ).toBe("// Existing service");

    for (const filePath of [
      path.join(
        project.sourcePath,
        "entity",
        "Book.java"
      ),
      path.join(
        project.sourcePath,
        "repository",
        "BookRepository.java"
      ),
      path.join(
        project.sourcePath,
        "dto",
        "BookRequest.java"
      ),
      path.join(
        project.sourcePath,
        "dto",
        "BookResponse.java"
      )
    ]) {
      await expect(
        access(filePath)
      ).rejects.toMatchObject({
        code: "ENOENT"
      });
    }
  });

  it("rolls back generated files when service generation fails", async () => {
    vi.mocked(generateService).mockRejectedValueOnce(
      new Error("Service generation failed")
    );

    await expect(
      generateEntityResources(project, definition)
    ).rejects.toThrow("Service generation failed");

    const expectedFiles = [
      path.join(
        project.sourcePath,
        "entity",
        "Book.java"
      ),
      path.join(
        project.sourcePath,
        "repository",
        "BookRepository.java"
      ),
      path.join(
        project.sourcePath,
        "dto",
        "BookRequest.java"
      ),
      path.join(
        project.sourcePath,
        "dto",
        "BookResponse.java"
      ),
      path.join(
        project.sourcePath,
        "service",
        "BookService.java"
      )
    ];

    for (const filePath of expectedFiles) {
      await expect(
        access(filePath)
      ).rejects.toMatchObject({
        code: "ENOENT"
      });
    }
  });
});
