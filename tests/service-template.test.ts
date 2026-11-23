import {
  describe,
  expect,
  it
} from "vitest";

import {
  createServiceTemplate
} from "../src/generators/service/service-template.js";

describe("createServiceTemplate", () => {
  const definition = {
    name: "Book",
    fields: [
      {
        name: "title",
        type: "String" as const,
        required: true
      },
      {
        name: "author",
        type: "String" as const,
        required: true
      }
    ]
  };

  it("generates a Spring service", () => {
    const result = createServiceTemplate(
      definition,
      "com.example.demo"
    );

    expect(result).toContain(
      "package com.example.demo.service;"
    );

    expect(result).toContain("@Service");
    expect(result).toContain("public class BookService");
  });

  it("uses constructor injection", () => {
    const result = createServiceTemplate(
      definition,
      "com.example.demo"
    );

    expect(result).toContain(
      "private final BookRepository repository;"
    );

    expect(result).toContain(
      "public BookService(BookRepository repository)"
    );
  });

  it("maps request fields to the entity", () => {
    const result = createServiceTemplate(
      definition,
      "com.example.demo"
    );

    expect(result).toContain(
      "entity.setTitle(request.title());"
    );

    expect(result).toContain(
      "entity.setAuthor(request.author());"
    );
  });

  it("saves the entity and returns a response DTO", () => {
    const result = createServiceTemplate(
      definition,
      "com.example.demo"
    );

    expect(result).toContain(
      "repository.save(entity)"
    );

    expect(result).toContain(
      "savedEntity.getId()"
    );

    expect(result).toContain(
      "savedEntity.getTitle()"
    );

    expect(result).toContain(
      "savedEntity.getAuthor()"
    );
  });

  it("rejects invalid entity definitions", () => {
    expect(() =>
      createServiceTemplate(
        {
          name: "book",
          fields: definition.fields
        },
        "com.example.demo"
      )
    ).toThrow();
  });
});
