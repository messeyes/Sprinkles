import { mkdir } from "node:fs/promises";
import path from "node:path";

import type {
  ProjectArchitecture
} from "../types/project-options.js";

const MAIN_LAYERS = [
  "controller",
  "service",
  "repository",
  "entity",
  "dto",
  "config",
  "exception"
] as const;

const TEST_LAYERS = [
  "controller",
  "service",
  "repository"
] as const;

export async function generateProjectStructure(
  projectPath: string,
  packageName: string,
  architecture: ProjectArchitecture = "standard"
): Promise<void> {
  if (architecture === "standard") {
    return;
  }

  if (architecture !== "layered") {
    throw new Error(
      `Unsupported project architecture: ${architecture}`
    );
  }

  const packagePath = packageName.replace(/\./g, "/");

  const mainPath = path.join(
    projectPath,
    "src",
    "main",
    "java",
    packagePath
  );

  const testPath = path.join(
    projectPath,
    "src",
    "test",
    "java",
    packagePath
  );

  for (const layer of MAIN_LAYERS) {
    await mkdir(path.join(mainPath, layer), {
      recursive: true
    });
  }

  for (const layer of TEST_LAYERS) {
    await mkdir(path.join(testPath, layer), {
      recursive: true
    });
  }
}
