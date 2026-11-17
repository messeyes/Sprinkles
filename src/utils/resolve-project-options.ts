import type {
  ProjectOptions
} from "../types/project-options.js";

import type {
  ProjectConfig
} from "../services/project-config.js";

import {
  getDefaultPackageName
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

  return {
    ...config,
    projectName,
    artifactId: projectName,
    packageName: getDefaultPackageName(
      config.groupId,
      projectName
    )
  };
}
