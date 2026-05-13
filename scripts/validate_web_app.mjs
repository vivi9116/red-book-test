import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const appJs = await readFile(new URL("../web/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../web/index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../web/styles.css", import.meta.url), "utf8");
const worker = await readFile(new URL("../workers/redeem-worker.js", import.meta.url), "utf8");
const pagesWorkflow = await readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8");

const questionCount = (appJs.match(/\bid:\s*\d+/g) || []).length;
assert.equal(questionCount, 36, "paid test should include 36 questions");

for (const type of ["conflict", "sacrifice", "emotion", "needed", "selfBlame", "sensitive"]) {
  assert.match(appJs, new RegExp(`key:\\s*"${type}"`), `missing result type ${type}`);
}

assert.match(appJs, /function calculateReport/, "missing scoring function");
assert.match(appJs, /function renderRedeem/, "missing redeem-code gate");
assert.match(appJs, /function redeemCode/, "missing redeem-code request flow");
assert.match(appJs, /localStorage/, "redeemed access should persist for the same browser");
assert.match(appJs, /ACCESS_STORAGE_KEY/, "missing stable local access storage key");
assert.match(appJs, /XHS_REDEEM_CONFIG/, "missing redeem API configuration hook");
assert.doesNotMatch(appJs, /redeem-hint/, "formal redeem screen should not show local preview hint text");
assert.doesNotMatch(css, /\.redeem-hint/, "formal styles should not keep local preview hint styling");
assert.match(appJs, /function renderQuestion/, "missing question renderer");
assert.match(html, /viewport/, "missing responsive viewport meta");
assert.match(html, /<script src="\.\/config\.js"><\/script>\s*<script src="\.\/app\.js" defer><\/script>/, "config script should load before the app");
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
assert.match(css, /\.redeem-card/, "missing redeem-code screen styling");
assert.match(worker, /REDEEM_CODES/, "redeem worker should use the REDEEM_CODES KV namespace");
assert.match(worker, /status:\s*"used"/, "redeem worker should mark codes as used");
assert.match(worker, /accessToken/, "redeem worker should return an access token");
assert.match(pagesWorkflow, /github-pages/, "missing GitHub Pages deployment environment");
assert.match(pagesWorkflow, /REDEEM_API_URL/, "Pages deployment should generate config from REDEEM_API_URL");

console.log("Web app validation passed.");
