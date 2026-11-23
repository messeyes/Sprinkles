import type {
  EntityDefinition
} from "../../types/entity-definition.js";

import {
  validateEntityDefinition
} from "../../utils/validate-entity-definition.js";

function createResourcePath(name: string): string {
  const lowercaseName =
    name.charAt(0).toLowerCase() + name.slice(1);

  if (lowercaseName.endsWith("y")) {
    return `${lowercaseName.slice(0, -1)}ies`;
  }

  if (
    lowercaseName.endsWith("s") ||
    lowercaseName.endsWith("x") ||
    lowercaseName.endsWith("ch") ||
    lowercaseName.endsWith("sh")
  ) {
    return `${lowercaseName}es`;
  }

  return `${lowercaseName}s`;
}

export function createControllerTemplate(
  definition: EntityDefinition,
  packageName: string
): string {
  validateEntityDefinition(definition);

  const name = definition.name;
  const resourcePath = createResourcePath(name);

  return `package ${packageName}.controller;

import ${packageName}.dto.${name}Request;
import ${packageName}.dto.${name}Response;
import ${packageName}.service.${name}Service;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/${resourcePath}")
public class ${name}Controller {

    private final ${name}Service service;

    public ${name}Controller(${name}Service service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<${name}Response> create(
            @RequestBody ${name}Request request
    ) {
        ${name}Response response = service.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<${name}Response>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<${name}Response> findById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<${name}Response> update(
            @PathVariable Long id,
            @RequestBody ${name}Request request
    ) {
        return ResponseEntity.ok(
                service.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        service.delete(id);

        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Void> handleNotFound(
            NoSuchElementException exception
    ) {
        return ResponseEntity.notFound().build();
    }
}
`;
}
