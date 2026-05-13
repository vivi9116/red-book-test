import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const appJs = await readFile(new URL("../web/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../web/index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../web/styles.css", import.meta.url), "utf8");
const config = await readFile(new URL("../web/config.js", import.meta.url), "utf8");
const vercelConfig = await readFile(new URL("../vercel.json", import.meta.url), "utf8");
const redeemApi = await readFile(new URL("../api/redeem.js", import.meta.url), "utf8");
const generateCodesApi = await readFile(new URL("../api/generate-codes.js", import.meta.url), "utf8");

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
assert.match(config, /apiUrl:\s*"\/api\/redeem"/, "Vercel deployment should use the same-origin redeem API");
assert.match(vercelConfig, /"source":\s*"\/api\/:path\*"/, "Vercel should route API requests to api functions");
assert.match(vercelConfig, /"destination":\s*"\/web\/\$1"/, "Vercel should serve the static paid test from web/");
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
assert.match(redeemApi, /NOTION_REDEEM_DATABASE_ID/, "redeem API should read the Notion redeem database id");
assert.match(redeemApi, /buildRedeemQuery/, "redeem API should query Notion by buyer code");
assert.match(redeemApi, /buildUsedProperties/, "redeem API should mark Notion codes as used");
assert.match(redeemApi, /accessToken/, "redeem API should return an access token");
assert.doesNotMatch(redeemApi, /testIdProperty|usedAtProperty|accessTokenProperty/, "redeem API should only require code and status Notion columns");
assert.match(generateCodesApi, /REDEEM_ADMIN_TOKEN/, "code generation API should require an admin token");
assert.match(generateCodesApi, /buildCreateCodePageBody/, "code generation API should create Notion rows");
assert.match(generateCodesApi, /generateRedeemCodes/, "code generation API should generate redeem codes");

console.log("Web app validation passed.");
