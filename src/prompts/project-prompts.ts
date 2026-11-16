import {
  select,
  checkbox,
  confirm,
  Separator,
} from "@inquirer/prompts";

import type {
  BuildTool,
  ProjectOptions
} from "../types/project-options.js";

import {
  getSpringBootVersions,
  isStableVersion
} from "../services/spring-metadata.js";

import {
  getSpringDependencies,
  filterDependencies
} from "../services/spring-dependencies.js";

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

  const { defaultVersion, versions } =
    await getSpringBootVersions();

  const includePrereleases = await confirm({
    message: "Include Spring Boot pre-release versions?",
    default: false
  });

  const availableVersions = includePrereleases
    ? versions
    : versions.filter((version) =>
        isStableVersion(version.id)
      );

  const firstVersion = availableVersions[0];

  if (!firstVersion) {
    throw new Error("No Spring Boot versions available.");
  }

  const selectedDefault = availableVersions.some(
    (version) => version.id === defaultVersion
  )
    ? defaultVersion
    : firstVersion.id;

  const springBootVersion = await select<string>({
    message: "Choose your Spring Boot version:",
    choices: availableVersions.map((version) => ({
      name: version.name,
      value: version.id
    })),
    default: selectedDefault
  });

  console.log("Loading available dependencies...");

  const dependencyGroups = await getSpringDependencies();

  const compatibleGroups = filterDependencies(
    dependencyGroups,
    springBootVersion
  );

const dependencyChoices = compatibleGroups.flatMap((group) => [
  new Separator(`--- ${group.name} ---`),

  ...group.values.map((dependency) => ({
    name: dependency.name,
    value: dependency.id,
    ...(dependency.description !== undefined && {
      description: dependency.description
    })
  }))
]);

  const dependencies = await checkbox<string>({
    message: "Select your dependencies:",
    choices: dependencyChoices,
    pageSize: 15
  });

  return {
    projectName,
    buildTool,
    javaVersion,
    springBootVersion,
    dependencies
  };
}
