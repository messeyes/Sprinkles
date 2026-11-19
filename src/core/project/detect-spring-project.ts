import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import type {
  SpringProject
} from "../../types/spring-project.js";

import type {
  BuildTool
} from "../../types/project-options.js";

async function fileExists(
  filePath: string
): Promise<boolean> {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function findApplicationPackage(
  directory: string,
  baseDirectory: string
): Promise<string | null> {
  const entries = await readdir(directory, {
    withFileTypes: true
  });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const packageName = await findApplicationPackage(
        entryPath,
        baseDirectory
      );

      if (packageName) {
        return packageName;
      }

      continue;
    }

    if (
      !entry.isFile() ||
      !entry.name.endsWith("Application.java")
    ) {
      continue;
    }

    const content = await readFile(entryPath, "utf-8");

    if (!/@SpringBootApplication\b/.test(content)) {
      continue;
    }

    const packageMatch = content.match(
      /^\s*package\s+([\w.]+)\s*;/m
    );

    if (packageMatch?.[1]) {
      return packageMatch[1];
    }
  }

  return null;
}

export async function detectSpringProject(
  rootPath: string = process.cwd()
): Promise<SpringProject> {
  const resolvedRoot = path.resolve(rootPath);

  const pomPath = path.join(resolvedRoot, "pom.xml");
  const gradlePath = path.join(
    resolvedRoot,
    "build.gradle"
  );
  const gradleKtsPath = path.join(
    resolvedRoot,
    "build.gradle.kts"
  );

  let buildTool: BuildTool;

  if (await fileExists(pomPath)) {
    buildTool = "maven";
  } else if (
    await fileExists(gradlePath) ||
    await fileExists(gradleKtsPath)
  ) {
    buildTool = "gradle";
  } else {
    throw new Error(
      "No Maven or Gradle project found in the current directory."
    );
  }

  const sourceRoot = path.join(
    resolvedRoot,
    "src",
    "main",
    "java"
  );

  let packageName: string | null;

  try {
    packageName = await findApplicationPackage(
      sourceRoot,
      sourceRoot
    );
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      throw new Error(
        "Java source directory not found."
      );
    }

    throw error;
  }

  if (!packageName) {
    throw new Error(
      "Could not find a Spring Boot application class."
    );
  }

  const sourcePath = path.join(
    sourceRoot,
    ...packageName.split(".")
  );

  return {
    rootPath: resolvedRoot,
    packageName,
    sourcePath,
    buildTool
  };
}
