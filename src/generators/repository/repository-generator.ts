import type {
  EntityDefinition
} from "../../types/entity-definition.js";

import type {
  SpringProject
} from "../../types/spring-project.js";

import {
  javaFilePath,
  writeJavaFile
} from "../shared/java-files.js";

import {
  createRepositoryTemplate
} from "./repository-template.js";

export async function generateRepository(
  project: SpringProject,
  definition: EntityDefinition
): Promise<string> {
  const filePath = javaFilePath(
    project.sourcePath,
    "repository",
    `${definition.name}Repository.java`
  );

  const content = createRepositoryTemplate(
    definition,
    project.packageName
  );

  return writeJavaFile(filePath, content);
}
