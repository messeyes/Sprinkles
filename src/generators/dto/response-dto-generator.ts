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
  createResponseDtoTemplate
} from "./response-dto-template.js";

export async function generateResponseDto(
  project: SpringProject,
  definition: EntityDefinition
): Promise<string> {
  const filePath = javaFilePath(
    project.sourcePath,
    "dto",
    `${definition.name}Response.java`
  );

  const content = createResponseDtoTemplate(
    definition,
    project.packageName
  );

  return writeJavaFile(filePath, content);
}
