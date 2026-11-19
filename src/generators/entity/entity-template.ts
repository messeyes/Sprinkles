import type {
  EntityDefinition,
  FieldType
} from "../../types/entity-definition.js";

import {
  validateEntityDefinition
} from "../../utils/validate-entity-definition.js";

const JAVA_TYPES: Record<FieldType, string> = {
  String: "String",
  Integer: "Integer",
  Long: "Long",
  Boolean: "Boolean",
  BigDecimal: "BigDecimal",
  LocalDate: "LocalDate"
};

export function createEntityTemplate(
  definition: EntityDefinition,
  packageName: string
): string {
  validateEntityDefinition(definition);

  const imports = new Set([
    "jakarta.persistence.Entity",
    "jakarta.persistence.GeneratedValue",
    "jakarta.persistence.GenerationType",
    "jakarta.persistence.Id"
  ]);

  for (const field of definition.fields) {
    if (field.type === "BigDecimal") {
      imports.add("java.math.BigDecimal");
    }

    if (field.type === "LocalDate") {
      imports.add("java.time.LocalDate");
    }

    if (field.required) {
      imports.add("jakarta.persistence.Column");
    }
  }

  const importStatements = [...imports]
    .sort()
    .map((item) => `import ${item};`)
    .join("\n");

  const fields = definition.fields
    .map((field) => {
      const type = JAVA_TYPES[field.type];

      const annotation = field.required
        ? "    @Column(nullable = false)\n"
        : "";

      return `${annotation}    private ${type} ${field.name};`;
    })
    .join("\n\n");

  return `package ${packageName}.entity;

${importStatements}

@Entity
public class ${definition.name} {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

${fields}

    public ${definition.name}() {
    }
}
`;
}
    