#!/usr/bin/env node

import {
  Command
} from "commander";

import {
  runCommand
} from "./cli/run-command.js";

import {
  createProject
} from "./cli/commands/create-project.js";

import type {
  CliOptions
} from "./cli/commands/create-project.js";

import {
  generateEntityCommand
} from "./cli/commands/generate-entity.js";

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
  .option(
    "--use-project-name",
    "override artifactId and packageName using the project name"
  )
  .action((
    projectName: string,
    cliOptions: CliOptions
  ) =>
    runCommand(() =>
      createProject(projectName, cliOptions)
    )
  );

const generateCommand = program
  .command("generate")
  .description(
    "Generate resources for a Spring Boot project"
  );

generateCommand
  .command("entity")
  .description(
    "Generate an entity, repository and DTOs"
  )
  .argument("<name>", "entity name")
  .action((name: string) =>
    runCommand(() => generateEntityCommand(name))
  );

await program.parseAsync();
