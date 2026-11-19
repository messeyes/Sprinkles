import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import AdmZip from "adm-zip";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  generateSpringProject
} from "../src/generators/project/spring-initializr.js";

import type {
  BuildTool,
  ProjectOptions
} from "../src/types/project-options.js";

describe("Spring Initializr project generation", () => {
  let testDirectory: string;
  let originalDirectory: string;

  const createOptions = (
    buildTool: BuildTool,
    javaVersion: string,
    overrides: Partial<ProjectOptions> = {}
  ): ProjectOptions => ({
    projectName: "test-project",
    buildTool,
    javaVersion,
    springBootVersion: "4.1.2",
    dependencies: [],

    groupId: "com.example",
    artifactId: "test-project",
    packageName: "com.example.testproject",
    description: "Spring Boot application",
    packaging: "jar",

    ...overrides
  });

  beforeEach(() => {
    originalDirectory = process.cwd();

    testDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "sprinkles-test-")
    );

    process.chdir(testDirectory);
  });

  afterEach(() => {
    process.chdir(originalDirectory);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();

    fs.rmSync(testDirectory, {
      recursive: true,
      force: true
    });
  });

  function mockSpringInitializr(): ReturnType<typeof vi.fn> {
    const zip = new AdmZip();

    zip.addFile(
      "README.md",
      Buffer.from("# Generated Spring Boot Project")
    );

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        new Uint8Array(zip.toBuffer()),
        {
          status: 200,
          headers: {
            "content-type": "application/zip"
          }
        }
      )
    );

    vi.stubGlobal("fetch", fetchMock);

    return fetchMock;
  }

  const scenarios: Array<{
    buildTool: BuildTool;
    javaVersion: string;
    dependencies: string[];
  }> = [
    {
      buildTool: "gradle",
      javaVersion: "17",
      dependencies: []
    },
    {
      buildTool: "gradle",
      javaVersion: "21",
      dependencies: ["web"]
    },
    {
      buildTool: "gradle",
      javaVersion: "25",
      dependencies: ["data-jpa", "postgresql"]
    },
    {
      buildTool: "maven",
      javaVersion: "17",
      dependencies: ["validation"]
    },
    {
      buildTool: "maven",
      javaVersion: "21",
      dependencies: ["security", "actuator"]
    },
    {
      buildTool: "maven",
      javaVersion: "25",
      dependencies: [
        "web",
        "data-jpa",
        "postgresql",
        "validation",
        "security",
        "actuator",
        "flyway",
        "lombok"
      ]
    }
  ];

  it.each(scenarios)(
    "generates $buildTool project with Java $javaVersion",
    async ({ buildTool, javaVersion, dependencies }) => {
      const fetchMock = mockSpringInitializr();

      const options = createOptions(
        buildTool,
        javaVersion,
        { dependencies }
      );

      await generateSpringProject(options);

      expect(fetchMock).toHaveBeenCalledOnce();

      const requestUrl = String(
        fetchMock.mock.calls[0]?.[0]
      );

      const url = new URL(requestUrl);

      expect(url.origin).toBe("https://start.spring.io");
      expect(url.pathname).toBe("/starter.zip");

      expect(url.searchParams.get("type")).toBe(
        buildTool === "maven"
          ? "maven-project"
          : "gradle-project"
      );

      expect(url.searchParams.get("javaVersion")).toBe(
        javaVersion
      );

      expect(url.searchParams.get("bootVersion")).toBe(
        "4.1.2"
      );

      expect(url.searchParams.get("dependencies")).toBe(
        dependencies.join(",")
      );

      expect(
        fs.existsSync(
          path.join(testDirectory, "test-project", "README.md")
        )
      ).toBe(true);
    }
  );

  it("sends custom project metadata to Spring Initializr", async () => {
    const fetchMock = mockSpringInitializr();

    const options = createOptions("gradle", "21", {
      groupId: "com.messeyes",
      artifactId: "my-api",
      packageName: "com.messeyes.myapi",
      description: "My Spring Boot REST API",
      packaging: "jar"
    });

    await generateSpringProject(options);

    const requestUrl = String(
      fetchMock.mock.calls[0]?.[0]
    );

    const url = new URL(requestUrl);

    expect(url.searchParams.get("groupId")).toBe(
      "com.messeyes"
    );

    expect(url.searchParams.get("artifactId")).toBe(
      "my-api"
    );

    expect(url.searchParams.get("packageName")).toBe(
      "com.messeyes.myapi"
    );

    expect(url.searchParams.get("description")).toBe(
      "My Spring Boot REST API"
    );

    expect(url.searchParams.get("packaging")).toBe("jar");

    expect(url.searchParams.get("name")).toBe(
      "test-project"
    );
  });

  it("refuses to overwrite an existing directory", async () => {
    const fetchMock = mockSpringInitializr();

    fs.mkdirSync(path.join(testDirectory, "test-project"));

    await expect(
      generateSpringProject(createOptions("maven", "17"))
    ).rejects.toThrow(
      'Directory "test-project" already exists.'
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("propagates network errors without creating the project", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("offline"))
    );

    await expect(
      generateSpringProject(createOptions("maven", "17"))
    ).rejects.toThrow("offline");

    expect(
      fs.existsSync(path.join(testDirectory, "test-project"))
    ).toBe(false);
  });

  it("reports HTTP errors without creating the project", async () => {
    vi.spyOn(console, "error").mockImplementation(
      () => undefined
    );

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("boom", { status: 500 })
      )
    );

    await expect(
      generateSpringProject(createOptions("maven", "17"))
    ).rejects.toThrow(
      "Spring Initializr request failed: 500"
    );

    expect(
      fs.existsSync(path.join(testDirectory, "test-project"))
    ).toBe(false);
  });

  it("rejects invalid ZIP content without creating the project", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array(Buffer.from("not a zip")))
      )
    );

    await expect(
      generateSpringProject(createOptions("maven", "17"))
    ).rejects.toThrow("Invalid or unsupported zip format");

    expect(
      fs.existsSync(path.join(testDirectory, "test-project"))
    ).toBe(false);
  });

  it("preserves the original project structure from the archive", async () => {
    const zip = new AdmZip();

    zip.addFile(
      "pom.xml",
      Buffer.from("<project></project>")
    );

    zip.addFile(
      "src/main/java/com/example/testproject/DemoApplication.java",
      Buffer.from("package com.example.testproject;")
    );

    zip.addFile(
      "src/main/resources/application.properties",
      Buffer.from("spring.application.name=test-project")
    );

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array(zip.toBuffer()), {
          status: 200
        })
      )
    );

    await generateSpringProject(
      createOptions("maven", "17")
    );

    const projectPath = path.join(
      testDirectory,
      "test-project"
    );

    expect(
      fs.existsSync(path.join(projectPath, "pom.xml"))
    ).toBe(true);

    expect(
      fs.existsSync(
        path.join(
          projectPath,
          "src/main/java/com/example/testproject/DemoApplication.java"
        )
      )
    ).toBe(true);

    expect(
      fs.existsSync(
        path.join(
          projectPath,
          "src/main/resources/application.properties"
        )
      )
    ).toBe(true);

    expect(
      fs.existsSync(
        path.join(projectPath, "src/main/java/HelloController.java")
      )
    ).toBe(false);

    expect(
      fs.existsSync(
        path.join(projectPath, "src/main/java/com/example/testproject/controller")
      )
    ).toBe(false);
  });

  it("supports WAR packaging", async () => {
    const fetchMock = mockSpringInitializr();

    const options = createOptions("maven", "21", {
      packaging: "war"
    });

    await generateSpringProject(options);

    const requestUrl = String(
      fetchMock.mock.calls[0]?.[0]
    );

    const url = new URL(requestUrl);

    expect(url.searchParams.get("packaging")).toBe("war");
  });
});
