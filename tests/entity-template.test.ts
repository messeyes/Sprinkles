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

  it("should generate getters and setters for entity fields", () => {
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
            name: "pages",
            type: "Integer",
            required: false
          }
        ]
      },
      "com.example.demo"
    );

    expect(result).toContain(
      "public String getTitle()"
    );

    expect(result).toContain(
      "return this.title;"
    );

    expect(result).toContain(
      "public void setTitle(String title)"
    );

    expect(result).toContain(
      "this.title = title;"
    );

    expect(result).toContain(
      "public Integer getPages()"
    );

    expect(result).toContain(
      "public void setPages(Integer pages)"
    );
  });

  it("should generate only a getter for the ID", () => {
    const result = createEntityTemplate(
      {
        name: "Book",
        fields: [
          {
            name: "title",
            type: "String",
            required: true
          }
        ]
      },
      "com.example.demo"
    );

    expect(result).toContain(
      "public Long getId()"
    );

    expect(result).toContain(
      "return this.id;"
    );

    expect(result).not.toContain(
      "setId("
    );
  });

  it("should generate methods for BigDecimal and LocalDate fields", () => {
    const result = createEntityTemplate(
      {
        name: "Book",
        fields: [
          {
            name: "price",
            type: "BigDecimal",
            required: false
          },
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
      "public BigDecimal getPrice()"
    );

    expect(result).toContain(
      "public void setPrice(BigDecimal price)"
    );

    expect(result).toContain(
      "public LocalDate getPublishedAt()"
    );

    expect(result).toContain(
      "public void setPublishedAt(LocalDate publishedAt)"
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
