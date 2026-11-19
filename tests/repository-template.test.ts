import {
  describe,
  expect,
  it
} from "vitest";

import {
  createRepositoryTemplate
} from "../src/generators/repository/repository-template.js";

describe("createRepositoryTemplate", () => {
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

  it("should generate a Spring Data JPA repository", () => {
    const result = createRepositoryTemplate(
      definition,
      "com.example.demo"
    );

    expect(result).toContain(
      "package com.example.demo.repository;"
    );

    expect(result).toContain(
      "import com.example.demo.entity.Book;"
    );

    expect(result).toContain(
      "import org.springframework.data.jpa.repository.JpaRepository;"
    );

    expect(result).toContain(
      "public interface BookRepository extends JpaRepository<Book, Long>"
    );
  });

  it("should reject invalid entity definitions", () => {
    expect(() =>
      createRepositoryTemplate(
        {
          name: "book",
          fields: definition.fields
        },
        "com.example.demo"
      )
    ).toThrow();
  });
});
