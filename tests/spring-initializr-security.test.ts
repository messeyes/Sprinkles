import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

vi.mock("adm-zip", () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      getEntries: () => [
        { entryName: "../evil.txt" }
      ],
      extractAllTo: vi.fn()
    };
  })
}));

import AdmZip from "adm-zip";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  generateSpringProject
} from "../src/generators/project/spring-initializr.js";

describe("Spring Initializr ZIP validation", () => {
  let testDirectory: string;
  let originalDirectory: string;

  afterEach(() => {
    process.chdir(originalDirectory);
    vi.unstubAllGlobals();

    fs.rmSync(testDirectory, {
      recursive: true,
      force: true
    });
  });

  it("rejects path traversal entries before extracting", async () => {
    testDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "sprinkles-test-")
    );

    originalDirectory = process.cwd();
    process.chdir(testDirectory);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array(), {
          status: 200
        })
      )
    );

    await expect(
      generateSpringProject({
        projectName: "test-project",
        buildTool: "maven",
        javaVersion: "17",
        springBootVersion: "4.1.2",
        dependencies: [],
        groupId: "com.example",
        artifactId: "test-project",
        packageName: "com.example.testproject",
        description: "Spring Boot application",
        packaging: "jar"
      })
    ).rejects.toThrow(
      "Invalid file path found in ZIP archive."
    );

    const zip = vi.mocked(AdmZip).mock.results[0]?.value;

    expect(zip.extractAllTo).not.toHaveBeenCalled();

    expect(
      fs.existsSync(
        path.join(testDirectory, "test-project")
      )
    ).toBe(false);
  });
});
