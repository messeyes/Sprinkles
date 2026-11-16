type VersionStage =
  | "SNAPSHOT"
  | "M"
  | "RC"
  | "RELEASE";

interface ParsedVersion {
  numbers: number[];
  stage: VersionStage;
  stageNumber: number;
}

const stageOrder: Record<VersionStage, number> = {
  SNAPSHOT: 0,
  M: 1,
  RC: 2,
  RELEASE: 3
};

function parseVersion(version: string): ParsedVersion {
  const normalized = version
    .replace(/\.RELEASE$/i, "")
    .replace(/\.BUILD-SNAPSHOT$/i, "-SNAPSHOT")
    .replace(/\.RC(\d+)$/i, "-RC$1")
    .replace(/\.M(\d+)$/i, "-M$1");

  const match = normalized.match(
    /^(\d+(?:\.\d+)*)(?:-(SNAPSHOT|M\d+|RC\d+))?$/i
  );

  if (!match) {
    throw new Error(`Invalid version: ${version}`);
  }

  const numbers = match[1]!.split(".").map(Number);
  const suffix = match[2]?.toUpperCase();

  if (!suffix) {
    return {
      numbers,
      stage: "RELEASE",
      stageNumber: 0
    };
  }

  if (suffix === "SNAPSHOT") {
    return {
      numbers,
      stage: "SNAPSHOT",
      stageNumber: 0
    };
  }

  const stage = suffix.startsWith("RC") ? "RC" : "M";

  return {
    numbers,
    stage,
    stageNumber: Number(
      suffix.slice(stage === "RC" ? 2 : 1)
    )
  };
}

export function compareVersions(
  a: string,
  b: string
): number {
  const left = parseVersion(a);
  const right = parseVersion(b);

  const length = Math.max(
    left.numbers.length,
    right.numbers.length
  );

  for (let i = 0; i < length; i++) {
    const difference =
      (left.numbers[i] ?? 0) -
      (right.numbers[i] ?? 0);

    if (difference !== 0) {
      return Math.sign(difference);
    }
  }

  const stageDifference =
    stageOrder[left.stage] - stageOrder[right.stage];

  if (stageDifference !== 0) {
    return Math.sign(stageDifference);
  }

  return Math.sign(
    left.stageNumber - right.stageNumber
  );
}
