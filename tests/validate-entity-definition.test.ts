import {
  describe,
  expect,
  it
} from "vitest";

import {
  validateEntityDefinition
} from "../src/utils/validate-entity-definition.js";

import type {
  EntityDefinition
} from "../src/types/entity-definition.js";

describe("validateEntityDefinition", () => {
  const validEntity: EntityDefinition = {
    name: "Book",
    fields: [
      {
        name: "title",
        type: "String",
        required: true
      },
      {
        name: "publishedYear",
        type: "Integer",
        required: false
      }
    ]
  };

  it("should accept a valid entity", () => {
    expect(() =>
      validateEntityDefinition(validEntity)
    ).not.toThrow();
  });

  it("should reject invalid entity names", () => {
    expect(() =>
      validateEntityDefinition({
        ...validEntity,
        name: "123Book"
      })
    ).toThrow("Invalid entity name");
  });

  it("should require uppercase entity names", () => {
    expect(() =>
      validateEntityDefinition({
        ...validEntity,
        name: "book"
      })
    ).toThrow(
      "Entity name must start with an uppercase letter"
    );
  });

  it("should reject entities without fields", () => {
    expect(() =>
      validateEntityDefinition({
        ...validEntity,
        fields: []
      })
    ).toThrow("Entity must have at least one field");
  });

  it("should reject duplicate fields", () => {
    expect(() =>
      validateEntityDefinition({
        ...validEntity,
        fields: [
          {
            name: "title",
            type: "String",
            required: true
          },
          {
            name: "title",
            type: "String",
            required: false
          }
        ]
      })
    ).toThrow("Duplicate field name");
  });

  it("should reject manually defined IDs", () => {
    expect(() =>
      validateEntityDefinition({
        ...validEntity,
        fields: [
          {
            name: "id",
            type: "Long",
            required: true
          }
        ]
      })
    ).toThrow(
      'Field "id" is generated automatically.'
    );
  });

  it("should reject unsupported field types", () => {
    expect(() =>
      validateEntityDefinition({
        ...validEntity,
        fields: [
          {
            name: "authors",
            type: "ArrayList" as never,
            required: true
          }
        ]
      })
    ).toThrow("Unsupported field type");
  });

  it("should reject Java keywords", () => {
    expect(() =>
      validateEntityDefinition({
        ...validEntity,
        fields: [
          {
            name: "class",
            type: "String",
            required: true
          }
        ]
      })
    ).toThrow("Invalid field name");
  });

  it("should reject invalid required values", () => {
    expect(() =>
      validateEntityDefinition({
        ...validEntity,
        fields: [
          {
            name: "title",
            type: "String",
            required: "yes" as never
          }
        ]
      })
    ).toThrow("Invalid required value");
  });
});
