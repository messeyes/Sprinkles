import {
  mkdir,
  writeFile
} from "node:fs/promises";

import path from "node:path";

export function javaFilePath(
  sourcePath: string,
  subdirectory: string,
  fileName: string
): string {
  return path.join(
    sourcePath,
    subdirectory,
    fileName
  );
}

export async function writeJavaFile(
  filePath: string,
  content: string
): Promise<string> {
  await mkdir(path.dirname(filePath), {
    recursive: true
  });

  await writeFile(filePath, content, {
    encoding: "utf-8",
    flag: "wx"
  });

  return filePath;
}
