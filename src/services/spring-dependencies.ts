import type {
  SpringDependency,
  SpringDependencyGroup
} from "../types/spring-dependency.js";

interface SpringDependenciesMetadata {
  dependencies: {
    values: SpringDependencyGroup[];
  };
}

export async function getSpringDependencies():
  Promise<SpringDependencyGroup[]> {
  const response = await fetch(
    "https://start.spring.io/metadata/client"
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Spring dependencies: ${response.status}`
    );
  }

  const metadata =
    (await response.json()) as SpringDependenciesMetadata;

  if (!Array.isArray(metadata.dependencies?.values)) {
    throw new Error("Invalid Spring Initializr dependency metadata.");
  }

  return metadata.dependencies.values;
}

// Compare numeric Spring Boot version components.
function compareVersions(a: string, b: string): number {
  const parse = (version: string): number[] => {
    const numeric = version.match(/^\d+(?:\.\d+)*/)?.[0];

    if (!numeric) {
      throw new Error(`Invalid Spring Boot version: ${version}`);
    }

    return numeric.split(".").map(Number);
  };

  const left = parse(a);
  const right = parse(b);

  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const difference = (left[i] ?? 0) - (right[i] ?? 0);

    if (difference !== 0) {
      return Math.sign(difference);
    }
  }

  return 0;
}

export function isDependencyCompatible(
  dependency: SpringDependency,
  bootVersion: string
): boolean {
  if (!dependency.versionRange) {
    return true;
  }

  const range = dependency.versionRange.trim();

  const match = range.match(
    /^([\[(])([^,]*),([^\])]*)([\])])$/
  );

  if (!match) {
    // Unknown range syntax: do not claim compatibility.
    return false;
  }

  const [, lowerBracket, minText, maxText, upperBracket] = match;

  const minimum = minText?.trim();
  const maximum = maxText?.trim();

  if (minimum) {
    const comparison = compareVersions(
      bootVersion,
      minimum
    );

    if (
      comparison < 0 ||
      (comparison === 0 && lowerBracket === "(")
    ) {
      return false;
    }
  }

  if (maximum) {
    const comparison = compareVersions(
      bootVersion,
      maximum
    );

    if (
      comparison > 0 ||
      (comparison === 0 && upperBracket === ")")
    ) {
      return false;
    }
  }

  return true;
}

export function filterDependencies(
  groups: SpringDependencyGroup[],
  bootVersion: string
): SpringDependencyGroup[] {
  return groups
    .map((group) => ({
      ...group,
      values: group.values.filter((dependency) =>
        isDependencyCompatible(dependency, bootVersion)
      )
    }))
    .filter((group) => group.values.length > 0);
}
