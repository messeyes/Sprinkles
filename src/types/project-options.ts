export type BuildTool = "gradle" | "maven";

export type Packaging = "jar" | "war";

export interface ProjectOptions {
  projectName: string;
  buildTool: BuildTool;
  javaVersion: string;
  springBootVersion: string;
  dependencies: string[];

  groupId: string;
  artifactId: string;
  packageName: string;
  description: string;
  packaging: Packaging;
}
