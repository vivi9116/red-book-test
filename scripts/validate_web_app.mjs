import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const appJs = await readFile(new URL("../web/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../web/index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../web/styles.css", import.meta.url), "utf8");

const questionCount = (appJs.match(/\bid:\s*\d+/g) || []).length;
assert.equal(questionCount, 36, "paid test should include 36 questions");

for (const type of ["conflict", "sacrifice", "emotion", "needed", "selfBlame", "sensitive"]) {
  assert.match(appJs, new RegExp(`key:\\s*"${type}"`), `missing result type ${type}`);
}

assert.match(appJs, /function calculateReport/, "missing scoring function");
assert.match(appJs, /function renderQuestion/, "missing question renderer");
assert.match(html, /viewport/, "missing responsive viewport meta");
assert.match(css, /@media \(max-width: 760px\)/, "missing mobile breakpoint");
assert.match(css, /@media \(min-width: 1024px\)/, "missing desktop breakpoint");

console.log("Web app validation passed.");
