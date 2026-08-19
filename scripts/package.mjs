import { cp, mkdir, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extensionDir = path.join(root, "extension");
const distDir = path.join(root, "dist");
const output = path.join(distDir, "douban-movie-enhancer-1.0.0.zip");
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "douban-movie-enhancer-"));
const stagedExtension = path.join(temporaryRoot, "package");

try {
  await mkdir(distDir, { recursive: true });
  await rm(output, { force: true });
  await cp(extensionDir, stagedExtension, { recursive: true });

  const result = spawnSync("zip", ["-q", "-r", output, "."], {
    cwd: stagedExtension,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "zip failed");
  }

  console.log(path.relative(root, output));
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
