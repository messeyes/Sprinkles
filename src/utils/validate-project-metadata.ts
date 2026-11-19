const JAVA_RESERVED_WORDS = new Set([
  "abstract",
  "assert",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "const",
  "continue",
  "default",
  "do",
  "double",
  "else",
  "enum",
  "extends",
  "final",
  "finally",
  "float",
  "for",
  "goto",
  "if",
  "implements",
  "import",
  "instanceof",
  "int",
  "interface",
  "long",
  "native",
  "new",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "short",
  "static",
  "strictfp",
  "super",
  "switch",
  "synchronized",
  "this",
  "throw",
  "throws",
  "transient",
  "try",
  "void",
  "volatile",
  "while",
  "_",
  "true",
  "false",
  "null",
  "var",
  "record",
  "sealed",
  "permits",
  "yield",
  "exports",
  "module",
  "open",
  "opens",
  "provides",
  "requires",
  "to",
  "transitive",
  "uses",
  "with"
]);

function isValidPackageSegment(
  segment: string
): boolean {
  return (
    /^[a-z_][a-z0-9_]*$/.test(segment) &&
    !JAVA_RESERVED_WORDS.has(segment)
  );
}

export function validateGroupId(
  value: string
): boolean {
  return /^(?:[a-zA-Z_][a-zA-Z0-9_]*\.)+[a-zA-Z_][a-zA-Z0-9_]*$/.test(
    value
  );
}

export function validateArtifactId(
  value: string
): boolean {
  return /^[a-z][a-z0-9-]*$/.test(value);
}

export function validatePackageName(
  value: string
): boolean {
  return value
    .split(".")
    .every(isValidPackageSegment);
}

export function getDefaultPackageName(
  groupId: string,
  artifactId: string
): string {
  const normalizedArtifact = artifactId
    .replace(/-/g, "")
    .toLowerCase();

  return `${groupId.toLowerCase()}.${normalizedArtifact}`;
}
