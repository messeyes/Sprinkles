import {
  input,
  select,
  confirm
} from "@inquirer/prompts";

import type {
  EntityDefinition,
  EntityField,
  FieldType
} from "../../types/entity-definition.js";

import {
  validateEntityDefinition
} from "../../utils/validate-entity-definition.js";

const FIELD_TYPES: FieldType[] = [
  "String",
  "Integer",
  "Long",
  "Boolean",
  "BigDecimal",
  "LocalDate"
];

function validateFieldName(
  name: string,
  fields: EntityField[]
): string | true {
  const trimmedName = name.trim();

  if (!/^[a-z][a-zA-Z0-9]*$/.test(trimmedName)) {
    return "Field name must be a valid camelCase identifier.";
  }

  if (trimmedName === "id") {
    return 'Field "id" is generated automatically.';
  }

  if (fields.some((field) => field.name === trimmedName)) {
    return "A field with this name already exists.";
  }

  try {
    validateEntityDefinition({
      name: "Example",
      fields: [{
        name: trimmedName,
        type: "String",
        required: false
      }]
    });

    return true;
  } catch (error) {
    return error instanceof Error
      ? error.message
      : "Invalid field name.";
  }
}

export async function askEntityFields(
  entityName: string
): Promise<EntityDefinition> {
  const fields: EntityField[] = [];

  console.log(`\nConfiguring entity: ${entityName}`);

  let addAnotherField = true;

  while (addAnotherField) {
    const name = await input({
      message: "Field name:",
      validate: (value) =>
        validateFieldName(value, fields)
    });

    const type = await select<FieldType>({
      message: `Choose the type for "${name}":`,
      choices: FIELD_TYPES.map((fieldType) => ({
        name: fieldType,
        value: fieldType
      }))
    });

    const required = await confirm({
      message: `Is "${name}" required?`,
      default: false
    });

    fields.push({
      name: name.trim(),
      type,
      required
    });

    console.log(`\nFields added: ${fields.length}`);

    addAnotherField = await confirm({
      message: "Add another field?",
      default: true
    });
  }

  const definition: EntityDefinition = {
    name: entityName,
    fields
  };

  validateEntityDefinition(definition);

  return definition;
}
