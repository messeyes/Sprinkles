import {
  describe,
  expect,
  it
} from "vitest";

import {
  createEntityTemplate
} from "../src/generators/entity/entity-template.js";

describe("createEntityTemplate", () => {
  it("should generate a Java entity", () => {
    const result = createEntityTemplate(
      {
        name: "Book",
        fields: [
          {
            name: "title",
            type: "String",
            required: true
          },
          {
            name: "price",
            type: "BigDecimal",
            required: false
          }
        ]
      },
      "com.example.demo"
    );

    expect(result).toContain(
      "package com.example.demo.entity;"
    );

    expect(result).toContain("@Entity");

    expect(result).toContain(
      "public class Book"
    );

    expect(result).toContain(
      "private Long id;"
    );

    expect(result).toContain(
      "private String title;"
    );

    expect(result).toContain(
      "private BigDecimal price;"
    );

    expect(result).toContain(
      "import java.math.BigDecimal;"
    );

    expect(result).toContain(
      "@Column(nullable = false)"
    );
  });

  it("should import LocalDate when needed", () => {
    const result = createEntityTemplate(
      {
        name: "Book",
        fields: [
          {
            name: "publishedAt",
            type: "LocalDate",
            required: false
          }
        ]
      },
      "com.example.demo"
    );

    expect(result).toContain(
      "import java.time.LocalDate;"
    );
  });

  it("should reject invalid definitions", () => {
    expect(() =>
      createEntityTemplate(
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
