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
assert.match(html, /<script src="\.\/app\.js" defer><\/script>/, "app script should run as a classic deferred script for file:// usage");
assert.doesNotMatch(html, /type="module"/, "file:// usage should not depend on module scripts");
assert.match(html, /preview-board/, "relationship map should be redesigned as a top preview board");
assert.doesNotMatch(html, /side-panel/, "relationship map should not sit in a right sidebar");
assert.match(appJs, /selected === type \? " selected" : ""/, "selected answers should get a visible selected class");
assert.doesNotMatch(appJs, /边界感练习包/, "report should not include backend product upsell text yet");
assert.doesNotMatch(appJs, /locked-note/, "report should not include the old product upsell note");
assert.match(appJs, /relationshipFocus/, "report should include more detailed relationship focus text");
assert.match(appJs, /boundaryPractice/, "report should include more detailed boundary practice text");
assert.match(css, /@media \(max-width: 760px\)/, "missing mobile breakpoint");
assert.match(css, /@media \(min-width: 1024px\)/, "missing desktop breakpoint");
assert.doesNotMatch(css, /\.side-panel/, "CSS should not keep the old right sidebar layout");

console.log("Web app validation passed.");
