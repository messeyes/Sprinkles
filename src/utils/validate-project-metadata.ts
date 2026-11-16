export function validateGroupId(value: string): boolean {
  return /^(?:[a-zA-Z_][a-zA-Z0-9_]*\.)+[a-zA-Z_][a-zA-Z0-9_]*$/.test(
    value
  );
}

export function validateArtifactId(value: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(value);
}

export function validatePackageName(value: string): boolean {
  return /^(?:[a-z_][a-z0-9_]*\.)*[a-z_][a-z0-9_]*$/.test(
    value
  );
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
