import { mkdir, writeFile } from "node:fs/promises";
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

async function createLayer(
  basePath: string,
  layer: string,
  keepEmpty: boolean = true
): Promise<void> {
  const layerPath = path.join(basePath, layer);

  await mkdir(layerPath, {
    recursive: true
  });

  if (keepEmpty) {
    await writeFile(
      path.join(layerPath, ".gitkeep"),
      "",
      { flag: "wx" }
    );
  }
}

function createHelloController(
  packageName: string
): string {
  return `package ${packageName}.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello, World!";
    }
}
`;
}

function createHelloControllerTest(
  packageName: string,
  springBootVersion: string
): string {
  const webMvcTestImport = springBootVersion.startsWith("4.")
    ? "org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest"
    : "org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest";

  return `package ${packageName}.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import ${webMvcTestImport};
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HelloController.class)
class HelloControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnHelloWorld() throws Exception {
        mockMvc.perform(get("/hello"))
                .andExpect(status().isOk())
                .andExpect(content().string("Hello, World!"));
    }
}
`;
}

export async function generateProjectStructure(
  projectPath: string,
  packageName: string,
  architecture: ProjectArchitecture = "standard",
  dependencies: string[] = [],
  springBootVersion: string = ""
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
  const hasSpringWeb = dependencies.includes("web");

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
    await createLayer(
      mainPath,
      layer,
      !(hasSpringWeb && layer === "controller")
    );
  }

  for (const layer of TEST_LAYERS) {
    await createLayer(
      testPath,
      layer,
      !(hasSpringWeb && layer === "controller")
    );
  }

  if (!hasSpringWeb) {
    return;
  }

  await writeFile(
    path.join(mainPath, "controller", "HelloController.java"),
    createHelloController(packageName),
    { flag: "wx" }
  );

  await writeFile(
    path.join(testPath, "controller", "HelloControllerTest.java"),
    createHelloControllerTest(packageName, springBootVersion),
    { flag: "wx" }
  );
}
