import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const assetRoot = new URL("../assets/xiaohongshu/pleasing-personality-depth/", import.meta.url);

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
