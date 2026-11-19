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

  it("offers all supported field types", async () => {
    vi.mocked(input).mockResolvedValueOnce("title");
    vi.mocked(select).mockResolvedValueOnce("String");
    vi.mocked(confirm)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    await askEntityFields("Book");

    const choices = vi.mocked(select).mock.calls[0]?.[0]
      .choices;

    expect(
      choices?.map(
        (choice) => (choice as { value: string }).value
      )
    ).toEqual([
      "String",
      "Integer",
      "Long",
      "Boolean",
      "BigDecimal",
      "LocalDate"
    ]);
  });

  it("validates field names during the prompts", async () => {
    vi.mocked(input)
      .mockResolvedValueOnce("title")
      .mockResolvedValueOnce("publishedYear");

    vi.mocked(select)
      .mockResolvedValueOnce("String")
      .mockResolvedValueOnce("Integer");

    vi.mocked(confirm)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    await askEntityFields("Book");

    expect(input).toHaveBeenCalledTimes(2);

    const validate = vi.mocked(input).mock.calls[1]?.[0]
      .validate;

    expect(validate?.("Title")).toBe(
      "Field name must be a valid camelCase identifier."
    );

    expect(validate?.("id")).toBe(
      'Field "id" is generated automatically.'
    );

    expect(validate?.("class")).toBe(
      "Invalid field name: class"
    );

    expect(validate?.("title")).toBe(
      "A field with this name already exists."
    );

    expect(validate?.("isAvailable")).toBe(true);
  });

  it("propagates prompt cancellation", async () => {
    vi.mocked(input).mockRejectedValueOnce(
      new Error("User force closed the prompt")
    );

    await expect(
      askEntityFields("Book")
    ).rejects.toThrow(
      "User force closed the prompt"
    );
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
