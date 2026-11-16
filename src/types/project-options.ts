export type BuildTool = "gradle" | "maven";

export interface ProjectOptions {
  projectName: string;
  buildTool: BuildTool;
  javaVersion: string;
  dependencies: string[];
}
