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
  createEntityTemplate
} from "./entity-template.js";

export async function generateEntity(
  project: SpringProject,
  definition: EntityDefinition
): Promise<string> {
  const filePath = javaFilePath(
    project.sourcePath,
    "entity",
    `${definition.name}.java`
  );

  const content = createEntityTemplate(
    definition,
    project.packageName
  );

  return writeJavaFile(filePath, content);
}
