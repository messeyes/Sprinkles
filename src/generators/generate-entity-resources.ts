import { access, unlink } from "node:fs/promises";
import path from "node:path";

import type { EntityDefinition } from "../types/entity-definition.js";
import type { SpringProject } from "../types/spring-project.js";

import { validateEntityDefinition } from "../utils/validate-entity-definition.js";
import { generateEntity } from "./entity/entity-generator.js";
import { generateRepository } from "./repository/repository-generator.js";

interface GeneratedResources {
  entityPath: string;
  repositoryPath: string;
}

async function fileExists(filePath: string): Promise<boolean> {
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

  if (await fileExists(entityPath)) {
    throw new Error(`Entity already exists: ${entityPath}`);
  }

  if (await fileExists(repositoryPath)) {
    throw new Error(`Repository already exists: ${repositoryPath}`);
  }

  const createdEntityPath = await generateEntity(
    project,
    definition
  );

  try {
    const createdRepositoryPath = await generateRepository(
      project,
      definition
    );

    return {
      entityPath: createdEntityPath,
      repositoryPath: createdRepositoryPath
    };
  } catch (error) {
    try {
      await unlink(createdEntityPath);
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Repository generation failed and entity cleanup also failed."
      );
    }

    throw error;
  }
}
