import { input } from "@inquirer/prompts";

import {
  isValidProjectName
} from "../utils/validate-project-name.js";

import {
  askProjectOptions
} from "../prompts/project-prompts.js";

import {
  saveProjectConfig
} from "../services/project-config.js";

export async function initProjectConfig(): Promise<void> {
  const projectName = await input({
    message: "Project name:",
    default: "demo",
    validate: (value) =>
      isValidProjectName(value) ||
      "Invalid project name."
  });

  const options = await askProjectOptions(projectName);

  await saveProjectConfig(options);

  console.log("\nConfiguration saved to sprinkles.json");
}
