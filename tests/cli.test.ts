import {
  afterEach,
  describe,
  expect,
  it
} from "vitest";

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(
  new URL("..", import.meta.url)
);

const temporaryDirectories: string[] = [];

function runCli(
  args: string[],
  cwd: string = repositoryRoot
) {
  return spawnSync(
    process.execPath,
    [
      "--import",
      path.join(
        repositoryRoot,
        "node_modules/tsx/dist/loader.mjs"
      ),
      path.join(repositoryRoot, "src/index.ts"),
      ...args
    ],
    {
      cwd,
      encoding: "utf8"
    }
  );
}

afterEach(() => {
  for (const directory of temporaryDirectories) {
    fs.rmSync(directory, {
      recursive: true,
      force: true
    });
  }

  temporaryDirectories.length = 0;
});

describe("CLI commands", () => {
  it("shows the root help", () => {
    const result = runCli(["--help"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "Usage: sprinkles [options] [command] <project-name>"
    );
    expect(result.stdout).toContain("--config <path>");
    expect(result.stdout).toContain("--save-config");
    expect(result.stdout).toContain(
      "--use-project-name"
    );
    expect(result.stdout).toContain("generate");
  });

  it("shows help for generate and generate entity", () => {
    const generate = runCli(["generate", "--help"]);
    const entity = runCli(
      ["generate", "entity", "--help"]
    );

    expect(generate.status).toBe(0);
    expect(generate.stdout).toContain(
      "Generate resources for a Spring Boot project"
    );

    expect(entity.status).toBe(0);
    expect(entity.stdout).toContain(
      "Usage: sprinkles generate entity [options] <name>"
    );
  });

  it("rejects invalid option combinations", () => {
    const both = runCli([
      "demo",
      "--config",
      "missing.json",
      "--save-config"
    ]);

    const useProjectName = runCli([
      "demo",
      "--use-project-name"
    ]);

    expect(both.status).toBe(1);
    expect(both.stderr).toContain(
      "Use --config or --save-config, not both."
    );

    expect(useProjectName.status).toBe(1);
    expect(useProjectName.stderr).toContain(
      "--use-project-name requires --config."
    );
  });

  it("rejects invalid project names", () => {
    const result = runCli(["1invalid"]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "Invalid project name."
    );
  });

  it("reports missing configuration files", () => {
    const result = runCli([
      "demo",
      "--config",
      "missing.json"
    ]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "Could not read configuration file:"
    );
  });

  it("reports entity generation outside a Spring project", () => {
    const cwd = fs.mkdtempSync(
      path.join(os.tmpdir(), "sprinkles-test-")
    );

    temporaryDirectories.push(cwd);

    const result = runCli(
      ["generate", "entity", "Book"],
      cwd
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "No Maven or Gradle project found"
    );
  });
});
