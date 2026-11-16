import type {
  SpringDependencyGroup
} from "../types/spring-dependency.js";

export interface SpringBootVersion {
  id: string;
  name: string;
}

interface SpringMetadataResponse {
  bootVersion: {
    default: string;
    values: SpringBootVersion[];
  };
  dependencies: {
    values: SpringDependencyGroup[];
  };
}

export interface SpringMetadata {
  defaultVersion: string;
  versions: SpringBootVersion[];
  dependencyGroups: SpringDependencyGroup[];
}

export function normalizeVersion(version: string): string {
  return version
    .replace(/\.RELEASE$/, "")
    .replace(/\.BUILD-SNAPSHOT$/, "-SNAPSHOT")
    .replace(/\.RC(\d+)$/, "-RC$1")
    .replace(/\.M(\d+)$/, "-M$1");
}

export function isStableVersion(version: string): boolean {
  return !/(SNAPSHOT|RC\d*|M\d+)/i.test(version);
}

export async function getSpringMetadata(): Promise<SpringMetadata> {
  const response = await fetch(
    "https://start.spring.io/metadata/client"
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Spring Initializr metadata: ${response.status}`
    );
  }

  const metadata =
    (await response.json()) as SpringMetadataResponse;

  if (
    !Array.isArray(metadata.bootVersion?.values) ||
    !Array.isArray(metadata.dependencies?.values)
  ) {
    throw new Error("Invalid Spring Initializr metadata.");
  }

  return {
    defaultVersion: normalizeVersion(
      metadata.bootVersion.default
    ),
    versions: metadata.bootVersion.values.map((version) => ({
      id: normalizeVersion(version.id),
      name: version.name
    })),
    dependencyGroups: metadata.dependencies.values
  };
}

// Keep this function for backward compatibility.
export async function getSpringBootVersions(): Promise<{
  defaultVersion: string;
  versions: SpringBootVersion[];
}> {
  const metadata = await getSpringMetadata();

  return {
    defaultVersion: metadata.defaultVersion,
    versions: metadata.versions
  };
}