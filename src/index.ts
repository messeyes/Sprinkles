#!/usr/bin/env node

import { Command } from "commander";
import { isValidProjectName } from "./utils/validate-project-name.js";

const program = new Command();

program
  .name("sprinkles")
  .description("CLI to scaffold professional Spring Boot projects")
  .version("0.1.0");

program
  .argument("<project-name>", "name of the project")
  .action((projectName: string) => {
    if (!isValidProjectName(projectName)) {
      console.error("Error: Invalid project name.");
      process.exitCode = 1;
      return;
    }

    console.log(`Creating Spring Boot project: ${projectName}`);
  });

program.parse();