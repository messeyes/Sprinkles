export type FieldType =
  | "String"
  | "Integer"
  | "Long"
  | "Boolean"
  | "BigDecimal"
  | "LocalDate";

export interface EntityField {
  name: string;
  type: FieldType;
  required: boolean;
}

export interface EntityDefinition {
  name: string;
  fields: EntityField[];
}
