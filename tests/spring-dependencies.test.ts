import { describe, expect, it } from "vitest";

import {
  isDependencyCompatible,
  filterDependencies
} from "../src/spring/spring-dependencies.js";

describe("Spring dependency compatibility", () => {
  it("accepts dependencies without version restrictions", () => {
    expect(
      isDependencyCompatible(
        { id: "web", name: "Spring Web" },
        "4.1.2"
      )
    ).toBe(true);
  });

  it.each([
    ["3.5.0", true],
    ["3.9.0", true],
    ["4.0.0", false],
    ["3.4.0", false]
  ])("checks version %s", (version, expected) => {
    expect(
      isDependencyCompatible(
        {
          id: "example",
          name: "Example",
          versionRange: "[3.5.0,4.0.0)"
        },
        version
      )
    ).toBe(expected);
  });

  it("treats a bare version as a minimum version", () => {
    const dependency = {
      id: "mongodb",
      name: "MongoDB",
      versionRange: "4.0.0.RELEASE"
    };

    expect(
      isDependencyCompatible(dependency, "3.5.0")
    ).toBe(false);

    expect(
      isDependencyCompatible(dependency, "4.0.0")
    ).toBe(true);

    expect(
      isDependencyCompatible(dependency, "4.1.2")
    ).toBe(true);
  });

  it("rejects unparseable version ranges", () => {
    expect(
      isDependencyCompatible(
        { id: "bad", name: "Bad", versionRange: "latest" },
        "4.1.2"
      )
    ).toBe(false);
  });

  it("removes incompatible dependencies and empty groups", () => {
    const groups = [
      {
        name: "Web",
        values: [
          { id: "web", name: "Spring Web" }
        ]
      },
      {
        name: "Legacy",
        values: [
          {
            id: "legacy",
            name: "Legacy Library",
            versionRange: "[3.0.0,4.0.0)"
          }
        ]
      }
    ];

    const result = filterDependencies(groups, "4.1.2");

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Web");
  });
});
