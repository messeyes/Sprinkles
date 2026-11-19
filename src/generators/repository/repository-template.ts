import type {
  EntityDefinition
} from "../../types/entity-definition.js";

import {
  validateEntityDefinition
} from "../../utils/validate-entity-definition.js";

export function createRepositoryTemplate(
  definition: EntityDefinition,
  packageName: string
): string {
  validateEntityDefinition(definition);

  const entityName = definition.name;
  const repositoryName = `${entityName}Repository`;

  return `package ${packageName}.repository;

import ${packageName}.entity.${entityName};
import org.springframework.data.jpa.repository.JpaRepository;

public interface ${repositoryName} extends JpaRepository<${entityName}, Long> {
}
`;
}
