
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

  const normalizeVersion = (version: string): string => {
    return version.replace(/\.RELEASE$/, "");
  };

  const versions = metadata.bootVersion.values.map((version) => ({
    id: normalizeVersion(version.id),
    name: version.name
  }));

  const defaultVersion = normalizeVersion(
    metadata.bootVersion.default
  );

  return {
    defaultVersion,
    versions
  };
}
