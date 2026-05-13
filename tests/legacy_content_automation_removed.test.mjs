import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";

async function exists(path) {
  try {
    await access(new URL(path, import.meta.url), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

test("legacy scheduled Xiaohongshu content automation is removed", async () => {
  assert.equal(await exists("../scripts/xhs_content_automation.mjs"), false);
  assert.equal(await exists("./xhs_content_automation.test.mjs"), false);

  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal("generate:xhs" in packageJson.scripts, false);

  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
  assert.doesNotMatch(readme, /GitHub Actions workflow that generates Xiaohongshu/);
  assert.doesNotMatch(readme, /XHS Content Automation/);
  assert.doesNotMatch(readme, /Secrets Smoke Test/);
});
