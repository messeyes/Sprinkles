import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  EntityDefinition
} from "../../types/entity-definition.js";

import type {
  SpringProject
} from "../../types/spring-project.js";

import {
  createServiceTemplate
} from "./service-template.js";

export async function generateService(
  project: SpringProject,
  definition: EntityDefinition
): Promise<string> {
  const serviceDirectory = path.join(
    project.sourcePath,
    "service"
  );

  await mkdir(serviceDirectory, {
    recursive: true
  });

  const filePath = path.join(
    serviceDirectory,
    `${definition.name}Service.java`
  );

  const content = createServiceTemplate(
    definition,
    project.packageName
  );

  await writeFile(filePath, content, {
    encoding: "utf8",
    flag: "wx"
  });

  return filePath;
}
