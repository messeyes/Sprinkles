import {
  loadProjectConfig,
  saveProjectConfig
} from "../../core/config/project-config.js";

import {
  generateSpringProject
} from "../../generators/project/spring-initializr.js";

import {
  askProjectOptions
} from "../prompts/project-prompts.js";

import {
  isValidProjectName
} from "../../utils/validate-project-name.js";

import {
  resolveProjectOptions
} from "../../utils/resolve-project-options.js";

export interface CliOptions {
  config?: string;
  saveConfig?: boolean;
  useProjectName?: boolean;
}

export async function createProject(
  projectName: string,
  cliOptions: CliOptions
): Promise<void> {
  if (!isValidProjectName(projectName)) {
    throw new Error("Invalid project name.");
  }

  if (cliOptions.config && cliOptions.saveConfig) {
    throw new Error(
      "Use --config or --save-config, not both."
    );
  }

  if (
    cliOptions.useProjectName &&
    !cliOptions.config
  ) {
    throw new Error(
      "--use-project-name requires --config."
    );
  }

  console.log(
    `Creating Spring Boot project: ${projectName}`
  );

  const options = cliOptions.config
    ? resolveProjectOptions(
        projectName,
        await loadProjectConfig(cliOptions.config),
        cliOptions.useProjectName ?? false
      )
    : await askProjectOptions(projectName);

  if (cliOptions.saveConfig) {
    await saveProjectConfig(options);

    console.log(
      "Configuration saved to sprinkles.json"
    );
  }

  await generateSpringProject(options);

  console.log("Project generated successfully!");
}
