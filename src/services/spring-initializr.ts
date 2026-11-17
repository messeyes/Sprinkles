
import AdmZip from "adm-zip";

import {
  existsSync,
  mkdirSync,
  rmSync
} from "node:fs";

import { resolve } from "node:path";

import type {
  ProjectOptions
} from "../types/project-options.js";

import {
  generateProjectStructure
} from "./project-structure.js";

export async function generateSpringProject(
  options: ProjectOptions
): Promise<void> {
  const { projectName } = options;

  const projectPath = resolve(
    process.cwd(),
    projectName
  );

  if (existsSync(projectPath)) {
    throw new Error(
      `Directory "${projectName}" already exists.`
    );
  }

  if (
    options.architecture !== undefined &&
    options.architecture !== "standard" &&
    options.architecture !== "layered"
  ) {
    throw new Error(
      `Unsupported project architecture: ${options.architecture}`
    );
  }

  const params = new URLSearchParams({
    type:
      options.buildTool === "maven"
        ? "maven-project"
        : "gradle-project",
    language: "java",
    javaVersion: options.javaVersion,
    groupId: options.groupId,
    artifactId: options.artifactId,
    name: options.projectName,
    packageName: options.packageName,
    description: options.description,
    packaging: options.packaging,
    bootVersion: options.springBootVersion,
    dependencies: options.dependencies.join(",")
  });

  const url =
    `https://start.spring.io/starter.zip?${params.toString()}`;

  console.log("Downloading Spring Boot project...");
  console.log("Request URL:", url);

  const response = await fetch(url);

  if (!response.ok) {
    const errorDetails = await response.text();

    console.error(
      "Spring Initializr error details:"
    );
    console.error(errorDetails);

    throw new Error(
      `Spring Initializr request failed: ${response.status}`
    );
  }

  const buffer = Buffer.from(
    await response.arrayBuffer()
  );

  const zip = new AdmZip(buffer);

  for (const entry of zip.getEntries()) {
    const entryName = entry.entryName.replace(
      /\\/g,
      "/"
    );

    if (
      entryName.startsWith("/") ||
      entryName.split("/").includes("..") ||
      /^[a-zA-Z]:/.test(entryName)
    ) {
      throw new Error(
        "Invalid file path found in ZIP archive."
      );
    }
  }

  mkdirSync(projectPath);

  try {
    zip.extractAllTo(projectPath, true);

    await generateProjectStructure(
      projectPath,
      options.packageName,
      options.architecture ?? "standard"
    );

    console.log(
      `Spring Boot project created: ${projectName}`
    );
  } catch (error) {
    rmSync(projectPath, {
      recursive: true,
      force: true
    });

    throw error;
  }
}
