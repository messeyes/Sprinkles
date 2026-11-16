import type {
  SpringDependency,
  SpringDependencyGroup
} from "../types/spring-dependency.js";

import { getSpringMetadata } from "./spring-metadata.js";

export async function getSpringDependencies():
  Promise<SpringDependencyGroup[]> {
  const metadata = await getSpringMetadata();
  return metadata.dependencyGroups;
}

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
    return false;
  }

  const [, lowerBracket, minText, maxText, upperBracket] = match;

  const minimum = minText?.trim();
  const maximum = maxText?.trim();

  if (minimum) {
    const comparison = compareVersions(bootVersion, minimum);

    if (
      comparison < 0 ||
      (comparison === 0 && lowerBracket === "(")
    ) {
      return false;
    }
  }

  if (maximum) {
    const comparison = compareVersions(bootVersion, maximum);

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
