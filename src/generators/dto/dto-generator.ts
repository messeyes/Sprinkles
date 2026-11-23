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
  createDtoTemplate
} from "./dto-template.js";

export async function generateDto(
  project: SpringProject,
  definition: EntityDefinition
): Promise<string> {
  const filePath = javaFilePath(
    project.sourcePath,
    "dto",
    `${definition.name}Request.java`
  );

  const content = createDtoTemplate(
    definition,
    project.packageName
  );

  return writeJavaFile(filePath, content);
}
