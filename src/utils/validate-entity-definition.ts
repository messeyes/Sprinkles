import type {
  EntityDefinition,
  FieldType
} from "../types/entity-definition.js";

const SUPPORTED_TYPES: FieldType[] = [
  "String",
  "Integer",
  "Long",
  "Boolean",
  "BigDecimal",
  "LocalDate"
];

const JAVA_IDENTIFIER = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

const JAVA_KEYWORDS = new Set([
  "abstract", "assert", "boolean", "break",
  "byte", "case", "catch", "char", "class",
  "const", "continue", "default", "do",
  "double", "else", "enum", "extends",
  "final", "finally", "float", "for",
  "goto", "if", "implements", "import",
  "instanceof", "int", "interface", "long",
  "native", "new", "package", "private",
  "protected", "public", "return", "short",
  "static", "strictfp", "super", "switch",
  "synchronized", "this", "throw", "throws",
  "transient", "try", "void", "volatile",
  "while", "_", "true", "false", "null",
  "var", "record", "sealed", "permits",
  "yield"
]);

function isValidJavaIdentifier(name: string): boolean {
  return (
    JAVA_IDENTIFIER.test(name) &&
    !JAVA_KEYWORDS.has(name)
  );
}

export function validateEntityDefinition(
  definition: EntityDefinition
): void {
  if (!isValidJavaIdentifier(definition.name)) {
    throw new Error(
      `Invalid entity name: ${definition.name}`
    );
  }

  if (!/^[A-Z]/.test(definition.name)) {
    throw new Error(
      "Entity name must start with an uppercase letter."
    );
  }

  if (definition.fields.length === 0) {
    throw new Error(
      "Entity must have at least one field."
    );
  }

  const fieldNames = new Set<string>();

  for (const field of definition.fields) {
    if (!isValidJavaIdentifier(field.name)) {
      throw new Error(
        `Invalid field name: ${field.name}`
      );
    }

    if (!/^[a-z]/.test(field.name)) {
      throw new Error(
        `Field name must start with a lowercase letter: ${field.name}`
      );
    }

    if (field.name === "id") {
      throw new Error(
        'Field "id" is generated automatically.'
      );
    }

    if (fieldNames.has(field.name)) {
      throw new Error(
        `Duplicate field name: ${field.name}`
      );
    }

    if (!SUPPORTED_TYPES.includes(field.type)) {
      throw new Error(
        `Unsupported field type: ${field.type}`
      );
    }

    if (typeof field.required !== "boolean") {
      throw new Error(
        `Invalid required value for field: ${field.name}`
      );
    }

    fieldNames.add(field.name);
  }
}
