import {
  mkdir,
  writeFile
} from "node:fs/promises";

import path from "node:path";

import type {
  EntityDefinition
} from "../../types/entity-definition.js";

import type {
  SpringProject
} from "../../types/spring-project.js";

import {
  createRepositoryTemplate
} from "./repository-template.js";

export async function generateRepository(
  project: SpringProject,
  definition: EntityDefinition
): Promise<string> {
  const repositoryDirectory = path.join(
    project.sourcePath,
    "repository"
  );

  const filePath = path.join(
    repositoryDirectory,
    `${definition.name}Repository.java`
  );

  const content = createRepositoryTemplate(
    definition,
    project.packageName
  );

  await mkdir(repositoryDirectory, {
    recursive: true
  });

  await writeFile(filePath, content, {
    encoding: "utf-8",
    flag: "wx"
  });

  return filePath;
}
