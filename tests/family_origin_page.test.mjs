import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("family origin paid test has its own page, script, and visual theme", async () => {
  const html = await readFile(new URL("../web/family-origin-pattern.html", import.meta.url), "utf8");
  const js = await readFile(new URL("../web/family-origin-pattern.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../web/styles.css", import.meta.url), "utf8");

  assert.match(html, /原生家庭关系模式测试/);
  assert.match(html, /family-theme/);
  assert.match(html, /family-origin-pattern\.js/);
  assert.match(js, /const questions = \[/);
  assert.equal((js.match(/\bid:\s*\d+/g) || []).length, 24);
  for (const type of ["appease", "alert", "confirmation", "withdraw", "repair", "control"]) {
    assert.match(js, new RegExp(`key:\\s*"${type}"`), `missing result type ${type}`);
  }
  assert.match(css, /\.family-theme/);
  assert.match(css, /family memory map/);
});
