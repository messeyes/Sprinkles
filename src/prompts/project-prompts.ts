
import { select, checkbox } from "@inquirer/prompts";
import type { BuildTool, ProjectOptions } from "../types/project-options.js";

export async function askProjectOptions(
  projectName: string
): Promise<ProjectOptions> {
  const buildTool = await select<BuildTool>({
    message: "Choose your build tool:",
    choices: [
      { name: "Gradle", value: "gradle" },
      { name: "Maven", value: "maven" }
    ]
  });

  const javaVersion = await select<string>({
    message: "Choose your Java version:",
    choices: [
      { name: "Java 17", value: "17" },
      { name: "Java 21", value: "21" },
      { name: "Java 25", value: "25" }
    ]
  });

  const dependencies = await checkbox<string>({
    message: "Select your dependencies:",
    choices: [
      { name: "Spring Web", value: "web", checked: true },
      { name: "Spring Data JPA", value: "data-jpa" },
      { name: "PostgreSQL Driver", value: "postgresql" },
      { name: "Validation", value: "validation" },
      { name: "Spring Security", value: "security" },
      { name: "Spring Boot Actuator", value: "actuator" },
      { name: "Flyway Migration", value: "flyway" },
      { name: "Lombok", value: "lombok" }
    ]
  });

  return {
    projectName,
    buildTool,
    javaVersion,
    dependencies
  };
}
