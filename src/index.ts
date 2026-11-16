#!/usr/bin/env node

import { Command } from "commander";
import { isValidProjectName } from "./utils/validate-project-name.js";
import { askProjectOptions } from "./prompts/project-prompts.js";
import { generateSpringProject } from "./services/spring-initializr.js";

const program = new Command();

program
  .name("sprinkles")
  .description("CLI to scaffold Spring Boot projects")
  .version("0.1.0");

program
  .argument("<project-name>", "name of the project")
  .action(async (projectName: string) => {
    if (!isValidProjectName(projectName)) {
      console.error("Error: Invalid project name.");
      process.exitCode = 1;
      return;
    }

    try {
      console.log(`Creating Spring Boot project: ${projectName}`);

      const options = await askProjectOptions(projectName);

      await generateSpringProject(options);

      console.log("Project generated successfully!");
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error("An unexpected error occurred.");
      }

      process.exitCode = 1;
    }
  });

program.parseAsync();
