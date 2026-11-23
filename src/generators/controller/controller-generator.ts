import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  EntityDefinition
} from "../../types/entity-definition.js";

import type {
  SpringProject
} from "../../types/spring-project.js";

import {
  createControllerTemplate
} from "./controller-template.js";

export async function generateController(
  project: SpringProject,
  definition: EntityDefinition
): Promise<string> {
  const content = createControllerTemplate(
    definition,
    project.packageName
  );

  const controllerDirectory = path.join(
    project.sourcePath,
    "controller"
  );

  await mkdir(controllerDirectory, {
    recursive: true
  });

  const filePath = path.join(
    controllerDirectory,
    `${definition.name}Controller.java`
  );

  await writeFile(filePath, content, {
    encoding: "utf8",
    flag: "wx"
  });

  return filePath;
}
