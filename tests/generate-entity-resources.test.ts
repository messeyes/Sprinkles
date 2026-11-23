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

import {
  generateController
} from "../src/generators/controller/controller-generator.js";

import {
  generateEntity
} from "../src/generators/entity/entity-generator.js";

import {
  generateRepository
} from "../src/generators/repository/repository-generator.js";

import {
  generateResponseDto
} from "../src/generators/dto/response-dto-generator.js";

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

vi.mock(
  "../src/generators/controller/controller-generator.js",
  async (importOriginal) => {
    const original = await importOriginal<
      typeof import("../src/generators/controller/controller-generator.js")
    >();

    return {
      ...original,
      generateController: vi.fn(original.generateController)
    };
  }
);

vi.mock(
  "../src/generators/entity/entity-generator.js",
  async (importOriginal) => {
    const original = await importOriginal<
      typeof import("../src/generators/entity/entity-generator.js")
    >();

    return {
      ...original,
      generateEntity: vi.fn(original.generateEntity)
    };
  }
);

vi.mock(
  "../src/generators/repository/repository-generator.js",
  async (importOriginal) => {
    const original = await importOriginal<
      typeof import("../src/generators/repository/repository-generator.js")
    >();

    return {
      ...original,
      generateRepository: vi.fn(original.generateRepository)
    };
  }
);

vi.mock(
  "../src/generators/dto/response-dto-generator.js",
  async (importOriginal) => {
    const original = await importOriginal<
      typeof import("../src/generators/dto/response-dto-generator.js")
    >();

    return {
      ...original,
      generateResponseDto: vi.fn(original.generateResponseDto)
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
    vi.resetAllMocks();

    vi.mocked(generateEntity).mockImplementation(
      async (...args) => {
        const original = await vi.importActual<
          typeof import("../src/generators/entity/entity-generator.js")
        >("../src/generators/entity/entity-generator.js");

        return original.generateEntity(...args);
      }
    );

    vi.mocked(generateRepository).mockImplementation(
      async (...args) => {
        const original = await vi.importActual<
          typeof import("../src/generators/repository/repository-generator.js")
        >("../src/generators/repository/repository-generator.js");

        return original.generateRepository(...args);
      }
    );

    vi.mocked(generateResponseDto).mockImplementation(
      async (...args) => {
        const original = await vi.importActual<
          typeof import("../src/generators/dto/response-dto-generator.js")
        >("../src/generators/dto/response-dto-generator.js");

        return original.generateResponseDto(...args);
      }
    );

    vi.mocked(generateDto).mockImplementation(
      async (...args) => {
        const original = await vi.importActual<
          typeof import("../src/generators/dto/dto-generator.js")
        >("../src/generators/dto/dto-generator.js");

        return original.generateDto(...args);
      }
    );

    vi.mocked(generateService).mockImplementation(
      async (...args) => {
        const original = await vi.importActual<
          typeof import("../src/generators/service/service-generator.js")
        >("../src/generators/service/service-generator.js");

        return original.generateService(...args);
      }
    );

    vi.mocked(generateController).mockImplementation(
      async (...args) => {
        const original = await vi.importActual<
          typeof import("../src/generators/controller/controller-generator.js")
        >("../src/generators/controller/controller-generator.js");

        return original.generateController(...args);
      }
    );

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

  it("generates an entity, repository, DTOs, service and controller", async () => {
    const {
      entityPath,
      repositoryPath,
      dtoPath,
      responseDtoPath,
      servicePath,
      controllerPath
    } = await generateEntityResources(project, definition);

    const entity = await readFile(entityPath, "utf8");
    const repository = await readFile(repositoryPath, "utf8");
    const requestDto = await readFile(dtoPath, "utf8");
    const responseDto = await readFile(responseDtoPath, "utf8");
    const service = await readFile(servicePath, "utf8");
    const controller = await readFile(controllerPath, "utf8");

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

    expect(controller).toContain(
      "public class BookController"
    );
    expect(controller).toContain(
      '@RequestMapping("/api/books")'
    );
    expect(controller).toContain("@PostMapping");
    expect(controller).toContain("@GetMapping");
    expect(controller).toContain('@PutMapping("/{id}")');
    expect(controller).toContain('@DeleteMapping("/{id}")');
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
      path.join(repositoryDirectory, "BookRepository.java"),
      "// Existing repository"
    );

    await expect(
      generateEntityResources(project, definition)
    ).rejects.toThrow("Repository already exists");

    await expect(
      access(
        path.join(project.sourcePath, "entity", "Book.java")
      )
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

    await writeFile(dtoPath, "// Existing DTO");

    await expect(
      generateEntityResources(project, definition)
    ).rejects.toThrow("DTO already exists");

    expect(
      await readFile(dtoPath, "utf8")
    ).toBe("// Existing DTO");

    for (const filePath of [
      path.join(project.sourcePath, "entity", "Book.java"),
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
      path.join(project.sourcePath, "entity", "Book.java"),
      path.join(
        project.sourcePath,
        "repository",
        "BookRepository.java"
      ),
      path.join(project.sourcePath, "dto", "BookRequest.java"),
      path.join(project.sourcePath, "dto", "BookResponse.java"),
      path.join(project.sourcePath, "service", "BookService.java"),
      path.join(
        project.sourcePath,
        "controller",
        "BookController.java"
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
      path.join(project.sourcePath, "entity", "Book.java"),
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
      path.join(project.sourcePath, "entity", "Book.java"),
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
      path.join(project.sourcePath, "entity", "Book.java"),
      path.join(
        project.sourcePath,
        "repository",
        "BookRepository.java"
      ),
      path.join(project.sourcePath, "dto", "BookRequest.java"),
      path.join(project.sourcePath, "dto", "BookResponse.java"),
      path.join(project.sourcePath, "service", "BookService.java"),
      path.join(
        project.sourcePath,
        "controller",
        "BookController.java"
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

  it("does not generate resources if the controller already exists", async () => {
    const controllerDirectory = path.join(
      project.sourcePath,
      "controller"
    );

    await mkdir(controllerDirectory, {
      recursive: true
    });

    const controllerPath = path.join(
      controllerDirectory,
      "BookController.java"
    );

    await writeFile(
      controllerPath,
      "// Existing controller"
    );

    await expect(
      generateEntityResources(project, definition)
    ).rejects.toThrow("Controller already exists");

    expect(
      await readFile(controllerPath, "utf8")
    ).toBe("// Existing controller");

    const expectedFiles = [
      path.join(project.sourcePath, "entity", "Book.java"),
      path.join(
        project.sourcePath,
        "repository",
        "BookRepository.java"
      ),
      path.join(project.sourcePath, "dto", "BookRequest.java"),
      path.join(project.sourcePath, "dto", "BookResponse.java"),
      path.join(project.sourcePath, "service", "BookService.java")
    ];

    for (const filePath of expectedFiles) {
      await expect(
        access(filePath)
      ).rejects.toMatchObject({
        code: "ENOENT"
      });
    }
  });

  it("rolls back generated files when controller generation fails", async () => {
    vi.mocked(generateController).mockRejectedValueOnce(
      new Error("Controller generation failed")
    );

    await expect(
      generateEntityResources(project, definition)
    ).rejects.toThrow("Controller generation failed");

    const expectedFiles = [
      path.join(project.sourcePath, "entity", "Book.java"),
      path.join(
        project.sourcePath,
        "repository",
        "BookRepository.java"
      ),
      path.join(project.sourcePath, "dto", "BookRequest.java"),
      path.join(project.sourcePath, "dto", "BookResponse.java"),
      path.join(project.sourcePath, "service", "BookService.java"),
      path.join(
        project.sourcePath,
        "controller",
        "BookController.java"
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

  it("generates resources in the defined order", async () => {
    await generateEntityResources(project, definition);

    const orders = [
      vi.mocked(generateEntity).mock.invocationCallOrder[0]!,
      vi.mocked(generateRepository).mock.invocationCallOrder[0]!,
      vi.mocked(generateDto).mock.invocationCallOrder[0]!,
      vi.mocked(generateResponseDto).mock.invocationCallOrder[0]!,
      vi.mocked(generateService).mock.invocationCallOrder[0]!,
      vi.mocked(generateController).mock.invocationCallOrder[0]!
    ];

    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(new Set(orders).size).toBe(6);
    expect(vi.mocked(generateEntity).mock.calls[0]).toEqual([
      project,
      definition
    ]);
  });

  it("does not generate resources if the entity already exists", async () => {
    const entityDirectory = path.join(
      project.sourcePath,
      "entity"
    );

    await mkdir(entityDirectory, {
      recursive: true
    });

    const entityPath = path.join(
      entityDirectory,
      "Book.java"
    );

    await writeFile(entityPath, "// Existing entity");

    await expect(
      generateEntityResources(project, definition)
    ).rejects.toThrow("Entity already exists");

    expect(
      await readFile(entityPath, "utf8")
    ).toBe("// Existing entity");

    for (const filePath of [
      path.join(
        project.sourcePath,
        "repository",
        "BookRepository.java"
      ),
      path.join(project.sourcePath, "dto", "BookRequest.java"),
      path.join(project.sourcePath, "dto", "BookResponse.java"),
      path.join(project.sourcePath, "service", "BookService.java"),
      path.join(
        project.sourcePath,
        "controller",
        "BookController.java"
      )
    ]) {
      await expect(
        access(filePath)
      ).rejects.toMatchObject({
        code: "ENOENT"
      });
    }
  });

  it("keeps a partially written file when a generator writes and then fails", async () => {
    vi.mocked(generateDto).mockImplementationOnce(
      async (...args) => {
        const original = await vi.importActual<
          typeof import("../src/generators/dto/dto-generator.js")
        >("../src/generators/dto/dto-generator.js");

        await original.generateDto(...args);

        throw new Error("Failed after writing DTO");
      }
    );

    await expect(
      generateEntityResources(project, definition)
    ).rejects.toThrow("Failed after writing DTO");

    for (const filePath of [
      path.join(project.sourcePath, "entity", "Book.java"),
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

    expect(
      await readFile(
        path.join(project.sourcePath, "dto", "BookRequest.java"),
        "utf8"
      )
    ).toContain("public record BookRequest(");
  });

  it("throws AggregateError when cleanup cannot remove a file", async () => {
    const directoryPath = path.join(
      temporaryDirectory,
      "cleanup-target"
    );

    await mkdir(directoryPath);

    vi.mocked(generateDto).mockImplementationOnce(
      async () => directoryPath
    );

    vi.mocked(generateService).mockRejectedValueOnce(
      new Error("Service generation failed")
    );

    const error = await generateEntityResources(
      project,
      definition
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(AggregateError);
    expect(error).toMatchObject({
      message:
        "Resource generation failed and cleanup was incomplete."
    });

    const aggregate = error as AggregateError;

    expect(aggregate.errors).toHaveLength(2);
    expect(aggregate.errors[0]).toMatchObject({
      message: "Service generation failed"
    });
  });
});
