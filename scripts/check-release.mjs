import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extensionDir = path.join(root, "extension");
const manifestPath = path.join(extensionDir, "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

assert.equal(manifest.manifest_version, 3);
assert.equal(manifest.name, "豆瓣选电影增强");
assert.equal(manifest.version, "1.0.0");
assert.equal(manifest.minimum_chrome_version, "111");
assert.equal("permissions" in manifest, false, "manifest must not request permissions");
assert.equal(
  "host_permissions" in manifest,
  false,
  "manifest must not request host permissions"
);
assert.equal("background" in manifest, false, "manifest must not add a background worker");
assert.deepEqual(manifest.content_scripts, [
  {
    matches: ["https://movie.douban.com/explore*"],
    js: ["content.js"],
    run_at: "document_start",
    world: "MAIN"
  }
]);

function readPngDimensions(buffer) {
  const signature = buffer.subarray(0, 8).toString("hex");
  assert.equal(signature, "89504e470d0a1a0a", "file must be a PNG");
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType: buffer[25]
  };
}

async function assertPng(relativePath, width, height, options = {}) {
  const filePath = path.join(root, relativePath);
  const dimensions = readPngDimensions(await readFile(filePath));
  assert.deepEqual(
    { width: dimensions.width, height: dimensions.height },
    { width, height },
    `${relativePath} dimensions`
  );

  if (options.requireAlpha) {
    assert.ok(
      dimensions.colorType === 4 || dimensions.colorType === 6,
      `${relativePath} must include an alpha channel`
    );
  }
}

for (const size of [16, 32, 48, 128]) {
  await assertPng(`extension/icons/icon-${size}.png`, size, size, {
    requireAlpha: true
  });
}

await assertPng("store/assets/promo-440x280.png", 440, 280);
await assertPng("store/screenshots/drama-filter-1280x800.png", 1280, 800);

for (const relativePath of [
  "LICENSE",
  "README.md",
  "PRIVACY.md",
  "VALIDATION.md",
  "store/listing-zh-CN.md",
  "store/assets/README.md",
  "extension/content.js"
]) {
  const metadata = await stat(path.join(root, relativePath));
  assert.equal(metadata.isFile(), true, `${relativePath} must exist`);
  assert.ok(metadata.size > 0, `${relativePath} must not be empty`);
}

console.log("Release checks passed.");
