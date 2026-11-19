import type {
  ProjectOptions
} from "../types/project-options.js";

import type {
  ProjectConfig
} from "../core/config/project-config.js";

import {
  getDefaultPackageName,
  validateArtifactId,
  validatePackageName
} from "./validate-project-metadata.js";

export function resolveProjectOptions(
  projectName: string,
  config: ProjectConfig,
  useProjectName = false
): ProjectOptions {
  if (!useProjectName) {
    return {
      projectName,
      ...config
    };
  }

  if (!validateArtifactId(projectName)) {
    throw new Error(
      `Invalid Artifact ID: "${projectName}". ` +
      "Use lowercase letters, numbers and hyphens, " +
      "starting with a letter."
    );
  }

  const packageName = getDefaultPackageName(
    config.groupId,
    projectName
  );

  if (!validatePackageName(packageName)) {
    throw new Error(
      `Invalid package name generated from project name: "${packageName}".`
    );
  }

  return {
    ...config,
    projectName,
    artifactId: projectName,
    packageName
  };
}
