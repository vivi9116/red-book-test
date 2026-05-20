import test from "node:test";
import assert from "node:assert/strict";
import { constants } from "node:fs";
import { access, readFile, stat } from "node:fs/promises";

import { boundaryPatternTest } from "../web/tests/boundary-pattern.js";
import { scoreTest, validateTestConfig } from "../web/test-engine.js";

async function readPngSize(path) {
  const file = await readFile(path);
  return {
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20),
  };
}

test("boundary pattern config defines a complete paid test", () => {
  assert.equal(boundaryPatternTest.id, "boundary-pattern");
  assert.equal(boundaryPatternTest.layoutVariant, "boundary-lines");
  assert.equal(boundaryPatternTest.questions.length, 36);
  assert.equal(boundaryPatternTest.resultTypes.length, 6);
  assert.equal(boundaryPatternTest.dimensions.length, 6);
  assert.ok(boundaryPatternTest.previewModules.length >= 4);
});

test("boundary pattern visual theme is distinct and content-specific", () => {
  assert.equal(boundaryPatternTest.theme.name, "red-line-journal");
  assert.notEqual(boundaryPatternTest.theme.colors.primary, "#d86f45");
  assert.notEqual(boundaryPatternTest.theme.colors.primary, "#8b6f47");
  assert.match(boundaryPatternTest.theme.motif, /boundary|door|ruler/i);
});

test("boundary pattern config passes validation", () => {
  assert.deepEqual(validateTestConfig(boundaryPatternTest), []);
});

test("boundary paid report includes deep customer-facing sections", () => {
  for (const type of boundaryPatternTest.resultTypes) {
    const detail = boundaryPatternTest.reportDetails[type.key];
    assert.ok(detail, `missing detail for ${type.key}`);
    assert.ok(detail.coreInsight.length >= 40);
    assert.equal(detail.sourceMap.length, 3);
    assert.equal(detail.relationshipPatterns.length, 3);
    assert.equal(detail.triggerScenes.length, 3);
    assert.equal(detail.actionPlan.length, 5);
  }
});

test("every boundary result type can be reached by at least one option", () => {
  const scoredKeys = new Set();

  for (const question of boundaryPatternTest.questions) {
    for (const option of question.options) {
      for (const key of Object.keys(option.scores)) {
        scoredKeys.add(key);
      }
    }
  }

  assert.deepEqual(
    [...scoredKeys].sort(),
    boundaryPatternTest.resultTypes.map((type) => type.key).sort(),
  );
});

test("boundary scoring returns primary, secondary, type scores, and dimensions", () => {
  const answers = Object.fromEntries(
    boundaryPatternTest.questions.map((question) => [question.id, question.options[0].id]),
  );

  const report = scoreTest(boundaryPatternTest, answers);

  assert.equal(report.primary.key, "over-giver");
  assert.equal(report.secondary.key, "guilt-softener");
  assert.equal(Object.keys(report.scores).length, 6);
  assert.equal(Object.keys(report.dimensions).length, 6);
});

test("static app registers boundary direct link and preview skin", async () => {
  const app = await readFile("web/app.js", "utf8");
  const css = await readFile("web/styles.css", "utf8");

  assert.match(app, /boundary-pattern/);
  assert.match(app, /boundary-lines/);
  assert.match(app, /boundary-lines-preview/);
  assert.match(app, /boundary-pattern\/cover\.png/);
  assert.match(app, /boundary-pattern\/long-image\.png/);
  assert.match(app, /boundary-theme/);
  assert.match(css, /\.boundary-lines-preview/);
  assert.match(css, /\.boundary-photo/);
  assert.match(css, /\.boundary-scrap-note/);
  assert.match(css, /\.boundary-theme/);
});

test("boundary xiaohongshu assets are publication-ready without prompt drafts", async () => {
  const coverCopy = await readFile("web/assets/boundary-pattern/cover-copy.md", "utf8");
  const longCopy = await readFile("web/assets/boundary-pattern/long-copy.md", "utf8");
  const cover = await stat("web/assets/boundary-pattern/cover.png");
  const longImage = await stat("web/assets/boundary-pattern/long-image.png");

  assert.match(coverCopy, /封面图标题/);
  assert.match(coverCopy, /小红书发布标题/);
  assert.match(coverCopy, /标签/);
  assert.match(longCopy, /小红书发布标题/);
  assert.match(longCopy, /不是让你变得不好相处/);
  assert.match(longCopy, /标签/);
  assert.ok(cover.size > 100_000);
  assert.ok(longImage.size > 100_000);
  assert.deepEqual(await readPngSize("web/assets/boundary-pattern/cover.png"), {
    width: 1080,
    height: 1440,
  });
  assert.deepEqual(await readPngSize("web/assets/boundary-pattern/long-image.png"), {
    width: 1080,
    height: 1440,
  });
  await assert.rejects(() => access("web/assets/boundary-pattern/cover-prompt.md", constants.F_OK));
  await assert.rejects(() => access("web/assets/boundary-pattern/long-image-prompt.md", constants.F_OK));
});
