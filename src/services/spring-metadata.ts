
export interface SpringBootVersion {
  id: string;
  name: string;
}

interface SpringMetadata {
  bootVersion: {
    default: string;
    values: SpringBootVersion[];
  };
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

export async function getSpringBootVersions(): Promise<{
  defaultVersion: string;
  versions: SpringBootVersion[];
}> {
  const response = await fetch(
    "https://start.spring.io/metadata/client"
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Spring Initializr metadata: ${response.status}`
    );
  }

  const metadata = (await response.json()) as SpringMetadata;

  const versions = metadata.bootVersion.values.map((version) => ({
    id: normalizeVersion(version.id),
    name: version.name
  }));

  return {
    defaultVersion: normalizeVersion(metadata.bootVersion.default),
    versions
  };
}
