import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  getSpringMetadata
} from "../src/spring/spring-metadata.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Spring Initializr metadata", () => {
  it("fetches versions and dependencies in one request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          bootVersion: {
            default: "4.1.2.RELEASE",
            values: [
              { id: "4.1.2.RELEASE", name: "4.1.2" }
            ]
          },

        javaVersion: {
            default: "21",
            values: [
            { id: "17", name: "17" },
            { id: "21", name: "21" },
            { id: "25", name: "25" }
        ]
      },

          dependencies: {
            values: [
              {
                name: "Web",
                values: [
                  { id: "web", name: "Spring Web" }
                ]
              }
            ]
          }
        }),
        { status: 200 }
      )
    );

    vi.stubGlobal("fetch", fetchMock);

    const metadata = await getSpringMetadata();

    expect(fetchMock).toHaveBeenCalledOnce();

    expect(metadata.defaultVersion).toBe("4.1.2");
    expect(metadata.versions[0]?.id).toBe("4.1.2");
    expect(metadata.dependencyGroups[0]?.name).toBe("Web");
    expect(metadata.dependencyGroups[0]?.values[0]?.id).toBe(
      "web"
    );

    expect(metadata.defaultJavaVersion).toBe("21");
    expect(metadata.javaVersions).toHaveLength(3);
    expect(metadata.javaVersions.map((v) => v.id)).toEqual([
    "17",
    "21",
    "25"
    ]);
  });

  it("rejects invalid metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200 })
      )
    );

    await expect(getSpringMetadata()).rejects.toThrow(
      "Invalid Spring Initializr metadata."
    );
  });

  it("handles HTTP errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Server Error", { status: 500 })
      )
    );

    await expect(getSpringMetadata()).rejects.toThrow(
      "Failed to fetch Spring Initializr metadata: 500"
    );
  });
});
