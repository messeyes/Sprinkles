import {
  afterEach,
  describe,
  expect,
  it
} from "vitest";

import {
  chmod,
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

  it("should detect an application class with a custom name", async () => {
    const rootPath = await createTestProject("build.gradle.kts");

    const javaPath = path.join(
      rootPath,
      "src/main/java/com/example/demo"
    );

    await rm(
      path.join(javaPath, "DemoApplication.java")
    );

    await writeFile(
      path.join(javaPath, "Main.java"),
      `package com.example.demo;

import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Main {}
`
    );

    const project = await detectSpringProject(rootPath);

    expect(project.buildTool).toBe("gradle");
    expect(project.packageName).toBe("com.example.demo");
    expect(project.rootPath).toBe(rootPath);
    expect(project.sourcePath).toBe(
      path.join(javaPath)
    );
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

  it("should detect nested packages", async () => {
    const rootPath = await createTestProject("pom.xml");

    const nestedPath = path.join(
      rootPath,
      "src/main/java/com/example/nested/deep"
    );

    await mkdir(nestedPath, { recursive: true });

    await writeFile(
      path.join(nestedPath, "App.java"),
      `package com.example.nested.deep;

@SpringBootApplication
public class App {}
`
    );

    await rm(
      path.join(
        rootPath,
        "src/main/java/com/example/demo/DemoApplication.java"
      )
    );

    const project = await detectSpringProject(rootPath);

    expect(project.packageName).toBe(
      "com.example.nested.deep"
    );
    expect(project.sourcePath).toBe(nestedPath);
  });

  it("should reject projects without a Java source directory", async () => {
    const rootPath = await mkdtemp(
      path.join(os.tmpdir(), "sprinkles-test-")
    );

    temporaryDirectories.push(rootPath);

    await writeFile(path.join(rootPath, "pom.xml"), "");

    await expect(
      detectSpringProject(rootPath)
    ).rejects.toThrow(
      "Java source directory not found."
    );
  });

  it.skipIf(process.getuid?.() === 0)(
    "should surface unreadable Java files",
    async () => {
      const rootPath = await createTestProject("pom.xml");

      const applicationFile = path.join(
        rootPath,
        "src/main/java/com/example/demo/DemoApplication.java"
      );

      await chmod(applicationFile, 0o000);

      try {
        await expect(
          detectSpringProject(rootPath)
        ).rejects.toThrow(/EACCES|permission denied/i);
      } finally {
        await chmod(applicationFile, 0o644);
      }
    }
  );

  it("should ignore annotations inside comments", async () => {
    const rootPath = await createTestProject("pom.xml");

    const javaPath = path.join(
      rootPath,
      "src/main/java/com/example/demo"
    );

    await rm(
      path.join(javaPath, "DemoApplication.java")
    );

    await writeFile(
      path.join(javaPath, "Helper.java"),
      `package com.example.wrong;

// @SpringBootApplication
/* @SpringBootApplication */
public class Helper {}
`
    );

    await expect(
      detectSpringProject(rootPath)
    ).rejects.toThrow(
      "Could not find a Spring Boot application class"
    );
  });

  it("should reject annotated classes without a package declaration", async () => {
    const rootPath = await createTestProject("pom.xml");

    await writeFile(
      path.join(
        rootPath,
        "src/main/java/com/example/demo/DemoApplication.java"
      ),
      `@SpringBootApplication
public class DemoApplication {}
`
    );

    await expect(
      detectSpringProject(rootPath)
    ).rejects.toThrow(
      "Could not find a Spring Boot application class"
    );
  });
});
