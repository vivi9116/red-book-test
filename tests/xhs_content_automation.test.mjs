import test from "node:test";
import assert from "node:assert/strict";

import {
  extractDoubaoText,
  extractDoubaoImageData,
  extractJsonObject,
  extractGeminiImageData,
  extractGeminiText,
  normalizeProvider,
  notionPlainText,
  requestJson,
  safeSlug,
} from "../scripts/xhs_content_automation.mjs";

const sampleTitle = "\u4f60\u90a3\u4e48\u61c2\u4e8b\uff0c\u4e00\u5b9a\u5f88\u7d2f\u5427\uff1f";
const sampleTest = "\u8868\u6f14\u578b\u8ba8\u597d\u6d4b\u8bd5";
const samplePain = "\u5bb3\u6015\u88ab\u8ba8\u538c";
const sampleType = "\u5171\u9e23\u578b";
const sampleStatus = "\u4e3b\u63a8";
const pass = "\u901a\u8fc7";

test("extractJsonObject reads fenced JSON", () => {
  const text = `Here is the result:

\`\`\`json
{"cover_title":"${sampleTitle}","tags":["tag"]}
\`\`\``;

  assert.equal(extractJsonObject(text).cover_title, sampleTitle);
});

test("extractJsonObject reads plain JSON", () => {
  const text = JSON.stringify({ review_result: pass, risks: [] });

  assert.equal(extractJsonObject(text).review_result, pass);
});

test("notionPlainText supports title, rich_text, select, status, and checkbox", () => {
  assert.equal(notionPlainText({ title: [{ plain_text: sampleTest }] }), sampleTest);
  assert.equal(notionPlainText({ rich_text: [{ plain_text: samplePain }] }), samplePain);
  assert.equal(notionPlainText({ select: { name: sampleType } }), sampleType);
  assert.equal(notionPlainText({ status: { name: sampleStatus } }), sampleStatus);
  assert.equal(notionPlainText({ checkbox: false }), "false");
});

test("safeSlug keeps ASCII, replaces unsupported characters, and never returns blank", () => {
  assert.equal(safeSlug(sampleTitle), "content");
  assert.equal(safeSlug("conversion draft 01!"), "conversion-draft-01");
});

test("normalizeProvider trims whitespace and lowercases provider names", () => {
  assert.equal(normalizeProvider(" doubao\n", "gemini"), "doubao");
  assert.equal(normalizeProvider("GEMINI ", "doubao"), "gemini");
  assert.equal(normalizeProvider("", "doubao"), "doubao");
  assert.equal(normalizeProvider(undefined, "doubao"), "doubao");
});

test("extractGeminiText reads text from Gemini generateContent response", () => {
  const response = {
    candidates: [
      {
        content: {
          parts: [{ text: "{\"ok\":true}" }],
        },
      },
    ],
  };

  assert.equal(extractGeminiText(response), "{\"ok\":true}");
});

test("extractDoubaoText reads text from Ark OpenAI-compatible chat response", () => {
  const response = {
    choices: [
      {
        message: {
          content: "{\"ok\":true}",
        },
      },
    ],
  };

  assert.equal(extractDoubaoText(response), "{\"ok\":true}");
});

test("extractDoubaoImageData reads base64 image data from Ark image response", () => {
  const response = {
    data: [
      {
        b64_json: "abc",
      },
    ],
  };

  assert.deepEqual(extractDoubaoImageData(response), { data: "abc", mimeType: "image/png", url: "" });
});

test("extractDoubaoImageData reads image URL from Ark image response", () => {
  const response = {
    data: [
      {
        url: "https://example.test/image.png",
      },
    ],
  };

  assert.deepEqual(extractDoubaoImageData(response), {
    data: "",
    mimeType: "image/png",
    url: "https://example.test/image.png",
  });
});

test("extractGeminiImageData reads camelCase and snake_case inline image data", () => {
  assert.deepEqual(
    extractGeminiImageData({
      candidates: [{ content: { parts: [{ inlineData: { mimeType: "image/png", data: "abc" } }] } }],
    }),
    { mimeType: "image/png", data: "abc" },
  );

  assert.deepEqual(
    extractGeminiImageData({
      candidates: [{ content: { parts: [{ inline_data: { mime_type: "image/png", data: "def" } }] } }],
    }),
    { mimeType: "image/png", data: "def" },
  );
});

test("requestJson retries transient high-demand responses", async () => {
  let calls = 0;
  const slept = [];
  const result = await requestJson(
    "https://example.test/transient",
    {},
    {
      maxAttempts: 2,
      fetchImpl: async () => {
        calls += 1;
        if (calls === 1) {
          return {
            ok: false,
            status: 503,
            statusText: "Service Unavailable",
            text: async () => "high demand",
          };
        }
        return {
          ok: true,
          status: 200,
          statusText: "OK",
          text: async () => "{\"ok\":true}",
        };
      },
      sleepImpl: async (ms) => slept.push(ms),
      logImpl: () => {},
    },
  );

  assert.deepEqual(result, { ok: true });
  assert.equal(calls, 2);
  assert.equal(slept.length, 1);
});

test("requestJson does not retry non-transient configuration errors", async () => {
  let calls = 0;
  await assert.rejects(
    () =>
      requestJson(
        "https://example.test/not-found",
        {},
        {
          maxAttempts: 3,
          fetchImpl: async () => {
            calls += 1;
            return {
              ok: false,
              status: 404,
              statusText: "Not Found",
              text: async () => "missing",
            };
          },
          sleepImpl: async () => {},
        },
      ),
    /Request failed 404 Not Found: missing/,
  );

  assert.equal(calls, 1);
});
