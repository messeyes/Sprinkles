import {
  detectSpringProject
} from "../../core/project/detect-spring-project.js";

import {
  generateEntityResources
} from "../../generators/generate-entity-resources.js";

import {
  askEntityFields
} from "../prompts/entity-prompts.js";

export async function generateEntityCommand(
  name: string
): Promise<void> {
  const project = await detectSpringProject();

  console.log(
    `\nProject package: ${project.packageName}`
  );

  const definition = await askEntityFields(name);

  const {
    entityPath,
    repositoryPath,
    dtoPath,
    responseDtoPath,
    servicePath,
    controllerPath
  } = await generateEntityResources(
    project,
    definition
  );

  console.log(
    "\nResources generated successfully!"
  );
  console.log(`Entity: ${entityPath}`);
  console.log(`Repository: ${repositoryPath}`);
  console.log(`Request DTO: ${dtoPath}`);
  console.log(`Response DTO: ${responseDtoPath}`);
  console.log(`Service: ${servicePath}`);
  console.log(`Controller: ${controllerPath}`);
}
