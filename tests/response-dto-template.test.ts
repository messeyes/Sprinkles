import {
  describe,
  expect,
  it
} from "vitest";

import {
  createResponseDtoTemplate
} from "../src/generators/dto/response-dto-template.js";

describe("createResponseDtoTemplate", () => {
  it("generates a response DTO with an ID", () => {
    const result = createResponseDtoTemplate(
      {
        name: "Book",
        fields: [
          {
            name: "title",
            type: "String",
            required: true
          },
          {
            name: "author",
            type: "String",
            required: true
          }
        ]
      },
      "com.example.demo"
    );

    expect(result).toContain(
      "package com.example.demo.dto;"
    );

    expect(result).toContain(
      "public record BookResponse("
    );

    expect(result).toContain("Long id");
    expect(result).toContain("String title");
    expect(result).toContain("String author");
  });

  it("imports the required Java types", () => {
    const result = createResponseDtoTemplate(
      {
        name: "Product",
        fields: [
          {
            name: "price",
            type: "BigDecimal",
            required: true
          },
          {
            name: "createdAt",
            type: "LocalDate",
            required: false
          }
        ]
      },
      "com.example.demo"
    );

    expect(result).toContain(
      "import java.math.BigDecimal;"
    );

    expect(result).toContain(
      "import java.time.LocalDate;"
    );
  });

  it("rejects invalid entity definitions", () => {
    expect(() =>
      createResponseDtoTemplate(
        {
          name: "book",
          fields: [
            {
              name: "title",
              type: "String",
              required: true
            }
          ]
        },
        "com.example.demo"
      )
    ).toThrow();
  });
});
