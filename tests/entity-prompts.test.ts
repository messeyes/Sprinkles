import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

vi.mock("@inquirer/prompts", () => ({
  input: vi.fn(),
  select: vi.fn(),
  confirm: vi.fn()
}));

import {
  input,
  select,
  confirm
} from "@inquirer/prompts";

import {
  askEntityFields
} from "../src/cli/prompts/entity-prompts.js";

describe("askEntityFields", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should create an entity with one field", async () => {
    vi.mocked(input).mockResolvedValueOnce("title");
    vi.mocked(select).mockResolvedValueOnce("String");
    vi.mocked(confirm)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const definition = await askEntityFields("Book");

    expect(definition).toEqual({
      name: "Book",
      fields: [
        {
          name: "title",
          type: "String",
          required: true
        }
      ]
    });
  });

  it("should create an entity with multiple fields", async () => {
    vi.mocked(input)
      .mockResolvedValueOnce("title")
      .mockResolvedValueOnce("publishedYear");

    vi.mocked(select)
      .mockResolvedValueOnce("String")
      .mockResolvedValueOnce("Integer");

    vi.mocked(confirm)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    const definition = await askEntityFields("Book");

    expect(definition.fields).toHaveLength(2);

    expect(definition.fields[0]).toEqual({
      name: "title",
      type: "String",
      required: true
    });

    expect(definition.fields[1]).toEqual({
      name: "publishedYear",
      type: "Integer",
      required: false
    });
  });

  it("should reject invalid entity names", async () => {
    vi.mocked(input).mockResolvedValueOnce("title");
    vi.mocked(select).mockResolvedValueOnce("String");
    vi.mocked(confirm)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    await expect(
      askEntityFields("123Book")
    ).rejects.toThrow("Invalid entity name");
  });
});
