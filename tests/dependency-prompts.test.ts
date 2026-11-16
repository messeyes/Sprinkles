import { describe, expect, it } from "vitest";

import {
  searchDependencies,
  getDependencyNames
} from "../src/prompts/dependency-prompts.js";

import type {
  SpringDependencyGroup
} from "../src/types/spring-dependency.js";

const groups: SpringDependencyGroup[] = [
  {
    name: "SQL",
    values: [
      {
        id: "postgresql",
        name: "PostgreSQL Driver",
        description: "PostgreSQL database connectivity"
      },
      {
        id: "data-jpa",
        name: "Spring Data JPA"
      }
    ]
  },
  {
    name: "Security",
    values: [
      {
        id: "security",
        name: "Spring Security"
      }
    ]
  }
];

describe("Dependency search", () => {
  it("finds dependencies by name", () => {
    const result = searchDependencies(groups, "postgres");

    expect(result).toHaveLength(1);
    expect(result[0]?.values[0]?.id).toBe("postgresql");
  });

  it("finds dependencies by ID", () => {
    const result = searchDependencies(groups, "data-jpa");

    expect(result[0]?.values[0]?.id).toBe("data-jpa");
  });

  it("searches without case sensitivity", () => {
    const result = searchDependencies(groups, "SECURITY");

    expect(result[0]?.name).toBe("Security");
  });

  it("finds dependencies by description", () => {
    const result = searchDependencies(groups, "connectivity");

    expect(result[0]?.values[0]?.id).toBe("postgresql");
  });

  it("returns no groups when nothing matches", () => {
    const result = searchDependencies(groups, "mongodb");

    expect(result).toEqual([]);
  });

  it("resolves selected dependency names", () => {
    const names = getDependencyNames(groups, [
      "postgresql",
      "security"
    ]);

    expect(names).toEqual([
      "PostgreSQL Driver",
      "Spring Security"
    ]);
  });
});
