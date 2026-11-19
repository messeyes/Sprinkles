import type {
  JavaVersion
} from "./spring-metadata.js";

export function getMinimumJavaVersion(
  springBootVersion: string
): number {
  const major = Number(
    springBootVersion.match(/^(\d+)\./)?.[1]
  );

  if (!Number.isInteger(major)) {
    throw new Error(
      `Invalid Spring Boot version: ${springBootVersion}`
    );
  }

  // Spring Boot 3.x and 4.x require Java 17 or newer.
  if (major === 3 || major === 4) {
    return 17;
  }

  throw new Error(
    `Unsupported Spring Boot major version: ${major}`
  );
}

export function isJavaCompatible(
  javaVersion: string,
  springBootVersion: string
): boolean {
  const minimum = getMinimumJavaVersion(
    springBootVersion
  );

  const javaMajor = Number(
    javaVersion.startsWith("1.")
      ? javaVersion.slice(2)
      : javaVersion
  );

  return (
    Number.isInteger(javaMajor) &&
    javaMajor >= minimum
  );
}

export function filterJavaVersions(
  versions: JavaVersion[],
  springBootVersion: string
): JavaVersion[] {
  return versions.filter((version) =>
    isJavaCompatible(version.id, springBootVersion)
  );
}

export function validateJavaVersion(
  javaVersion: string,
  springBootVersion: string,
  availableVersions: JavaVersion[]
): void {
  const isAvailable = availableVersions.some(
    (version) => version.id === javaVersion
  );

  if (!isAvailable) {
    throw new Error(
      `Java ${javaVersion} is not available in Spring Initializr.`
    );
  }

  if (!isJavaCompatible(javaVersion, springBootVersion)) {
    throw new Error(
      `Java ${javaVersion} is not compatible with Spring Boot ${springBootVersion}.`
    );
  }
}
