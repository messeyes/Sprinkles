export interface SpringDependency {
  id: string;
  name: string;
  description?: string;
  versionRange?: string;
}

export interface SpringDependencyGroup {
  name: string;
  values: SpringDependency[];
}