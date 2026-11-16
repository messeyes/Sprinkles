
import { afterEach, describe, expect, it, vi } from "vitest";
import AdmZip from "adm-zip";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateSpringProject } from "../src/services/spring-initializr.js";
import type { ProjectOptions } from "../src/types/project-options.js";

const originalCwd = process.cwd();
const originalFetch = globalThis.fetch;

afterEach(() => {
  vi.restoreAllMocks();
  globalThis.fetch = originalFetch;
  process.chdir(originalCwd);
});

describe("Spring Initializr project generation", () => {
  const configurations: Array<{
    buildTool: ProjectOptions["buildTool"];
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

  it.each(configurations)(
    "generates $buildTool project with Java $javaVersion",
    async ({ buildTool, javaVersion, dependencies }) => {
      const directory = mkdtempSync(
        join(tmpdir(), "sprinkles-test-")
      );

      try {
        process.chdir(directory);

        const zip = new AdmZip();
        zip.addFile("README.md", Buffer.from("Test project"));

       const zipBuffer = zip.toBuffer();

        const zipBytes = Uint8Array.from(zipBuffer);

        const fetchMock = vi.fn().mockResolvedValue(
        new Response(new Blob([zipBytes]), { status: 200 })
        );

        vi.stubGlobal("fetch", fetchMock);

        const options: ProjectOptions = {
          projectName: "test-project",
          buildTool,
          javaVersion,
          springBootVersion: "4.1.2",
          dependencies
        };

        await generateSpringProject(options);

        expect(fetchMock).toHaveBeenCalledOnce();

        const requestedUrl = new URL(
          fetchMock.mock.calls[0][0] as string
        );

        expect(requestedUrl.searchParams.get("type")).toBe(
          buildTool === "maven"
            ? "maven-project"
            : "gradle-project"
        );

        expect(requestedUrl.searchParams.get("javaVersion")).toBe(
          javaVersion
        );

        expect(requestedUrl.searchParams.get("bootVersion")).toBe(
          "4.1.2"
        );

        expect(requestedUrl.searchParams.get("dependencies")).toBe(
          dependencies.join(",")
        );

        expect(existsSync(join(directory, "test-project"))).toBe(
          true
        );

        expect(
          readFileSync(
            join(directory, "test-project", "README.md"),
            "utf8"
          )
        ).toBe("Test project");
      } finally {
        process.chdir(originalCwd);
        rmSync(directory, { recursive: true, force: true });
      }
    }
  );
});
