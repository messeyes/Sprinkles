import {
  describe,
  expect,
  it
} from "vitest";

import {
  createControllerTemplate
} from "../src/generators/controller/controller-template.js";

describe("createControllerTemplate", () => {
  const definition = {
    name: "Book",
    fields: [
      {
        name: "title",
        type: "String" as const,
        required: true
      }
    ]
  };

  it("generates a REST controller", () => {
    const result = createControllerTemplate(
      definition,
      "com.example.demo"
    );

    expect(result).toContain(
      "package com.example.demo.controller;"
    );

    expect(result).toContain("@RestController");

    expect(result).toContain(
      '@RequestMapping("/api/books")'
    );

    expect(result).toContain(
      "public class BookController"
    );
  });

  it("uses constructor injection", () => {
    const result = createControllerTemplate(
      definition,
      "com.example.demo"
    );

    expect(result).toContain(
      "private final BookService service;"
    );

    expect(result).toContain(
      "public BookController(BookService service)"
    );
  });

  it("generates a POST endpoint", () => {
    const result = createControllerTemplate(
      definition,
      "com.example.demo"
    );

    expect(result).toContain("@PostMapping");

    expect(result).toContain(
      "service.create(request)"
    );

    expect(result).toContain(
      "HttpStatus.CREATED"
    );
  });

  it("generates GET endpoints", () => {
    const result = createControllerTemplate(
      definition,
      "com.example.demo"
    );

    expect(result).toContain("@GetMapping");

    expect(result).toContain(
      '@GetMapping("/{id}")'
    );

    expect(result).toContain(
      "service.findAll()"
    );

    expect(result).toContain(
      "service.findById(id)"
    );
  });

  it("generates a PUT endpoint", () => {
    const result = createControllerTemplate(
      definition,
      "com.example.demo"
    );

    expect(result).toContain(
      '@PutMapping("/{id}")'
    );

    expect(result).toContain(
      "service.update(id, request)"
    );
  });

  it("generates a DELETE endpoint", () => {
    const result = createControllerTemplate(
      definition,
      "com.example.demo"
    );

    expect(result).toContain(
      '@DeleteMapping("/{id}")'
    );

    expect(result).toContain(
      "service.delete(id)"
    );

    expect(result).toContain(
      "ResponseEntity.noContent().build()"
    );
  });

  it("handles resources that do not exist", () => {
    const result = createControllerTemplate(
      definition,
      "com.example.demo"
    );

    expect(result).toContain(
      "@ExceptionHandler(NoSuchElementException.class)"
    );

    expect(result).toContain(
      "ResponseEntity.notFound().build()"
    );
  });

  it("pluralizes resource names", () => {
    const result = createControllerTemplate(
      {
        name: "Category",
        fields: definition.fields
      },
      "com.example.demo"
    );

    expect(result).toContain(
      '@RequestMapping("/api/categories")'
    );
  });

  it("rejects invalid entity definitions", () => {
    expect(() =>
      createControllerTemplate(
        {
          name: "book",
          fields: definition.fields
        },
        "com.example.demo"
      )
    ).toThrow();
  });
});
