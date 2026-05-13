import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const assetRoot = new URL("../assets/xiaohongshu/pleasing-personality-depth/", import.meta.url);
const familyAssetRoot = new URL("../assets/xiaohongshu/family-origin-pattern/", import.meta.url);

test("current paid test has a fixed Xiaohongshu asset output folder", async () => {
  const readme = await readFile(new URL("README.md", assetRoot), "utf8");
  const coverPrompt = await readFile(new URL("cover-prompt.md", assetRoot), "utf8");
  const longCopy = await readFile(new URL("long-copy.md", assetRoot), "utf8");

  assert.match(readme, /讨好型人格深度测试/);
  assert.match(readme, /cover\.png/);
  assert.match(readme, /long-copy\.md/);
  assert.match(coverPrompt, /小红书原生测试封面风/);
  assert.match(coverPrompt, /不要真人写实孤独照片/);
  assert.match(longCopy, /那我是哪一种/);
  assert.match(longCopy, /不是给你贴标签/);
});

test("paid test landing uses redeem for new buyers and intro for stored access", async () => {
  const html = await readFile(new URL("../web/index.html", import.meta.url), "utf8");
  const css = await readFile(new URL("../web/styles.css", import.meta.url), "utf8");
  const app = await readFile(new URL("../web/app.js", import.meta.url), "utf8");

  assert.ok(html.indexOf("test-panel") < html.indexOf("preview-board"), "redeem/test panel should render before report preview");
  assert.match(app, /验证兑换码/);
  assert.match(app, /screen:\s*readStoredAccess\(\)\s*\?\s*"intro"\s*:\s*"redeem"/);
  assert.match(html, /你最容易讨好的关系/);
  assert.match(html, /你不敢拒绝的原因/);
  assert.match(html, /你在关系里牺牲了什么/);
  assert.match(html, /你的边界练习起点/);
  assert.match(css, /width:\s*min\(720px,\s*100%\)/);
  assert.match(css, /sticker-note/);
  assert.match(css, /deco-heart/);
  assert.match(css, /tape/);
});

test("family origin paid test has Xiaohongshu cover and long-copy sources", async () => {
  const readme = await readFile(new URL("README.md", familyAssetRoot), "utf8");
  const coverPrompt = await readFile(new URL("cover-prompt.md", familyAssetRoot), "utf8");
  const longCopy = await readFile(new URL("long-copy.md", familyAssetRoot), "utf8");

  assert.match(readme, /原生家庭关系模式测试/);
  assert.match(coverPrompt, /小红书原生测试封面风/);
  assert.match(coverPrompt, /不要真人写实孤独照片/);
  assert.match(longCopy, /那我是哪一种关系脚本/);
  assert.match(longCopy, /不是为了责怪父母/);
});
