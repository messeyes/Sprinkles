import { access, unlink } from "node:fs/promises";
import path from "node:path";

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

interface GeneratedResources {
  entityPath: string;
  repositoryPath: string;
  dtoPath: string;
  responseDtoPath: string;
  servicePath: string;
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

  const entityPath = path.join(
    project.sourcePath,
    "entity",
    `${definition.name}.java`
  );

  const repositoryPath = path.join(
    project.sourcePath,
    "repository",
    `${definition.name}Repository.java`
  );

  const dtoPath = path.join(
    project.sourcePath,
    "dto",
    `${definition.name}Request.java`
  );

  const responseDtoPath = path.join(
    project.sourcePath,
    "dto",
    `${definition.name}Response.java`
  );

  const servicePath = path.join(
    project.sourcePath,
    "service",
    `${definition.name}Service.java`
  );

  const resources = [
    { name: "Entity", filePath: entityPath },
    { name: "Repository", filePath: repositoryPath },
    { name: "Request DTO", filePath: dtoPath },
    { name: "Response DTO", filePath: responseDtoPath },
    { name: "Service", filePath: servicePath }
  ];

  for (const resource of resources) {
    if (await fileExists(resource.filePath)) {
      throw new Error(
        `${resource.name} already exists: ${resource.filePath}`
      );
    }
  }

  const createdFiles: string[] = [];

  try {
    createdFiles.push(
      await generateEntity(project, definition)
    );

    createdFiles.push(
      await generateRepository(project, definition)
    );

    createdFiles.push(
      await generateDto(project, definition)
    );

    createdFiles.push(
      await generateResponseDto(project, definition)
    );

    createdFiles.push(
      await generateService(project, definition)
    );

    return {
      entityPath,
      repositoryPath,
      dtoPath,
      responseDtoPath,
      servicePath
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
