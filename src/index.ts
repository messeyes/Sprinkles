#!/usr/bin/env node

import { Command } from "commander";

import {
  isValidProjectName
} from "./utils/validate-project-name.js";

import {
  askProjectOptions
} from "./cli/prompts/project-prompts.js";

import {
  askEntityFields
} from "./cli/prompts/entity-prompts.js";

import {
  generateSpringProject
} from "./generators/project/spring-initializr.js";

import {
  loadProjectConfig,
  saveProjectConfig
} from "./core/config/project-config.js";

import {
  resolveProjectOptions
} from "./utils/resolve-project-options.js";

import {
  detectSpringProject
} from "./core/project/detect-spring-project.js";

import {
  generateEntityResources
} from "./generators/generate-entity-resources.js";

interface CliOptions {
  config?: string;
  saveConfig?: boolean;
  useProjectName?: boolean;
}

const program = new Command();

program
  .name("sprinkles")
  .description("CLI to scaffold Spring Boot projects")
  .version("0.1.0");

async function runCommand(
  action: () => Promise<void>
): Promise<void> {
  try {
    await action();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("An unexpected error occurred.");
    }

    process.exitCode = 1;
  }
}

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
  .option(
    "--use-project-name",
    "override artifactId and packageName using the project name"
  )
  .action(async (
    projectName: string,
    cliOptions: CliOptions
  ) => {
    await runCommand(async () => {
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
    });
  });

const generateCommand = program
  .command("generate")
  .description("Generate resources for a Spring Boot project");

generateCommand
  .command("entity")
  .description("Generate an entity, repository and DTOs")
  .argument("<name>", "entity name")
  .action(async (name: string) => {
    await runCommand(async () => {
      const project = await detectSpringProject();

      console.log(
        `\nProject package: ${project.packageName}`
      );

      const definition = await askEntityFields(name);

      const {
        entityPath,
        repositoryPath,
        dtoPath,
        responseDtoPath
      } = await generateEntityResources(project, definition);

      console.log("\nResources generated successfully!");
      console.log(`Entity: ${entityPath}`);
      console.log(`Repository: ${repositoryPath}`);
      console.log(`Request DTO: ${dtoPath}`);
      console.log(`Response DTO: ${responseDtoPath}`);
    });
  });

await program.parseAsync();
