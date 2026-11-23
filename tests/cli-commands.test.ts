import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  loadProjectConfig,
  saveProjectConfig
} from "../src/core/config/project-config.js";

import {
  generateSpringProject
} from "../src/generators/project/spring-initializr.js";

import {
  runCommand
} from "../src/cli/run-command.js";

import {
  createProject
} from "../src/cli/commands/create-project.js";

import {
  askProjectOptions
} from "../src/cli/prompts/project-prompts.js";

vi.mock("../src/cli/prompts/project-prompts.js", () => ({
  askProjectOptions: vi.fn()
}));

vi.mock("../src/core/config/project-config.js", () => ({
  loadProjectConfig: vi.fn(),
  saveProjectConfig: vi.fn()
}));

vi.mock(
  "../src/generators/project/spring-initializr.js",
  () => ({
    generateSpringProject: vi.fn()
  })
);

describe("runCommand", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    process.exitCode = 0;
  });

  afterEach(() => {
    errorSpy.mockRestore();
    process.exitCode = 0;
  });

  it("logs Error messages and sets the exit code", async () => {
    await runCommand(async () => {
      throw new Error("Invalid project name.");
    });

    expect(errorSpy).toHaveBeenCalledWith(
      "Error: Invalid project name."
    );
    expect(process.exitCode).toBe(1);
  });

  it("logs a generic message for non-Error values", async () => {
    await runCommand(async () => {
      throw "unexpected";
    });

    expect(errorSpy).toHaveBeenCalledWith(
      "An unexpected error occurred."
    );
    expect(process.exitCode).toBe(1);
  });
});

describe("createProject", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  const projectOptions = {
    projectName: "demo",
    buildTool: "maven" as const,
    javaVersion: "21",
    springBootVersion: "3.5.0",
    dependencies: [],
    groupId: "com.example",
    artifactId: "demo",
    packageName: "com.example.demo",
    description: "Demo project",
    packaging: "jar" as const
  };

  beforeEach(() => {
    vi.resetAllMocks();
    logSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    vi.mocked(askProjectOptions).mockResolvedValue(
      projectOptions
    );

    vi.mocked(saveProjectConfig).mockResolvedValue(
      undefined
    );

    vi.mocked(generateSpringProject).mockResolvedValue(
      undefined
    );
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("uses interactive options and logs both messages", async () => {
    await createProject("demo", {});

    expect(askProjectOptions).toHaveBeenCalledWith(
      "demo"
    );
    expect(generateSpringProject).toHaveBeenCalledWith(
      projectOptions
    );
    expect(logSpy.mock.calls).toEqual([
      ["Creating Spring Boot project: demo"],
      ["Project generated successfully!"]
    ]);
  });

  it("saves configuration before generating the project", async () => {
    await createProject("demo", {
      saveConfig: true
    });

    expect(saveProjectConfig).toHaveBeenCalledWith(
      projectOptions
    );
    expect(logSpy.mock.calls).toEqual([
      ["Creating Spring Boot project: demo"],
      ["Configuration saved to sprinkles.json"],
      ["Project generated successfully!"]
    ]);
  });

  it("loads configuration when --config is provided", async () => {
    vi.mocked(loadProjectConfig).mockResolvedValue({
      buildTool: "maven",
      javaVersion: "21",
      springBootVersion: "3.5.0",
      dependencies: [],
      groupId: "com.example",
      artifactId: "demo",
      packageName: "com.example.demo",
      description: "Demo project",
      packaging: "jar"
    });

    await createProject("demo", {
      config: "sprinkles.json"
    });

    expect(loadProjectConfig).toHaveBeenCalledWith(
      "sprinkles.json"
    );
    expect(askProjectOptions).not.toHaveBeenCalled();
  });

  it("rejects conflicting options", async () => {
    await expect(
      createProject("demo", {
        config: "sprinkles.json",
        saveConfig: true
      })
    ).rejects.toThrow(
      "Use --config or --save-config, not both."
    );
  });
});
