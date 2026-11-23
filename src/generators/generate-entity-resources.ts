import {
  access,
  unlink
} from "node:fs/promises";

import type {
  EntityDefinition
} from "../types/entity-definition.js";

import type {
  SpringProject
} from "../types/spring-project.js";

import {
  validateEntityDefinition
} from "../utils/validate-entity-definition.js";

import {
  generateEntity
} from "./entity/entity-generator.js";

import {
  generateRepository
} from "./repository/repository-generator.js";

import {
  generateDto
} from "./dto/dto-generator.js";

import {
  generateResponseDto
} from "./dto/response-dto-generator.js";

import {
  generateService
} from "./service/service-generator.js";

import {
  generateController
} from "./controller/controller-generator.js";

import {
  javaFilePath
} from "./shared/java-files.js";

interface GeneratedResources {
  entityPath: string;
  repositoryPath: string;
  dtoPath: string;
  responseDtoPath: string;
  servicePath: string;
  controllerPath: string;
}

interface EntityResourceStep {
  readonly name: string;
  readonly filePath: string;
  readonly generate: (
    project: SpringProject,
    definition: EntityDefinition
  ) => Promise<string>;
}

async function fileExists(
  filePath: string
): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return false;
    }

    throw error;
  }
}

export async function generateEntityResources(
  project: SpringProject,
  definition: EntityDefinition
): Promise<GeneratedResources> {
  validateEntityDefinition(definition);

  const entityPath = javaFilePath(
    project.sourcePath,
    "entity",
    `${definition.name}.java`
  );

  const repositoryPath = javaFilePath(
    project.sourcePath,
    "repository",
    `${definition.name}Repository.java`
  );

  const dtoPath = javaFilePath(
    project.sourcePath,
    "dto",
    `${definition.name}Request.java`
  );

  const responseDtoPath = javaFilePath(
    project.sourcePath,
    "dto",
    `${definition.name}Response.java`
  );

  const servicePath = javaFilePath(
    project.sourcePath,
    "service",
    `${definition.name}Service.java`
  );

  const controllerPath = javaFilePath(
    project.sourcePath,
    "controller",
    `${definition.name}Controller.java`
  );

  const steps: EntityResourceStep[] = [
    {
      name: "Entity",
      filePath: entityPath,
      generate: generateEntity
    },
    {
      name: "Repository",
      filePath: repositoryPath,
      generate: generateRepository
    },
    {
      name: "Request DTO",
      filePath: dtoPath,
      generate: generateDto
    },
    {
      name: "Response DTO",
      filePath: responseDtoPath,
      generate: generateResponseDto
    },
    {
      name: "Service",
      filePath: servicePath,
      generate: generateService
    },
    {
      name: "Controller",
      filePath: controllerPath,
      generate: generateController
    }
  ];

  for (const step of steps) {
    if (await fileExists(step.filePath)) {
      throw new Error(
        `${step.name} already exists: ${step.filePath}`
      );
    }
  }

  const createdFiles: string[] = [];

  try {
    for (const step of steps) {
      createdFiles.push(
        await step.generate(project, definition)
      );
    }

    return {
      entityPath,
      repositoryPath,
      dtoPath,
      responseDtoPath,
      servicePath,
      controllerPath
    };
  } catch (error) {
    const cleanupErrors: unknown[] = [];

    for (const filePath of createdFiles.reverse()) {
      try {
        await unlink(filePath);
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
      }
    }

    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        "Resource generation failed and cleanup was incomplete."
      );
    }

    throw error;
  }
}
