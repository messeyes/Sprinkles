import type { BuildTool } from "./project-options.js";

export interface SpringProject {
  rootPath: string;
  packageName: string;
  sourcePath: string;
  buildTool: BuildTool;
}
