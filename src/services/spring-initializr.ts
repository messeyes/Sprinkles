
import AdmZip from "adm-zip";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import type { ProjectOptions } from "../types/project-options.js";

export async function generateSpringProject(
  options: ProjectOptions
): Promise<void> {
  const { projectName, buildTool, javaVersion, dependencies } = options;

  const projectPath = resolve(process.cwd(), projectName);

  if (existsSync(projectPath)) {
    throw new Error(`Directory "${projectName}" already exists.`);
  }

  const packageSuffix = projectName
    .toLowerCase()
    .replace(/[-_]/g, "");

  const params = new URLSearchParams({
    type: buildTool === "maven" ? "maven-project" : "gradle-project",
    language: "java",
    javaVersion,
    groupId: "com.example",
    artifactId: projectName,
    name: projectName,
    packageName: `com.example.${packageSuffix}`,
    dependencies: dependencies.join(",")
  });

  const url = `https://start.spring.io/starter.zip?${params.toString()}`;

  console.log("Downloading Spring Boot project...");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Spring Initializr request failed: ${response.status}`
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const zip = new AdmZip(buffer);

  // Check ZIP entries before extracting
  for (const entry of zip.getEntries()) {
    const entryName = entry.entryName.replace(/\\/g, "/");

    if (
      entryName.startsWith("/") ||
      entryName.split("/").includes("..") ||
      /^[a-zA-Z]:/.test(entryName)
    ) {
      throw new Error("Invalid file path found in ZIP archive.");
    }
  }

  mkdirSync(projectPath);

  try {
    zip.extractAllTo(projectPath, true);

    console.log(`Spring Boot project created: ${projectName}`);
  } catch (error) {
    rmSync(projectPath, { recursive: true, force: true });
    throw error;
  }
}
