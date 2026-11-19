import {
  afterEach,
  describe,
  expect,
  it
} from "vitest";

import {
  mkdtemp,
  mkdir,
  writeFile,
  rm
} from "node:fs/promises";

import path from "node:path";
import os from "node:os";

import {
  detectSpringProject
} from "../src/core/project/detect-spring-project.js";

const temporaryDirectories: string[] = [];

async function createTestProject(
  buildFile: string
): Promise<string> {
  const rootPath = await mkdtemp(
    path.join(os.tmpdir(), "sprinkles-test-")
  );

  temporaryDirectories.push(rootPath);

  const javaPath = path.join(
    rootPath,
    "src/main/java/com/example/demo"
  );

  await mkdir(javaPath, { recursive: true });

  await writeFile(
    path.join(rootPath, buildFile),
    ""
  );

  await writeFile(
    path.join(javaPath, "DemoApplication.java"),
    `package com.example.demo;

import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {}
`
  );

  return rootPath;
}

afterEach(async () => {
  for (const directory of temporaryDirectories) {
    await rm(directory, {
      recursive: true,
      force: true
    });
  }

  temporaryDirectories.length = 0;
});

describe("detectSpringProject", () => {
  it("should detect a Maven project", async () => {
    const rootPath = await createTestProject("pom.xml");

    const project = await detectSpringProject(rootPath);

    expect(project.buildTool).toBe("maven");
    expect(project.packageName).toBe("com.example.demo");

    expect(project.sourcePath).toBe(
      path.join(
        rootPath,
        "src/main/java/com/example/demo"
      )
    );
  });

  it("should detect a Gradle project", async () => {
    const rootPath = await createTestProject(
      "build.gradle"
    );

    const project = await detectSpringProject(rootPath);

    expect(project.buildTool).toBe("gradle");
  });

  it("should reject directories without a build file", async () => {
    const rootPath = await mkdtemp(
      path.join(os.tmpdir(), "sprinkles-test-")
    );

    temporaryDirectories.push(rootPath);

    await expect(
      detectSpringProject(rootPath)
    ).rejects.toThrow(
      "No Maven or Gradle project found"
    );
  });

  it("should reject projects without an application class", async () => {
    const rootPath = await createTestProject("pom.xml");

    await rm(
      path.join(
        rootPath,
        "src/main/java/com/example/demo/DemoApplication.java"
      )
    );

    await expect(
      detectSpringProject(rootPath)
    ).rejects.toThrow(
      "Could not find a Spring Boot application class"
    );
  });
});
