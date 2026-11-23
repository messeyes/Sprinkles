import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { EntityDefinition } from "../../types/entity-definition.js";
import type { SpringProject } from "../../types/spring-project.js";

import { createResponseDtoTemplate } from "./response-dto-template.js";

export async function generateResponseDto(
  project: SpringProject,
  definition: EntityDefinition
): Promise<string> {
  const dtoDirectory = path.join(
    project.sourcePath,
    "dto"
  );

  const filePath = path.join(
    dtoDirectory,
    `${definition.name}Response.java`
  );

  const content = createResponseDtoTemplate(
    definition,
    project.packageName
  );

  await mkdir(dtoDirectory, {
    recursive: true
  });

  await writeFile(filePath, content, {
    encoding: "utf-8",
    flag: "wx"
  });

  return filePath;
}
