#!/usr/bin/env node

import { Command } from "commander";

import {
  isValidProjectName
} from "./utils/validate-project-name.js";

import {
  askProjectOptions
} from "./prompts/project-prompts.js";

import {
  generateSpringProject
} from "./services/spring-initializr.js";

import {
  loadProjectConfig,
  saveProjectConfig
} from "./services/project-config.js";

interface CliOptions {
  config?: string;
  saveConfig?: boolean;
}

const program = new Command();

program
  .name("sprinkles")
  .description("CLI to scaffold Spring Boot projects")
  .version("0.1.0");

program
  .argument("<project-name>", "name of the project")
  .option(
    "-c, --config <path>",
    "load project configuration from a JSON file"
  )
  .option(
    "-s, --save-config",
    "save interactive configuration to sprinkles.json"
  )
  .action(async (
    projectName: string,
    cliOptions: CliOptions
  ) => {
    if (!isValidProjectName(projectName)) {
      console.error("Error: Invalid project name.");
      process.exitCode = 1;
      return;
    }

    try {
      console.log(
        `Creating Spring Boot project: ${projectName}`
      );

      if (cliOptions.config && cliOptions.saveConfig) {
        throw new Error(
          "Use --config or --save-config, not both."
        );
      }

      const options = cliOptions.config
        ? {
            projectName,
            ...await loadProjectConfig(cliOptions.config)
          }
        : await askProjectOptions(projectName);

      if (cliOptions.saveConfig) {
        await saveProjectConfig(options);
        console.log(
          "Configuration saved to sprinkles.json"
        );
      }

      await generateSpringProject(options);

      console.log("Project generated successfully!");
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error(
          "An unexpected error occurred."
        );
      }

      process.exitCode = 1;
    }
  });

await program.parseAsync();
