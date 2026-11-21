import {
  describe,
  expect,
  it
} from "vitest";

import {
  createDtoTemplate
} from "../src/generators/dto/dto-template.js";

describe("createDtoTemplate", () => {
  it("generates a request DTO using a Java record", () => {
    const result = createDtoTemplate(
      {
        name: "Book",
        fields: [
          {
            name: "title",
            type: "String",
            required: true
          },
          {
            name: "pages",
            type: "Integer",
            required: false
          }
        ]
      },
      "com.example.demo"
    );

    expect(result).toContain(
      "package com.example.demo.dto;"
    );

    expect(result).toContain(
      "public record BookRequest("
    );

    expect(result).toContain("String title");
    expect(result).toContain("Integer pages");
  });

  it("imports BigDecimal and LocalDate when needed", () => {
    const result = createDtoTemplate(
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
      createDtoTemplate(
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
