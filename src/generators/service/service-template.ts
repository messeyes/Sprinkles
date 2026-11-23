import type { EntityDefinition } from "../../types/entity-definition.js";

import {
  validateEntityDefinition
} from "../../utils/validate-entity-definition.js";

export function createServiceTemplate(
  definition: EntityDefinition,
  packageName: string
): string {
  validateEntityDefinition(definition);

  const name = definition.name;

  const setters = definition.fields
    .map((field) => {
      const capitalizedName =
        field.name.charAt(0).toUpperCase() +
        field.name.slice(1);

      return `        entity.set${capitalizedName}(request.${field.name}());`;
    })
    .join("\n");

  const responseFields = [
    "savedEntity.getId()",
    ...definition.fields.map((field) => {
      const capitalizedName =
        field.name.charAt(0).toUpperCase() +
        field.name.slice(1);

      return `savedEntity.get${capitalizedName}()`;
    })
  ].join(",\n            ");

  return [
    `package ${packageName}.service;`,
    "",
    `import ${packageName}.entity.${name};`,
    `import ${packageName}.repository.${name}Repository;`,
    `import ${packageName}.dto.${name}Request;`,
    `import ${packageName}.dto.${name}Response;`,
    "import org.springframework.stereotype.Service;",
    "",
    "@Service",
    `public class ${name}Service {`,
    "",
    `    private final ${name}Repository repository;`,
    "",
    `    public ${name}Service(${name}Repository repository) {`,
    "        this.repository = repository;",
    "    }",
    "",
    `    public ${name}Response create(${name}Request request) {`,
    `        ${name} entity = new ${name}();`,
    "",
    setters,
    "",
    `        ${name} savedEntity = repository.save(entity);`,
    "",
    `        return new ${name}Response(`,
    `            ${responseFields}`,
    "        );",
    "    }",
    "}",
    ""
  ].join("\n");
}
