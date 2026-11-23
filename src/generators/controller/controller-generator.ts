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
  createControllerTemplate
} from "./controller-template.js";

export async function generateController(
  project: SpringProject,
  definition: EntityDefinition
): Promise<string> {
  const filePath = javaFilePath(
    project.sourcePath,
    "controller",
    `${definition.name}Controller.java`
  );

  const content = createControllerTemplate(
    definition,
    project.packageName
  );

  return writeJavaFile(filePath, content);
}
