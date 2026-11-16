import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  getSpringMetadata
} from "../src/services/spring-metadata.js";

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
