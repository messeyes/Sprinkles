import {
  select,
  confirm
} from "@inquirer/prompts";

import type {
  BuildTool,
  ProjectOptions
} from "../types/project-options.js";

import type {
  SpringDependencyGroup
} from "../types/spring-dependency.js";

import {
  getSpringMetadata,
  isStableVersion
} from "../services/spring-metadata.js";

import {
  filterDependencies
} from "../services/spring-dependencies.js";

import {
  filterJavaVersions,
  validateJavaVersion
} from "../services/java-compatibility.js";

import {
  askDependencies,
  getDependencyNames
} from "./dependency-prompts.js";

type ReviewAction =
  | "generate"
  | "build"
  | "java"
  | "spring"
  | "dependencies"
  | "cancel";

async function askBuildTool(
  current?: BuildTool
): Promise<BuildTool> {
  return select<BuildTool>({
    message: "Choose your build tool:",
    choices: [
      { name: "Gradle", value: "gradle" },
      { name: "Maven", value: "maven" }
    ],
    ...(current !== undefined && {
      default: current
    })
  });
}

export async function askProjectOptions(
  projectName: string
): Promise<ProjectOptions> {
  console.log("Loading Spring Initializr metadata...");

  const {
    defaultVersion,
    versions,
    dependencyGroups,
    defaultJavaVersion,
    javaVersions
  } = await getSpringMetadata();

  const chooseSpringVersion = async (
    current?: string
  ): Promise<string> => {
    const includePrereleases = await confirm({
      message: "Include Spring Boot pre-release versions?",
      default:
        current !== undefined &&
        !isStableVersion(current)
    });

    const availableVersions = includePrereleases
      ? versions
      : versions.filter((version) =>
          isStableVersion(version.id)
        );

    const firstVersion = availableVersions[0];

    if (!firstVersion) {
      throw new Error(
        "No Spring Boot versions available."
      );
    }

    const preferredVersion =
      current !== undefined &&
      availableVersions.some(
        (version) => version.id === current
      )
        ? current
        : defaultVersion;

    const selectedDefault = availableVersions.some(
      (version) => version.id === preferredVersion
    )
      ? preferredVersion
      : firstVersion.id;

    return select<string>({
      message: "Choose your Spring Boot version:",
      choices: availableVersions.map((version) => ({
        name: version.name,
        value: version.id
      })),
      default: selectedDefault
    });
  };

  const askJavaVersion = async (
    springVersion: string,
    current?: string
  ): Promise<string> => {
    const compatibleVersions = filterJavaVersions(
      javaVersions,
      springVersion
    );

    if (compatibleVersions.length === 0) {
      throw new Error(
        `No compatible Java versions found for Spring Boot ${springVersion}.`
      );
    }

    const preferredVersion =
      current !== undefined &&
      compatibleVersions.some(
        (version) => version.id === current
      )
        ? current
        : defaultJavaVersion;

    const selectedDefault = compatibleVersions.some(
      (version) => version.id === preferredVersion
    )
      ? preferredVersion
      : compatibleVersions[0]!.id;

    return select<string>({
      message: "Choose your Java version:",
      choices: compatibleVersions.map((version) => ({
        name: `Java ${version.name}`,
        value: version.id
      })),
      default: selectedDefault
    });
  };

  let buildTool = await askBuildTool();

  let springBootVersion = await chooseSpringVersion();

  let javaVersion = await askJavaVersion(
    springBootVersion
  );

  const getCompatibleGroups = ():
    SpringDependencyGroup[] => {
    return filterDependencies(
      dependencyGroups,
      springBootVersion
    );
  };

  let dependencies = await askDependencies(
    getCompatibleGroups()
  );

  while (true) {
    console.log("\nProject configuration");
    console.log("----------------------------------");
    console.log(`Name:         ${projectName}`);
    console.log(`Build tool:   ${buildTool}`);
    console.log(`Java:         ${javaVersion}`);
    console.log(`Spring Boot:  ${springBootVersion}`);

    const names = getDependencyNames(
      dependencyGroups,
      dependencies
    );

    console.log("Dependencies:");

    if (names.length === 0) {
      console.log("  None");
    } else {
      names.forEach((name) => {
        console.log(`  - ${name}`);
      });
    }

    console.log("");

    const action = await select<ReviewAction>({
      message: "What would you like to do?",
      choices: [
        {
          name: "Generate project",
          value: "generate"
        },
        {
          name: "Edit build tool",
          value: "build"
        },
        {
          name: "Edit Java version",
          value: "java"
        },
        {
          name: "Edit Spring Boot version",
          value: "spring"
        },
        {
          name: "Edit dependencies",
          value: "dependencies"
        },
        {
          name: "Cancel",
          value: "cancel"
        }
      ]
    });

    if (action === "generate") {
      validateJavaVersion(
        javaVersion,
        springBootVersion,
        javaVersions
      );

      return {
        projectName,
        buildTool,
        javaVersion,
        springBootVersion,
        dependencies
      };
    }

    if (action === "cancel") {
      throw new Error(
        "Project generation cancelled."
      );
    }

    if (action === "build") {
      buildTool = await askBuildTool(buildTool);
      continue;
    }

    if (action === "java") {
      javaVersion = await askJavaVersion(
        springBootVersion,
        javaVersion
      );

      continue;
    }

    if (action === "spring") {
      springBootVersion = await chooseSpringVersion(
        springBootVersion
      );

      const compatibleJavaVersions = filterJavaVersions(
        javaVersions,
        springBootVersion
      );

      const isCurrentJavaCompatible =
        compatibleJavaVersions.some(
          (version) => version.id === javaVersion
        );

      if (!isCurrentJavaCompatible) {
        console.log(
          "\nYour Java version is no longer compatible."
        );

        javaVersion = await askJavaVersion(
          springBootVersion
        );
      }

      const compatibleGroups = getCompatibleGroups();

      const compatibleIds = new Set(
        compatibleGroups.flatMap((group) =>
          group.values.map(
            (dependency) => dependency.id
          )
        )
      );

      const removedIds = dependencies.filter(
        (id) => !compatibleIds.has(id)
      );

      dependencies = dependencies.filter(
        (id) => compatibleIds.has(id)
      );

      if (removedIds.length > 0) {
        console.log(
          "\nRemoved incompatible dependencies:"
        );

        getDependencyNames(
          dependencyGroups,
          removedIds
        ).forEach((name) => {
          console.log(`  - ${name}`);
        });
      }

      continue;
    }

    if (action === "dependencies") {
      dependencies = await askDependencies(
        getCompatibleGroups(),
        dependencies
      );

      continue;
    }
  }
}
