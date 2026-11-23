import type {
  EntityDefinition
} from "../../types/entity-definition.js";

import {
  validateEntityDefinition
} from "../../utils/validate-entity-definition.js";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function createFieldSetters(
  definition: EntityDefinition
): string {
  return definition.fields
    .map((field) => {
      return `        entity.set${capitalize(field.name)}(request.${field.name}());`;
    })
    .join("\n");
}

export function createServiceTemplate(
  definition: EntityDefinition,
  packageName: string
): string {
  validateEntityDefinition(definition);

  const name = definition.name;

  const setters = createFieldSetters(definition);

  const responseFields = [
    "entity.getId()",
    ...definition.fields.map((field) => {
      return `entity.get${capitalize(field.name)}()`;
    })
  ].join(",\n            ");

  return `package ${packageName}.service;

import ${packageName}.entity.${name};
import ${packageName}.repository.${name}Repository;
import ${packageName}.dto.${name}Request;
import ${packageName}.dto.${name}Response;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ${name}Service {

    private final ${name}Repository repository;

    public ${name}Service(${name}Repository repository) {
        this.repository = repository;
    }

    public ${name}Response create(${name}Request request) {
        ${name} entity = new ${name}();

${setters}

        ${name} savedEntity = repository.save(entity);

        return toResponse(savedEntity);
    }

    public List<${name}Response> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ${name}Response findById(Long id) {
        ${name} entity = repository.findById(id)
                .orElseThrow(() ->
                    new NoSuchElementException("${name} not found: " + id)
                );

        return toResponse(entity);
    }

    public ${name}Response update(Long id, ${name}Request request) {
        ${name} entity = repository.findById(id)
                .orElseThrow(() ->
                    new NoSuchElementException("${name} not found: " + id)
                );

${setters}

        ${name} updatedEntity = repository.save(entity);

        return toResponse(updatedEntity);
    }

    public void delete(Long id) {
        ${name} entity = repository.findById(id)
                .orElseThrow(() ->
                    new NoSuchElementException("${name} not found: " + id)
                );

        repository.delete(entity);
    }

    private ${name}Response toResponse(${name} entity) {
        return new ${name}Response(
            ${responseFields}
        );
    }
}
`;
}
