import { input, select } from "@inquirer/prompts";

import type {
  Packaging
} from "../types/project-options.js";

import {
  validateGroupId,
  validateArtifactId,
  validatePackageName,
  getDefaultPackageName
} from "../utils/validate-project-metadata.js";

export interface ProjectMetadata {
  groupId: string;
  artifactId: string;
  packageName: string;
  description: string;
  packaging: Packaging;
}

export async function askProjectMetadata(
  projectName: string,
  current?: ProjectMetadata
): Promise<ProjectMetadata> {
  const groupId = await input({
    message: "Group ID:",
    default: current?.groupId ?? "com.example",
    validate: (value) =>
      validateGroupId(value) ||
      "Enter a valid Group ID (example: com.example)."
  });

  const artifactId = await input({
    message: "Artifact ID:",
    default: current?.artifactId ?? projectName,
    validate: (value) =>
      validateArtifactId(value) ||
      "Use lowercase letters, numbers and hyphens."
  });

  const packageName = await input({
    message: "Package name:",
    default: current?.packageName ??
      getDefaultPackageName(groupId, artifactId),
    validate: (value) =>
      validatePackageName(value) ||
      "Enter a valid Java package name."
  });

  const description = await input({
    message: "Description:",
    default: current?.description ??
      "Spring Boot application"
  });

  const packaging = await select<Packaging>({
    message: "Packaging:",
    choices: [
      { name: "JAR", value: "jar" },
      { name: "WAR", value: "war" }
    ],
    default: current?.packaging ?? "jar"
  });

  return {
    groupId,
    artifactId,
    packageName,
    description,
    packaging
  };
}
