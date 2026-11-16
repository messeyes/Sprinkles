import {
  checkbox,
  input,
  select,
  Separator
} from "@inquirer/prompts";

import type {
  SpringDependency,
  SpringDependencyGroup
} from "../types/spring-dependency.js";

type DependencyAction =
  | "search"
  | "browse"
  | "review"
  | "finish";

export function searchDependencies(
  groups: SpringDependencyGroup[],
  query: string
): SpringDependencyGroup[] {
  const term = query.trim().toLowerCase();

  return groups
    .map((group) => ({
      ...group,
      values: group.values.filter((dependency) => {
        const content = [
          dependency.name,
          dependency.id,
          dependency.description ?? ""
        ].join(" ").toLowerCase();

        return content.includes(term);
      })
    }))
    .filter((group) => group.values.length > 0);
}

export function getDependencyNames(
  groups: SpringDependencyGroup[],
  selectedIds: string[]
): string[] {
  const dependencies = groups.flatMap(
    (group) => group.values
  );

  return selectedIds.map((id) => {
    const dependency = dependencies.find(
      (item) => item.id === id
    );

    return dependency?.name ?? id;
  });
}

async function selectDependencies(
  groups: SpringDependencyGroup[],
  selectedIds: string[]
): Promise<string[]> {
  const choices = groups.flatMap((group) => [
    new Separator(`--- ${group.name} ---`),

    ...group.values.map((dependency) => ({
      name: dependency.name,
      value: dependency.id,
      checked: selectedIds.includes(dependency.id),
      ...(dependency.description !== undefined && {
        description: dependency.description
      })
    }))
  ]);

  const visibleIds = new Set(
    groups.flatMap((group) =>
      group.values.map((dependency) => dependency.id)
    )
  );

  const result = await checkbox<string>({
    message: "Select dependencies:",
    choices,
    pageSize: 15
  });

  // Preserve selections outside the current search.
  const preserved = selectedIds.filter(
    (id) => !visibleIds.has(id)
  );

  return [...new Set([...preserved, ...result])];
}

export async function askDependencies(
  groups: SpringDependencyGroup[],
  initialSelection: string[] = []
): Promise<string[]> {
  let selectedIds = [...initialSelection];

  while (true) {
    console.log(
      `\nSelected dependencies: ${selectedIds.length}`
    );

    const action = await select<DependencyAction>({
      message: "Manage dependencies:",
      choices: [
        {
          name: "Search dependencies",
          value: "search"
        },
        {
          name: "Browse by category",
          value: "browse"
        },
        {
          name: "Review selected dependencies",
          value: "review"
        },
        {
          name: "Finish selection",
          value: "finish"
        }
      ]
    });

    if (action === "finish") {
      return selectedIds;
    }

    if (action === "review") {
      const names = getDependencyNames(
        groups,
        selectedIds
      );

      if (names.length === 0) {
        console.log("No dependencies selected.");
      } else {
        console.log("\nSelected dependencies:");

        names.forEach((name) => {
          console.log(`  - ${name}`);
        });
      }

      continue;
    }

    if (action === "search") {
      const query = await input({
        message: "Search by name or description:",
        validate: (value) =>
          value.trim().length > 0 ||
          "Enter a search term."
      });

      const results = searchDependencies(groups, query);

      if (results.length === 0) {
        console.log("No matching dependencies found.");
        continue;
      }

      selectedIds = await selectDependencies(
        results,
        selectedIds
      );

      continue;
    }

    if (action === "browse") {
      const category = await select<string>({
        message: "Choose a category:",
        choices: groups.map((group, index) => ({
          name: group.name,
          value: String(index)
        }))
      });

      const group = groups[Number(category)];

      if (!group) {
        throw new Error("Invalid dependency category.");
      }

      selectedIds = await selectDependencies(
        [group],
        selectedIds
      );
    }
  }
}
