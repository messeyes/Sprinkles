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

export function createDtoTemplate(
  definition: EntityDefinition,
  packageName: string
): string {
  validateEntityDefinition(definition);

  const imports = new Set<string>();

  for (const field of definition.fields) {
    if (field.type === "BigDecimal") {
      imports.add("java.math.BigDecimal");
    }

    if (field.type === "LocalDate") {
      imports.add("java.time.LocalDate");
    }
  }

  const importStatements = [...imports]
    .sort()
    .map((item) => `import ${item};`)
    .join("\n");

  const fields = definition.fields
    .map((field) => {
      const javaType = JAVA_TYPES[field.type];

      return `    ${javaType} ${field.name}`;
    })
    .join(",\n");

  return [
    `package ${packageName}.dto;`,
    "",
    ...(importStatements ? [importStatements, ""] : []),
    `public record ${definition.name}Request(`,
    fields,
    ") {}",
    ""
  ].join("\n");
}
