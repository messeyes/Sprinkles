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
  createServiceTemplate
} from "./service-template.js";

export async function generateService(
  project: SpringProject,
  definition: EntityDefinition
): Promise<string> {
  const filePath = javaFilePath(
    project.sourcePath,
    "service",
    `${definition.name}Service.java`
  );

  const content = createServiceTemplate(
    definition,
    project.packageName
  );

  return writeJavaFile(filePath, content);
}
