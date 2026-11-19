import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  ProjectOptions,
  BuildTool,
  Packaging
} from "../../types/project-options.js";

import {
  validateGroupId,
  validateArtifactId,
  validatePackageName
} from "../../utils/validate-project-metadata.js";

import { isValidProjectName } from "../../utils/validate-project-name.js";

export type ProjectConfig = Omit<ProjectOptions, "projectName">;

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function validateProjectConfig(
  value: unknown
): ProjectConfig {
  if (!isRecord(value)) {
    throw new Error("Invalid project configuration.");
  }

  const {
    buildTool,
    javaVersion,
    springBootVersion,
    dependencies,
    groupId,
    artifactId,
    packageName,
    description,
    packaging
  } = value;

  if (buildTool !== "gradle" && buildTool !== "maven") {
    throw new Error("Invalid build tool.");
  }

  if (
    typeof javaVersion !== "string" ||
    !/^\d+$/.test(javaVersion)
  ) {
    throw new Error("Invalid Java version.");
  }

  if (
    typeof springBootVersion !== "string" ||
    !/^\d+\.\d+\.\d+(?:-(?:SNAPSHOT|RC\d+|M\d+))?$/.test(
      springBootVersion
    )
  ) {
    throw new Error("Invalid Spring Boot version.");
  }

  if (
    !Array.isArray(dependencies) ||
    !dependencies.every(
      (dependency) =>
        typeof dependency === "string" &&
        dependency.length > 0
    )
  ) {
    throw new Error("Invalid dependencies.");
  }

  if (
    typeof groupId !== "string" ||
    !validateGroupId(groupId)
  ) {
    throw new Error("Invalid Group ID.");
  }

  if (
    typeof artifactId !== "string" ||
    !validateArtifactId(artifactId)
  ) {
    throw new Error("Invalid Artifact ID.");
  }

  if (
    typeof packageName !== "string" ||
    !validatePackageName(packageName)
  ) {
    throw new Error("Invalid package name.");
  }

  if (typeof description !== "string") {
    throw new Error("Invalid project description.");
  }

  if (packaging !== "jar" && packaging !== "war") {
    throw new Error("Invalid packaging.");
  }

  return {
    buildTool: buildTool as BuildTool,
    javaVersion,
    springBootVersion,
    dependencies,
    groupId,
    artifactId,
    packageName,
    description,
    packaging: packaging as Packaging
  };
}

export async function loadProjectConfig(
  filePath: string
): Promise<ProjectConfig> {
  const absolutePath = path.resolve(filePath);

  let content: string;

  try {
    content = await readFile(absolutePath, "utf-8");
  } catch {
    throw new Error(
      `Could not read configuration file: ${absolutePath}`
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(content) as unknown;
  } catch {
    throw new Error(
      "Configuration file contains invalid JSON."
    );
  }

  return validateProjectConfig(parsed);
}

export async function saveProjectConfig(
  options: ProjectOptions,
  filePath = "sprinkles.json"
): Promise<void> {
  if (!isValidProjectName(options.projectName)) {
    throw new Error("Invalid project name.");
  }

  const { projectName: _projectName, ...config } = options;

  const validated = validateProjectConfig(config);

  await writeFile(
    path.resolve(filePath),
    JSON.stringify(validated, null, 2) + "\n",
    { encoding: "utf-8", flag: "wx" }
  );
}
