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
    "return toResponse(savedEntity);"
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

    it("generates a findAll method", () => {
    const result = createServiceTemplate(
        definition,
        "com.example.demo"
    );

    expect(result).toContain(
        "public List<BookResponse> findAll()"
    );

    expect(result).toContain(
        "repository.findAll()"
    );

    expect(result).toContain(
        ".map(this::toResponse)"
    );
    });

    it("generates a findById method", () => {
    const result = createServiceTemplate(
        definition,
        "com.example.demo"
    );

    expect(result).toContain(
        "public BookResponse findById(Long id)"
    );

    expect(result).toContain(
        "repository.findById(id)"
    );

    expect(result).toContain(
        'new NoSuchElementException("Book not found: " + id)'
    );
    });

    it("generates a reusable response mapper", () => {
    const result = createServiceTemplate(
        definition,
        "com.example.demo"
    );

    expect(result).toContain(
        "private BookResponse toResponse(Book entity)"
    );

    expect(result).toContain(
        "entity.getId()"
    );

    expect(result).toContain(
        "entity.getTitle()"
    );

    expect(result).toContain(
        "entity.getAuthor()"
    );
    });
});
