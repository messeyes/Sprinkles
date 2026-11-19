import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  EntityDefinition
} from "../../types/entity-definition.js";

import type {
  SpringProject
} from "../../types/spring-project.js";

import {
  createEntityTemplate
} from "./entity-template.js";

export async function generateEntity(
  project: SpringProject,
  definition: EntityDefinition
): Promise<string> {
  const entityDirectory = path.join(
    project.sourcePath,
    "entity"
  );

  const filePath = path.join(
    entityDirectory,
    `${definition.name}.java`
  );

  const content = createEntityTemplate(
    definition,
    project.packageName
  );

  await mkdir(entityDirectory, {
    recursive: true
  });

  await writeFile(filePath, content, {
    encoding: "utf-8",
    flag: "wx"
  });

  return filePath;
}
