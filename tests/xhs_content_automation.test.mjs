import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDoubaoImageRequestBody,
  contentPrompt,
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

test("extractJsonObject repairs raw newlines inside JSON strings", () => {
  const text = `{
    "cover_title": "${sampleTitle}",
    "body": "第一行
第二行",
    "tags": ["tag"]
  }`;

  assert.equal(extractJsonObject(text).body, "第一行\n第二行");
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

test("contentPrompt asks for senior-sister long copy, hashtags, and no citation markers", () => {
  const prompt = contentPrompt(
    {
      testName: sampleTest,
      audience: "\u5bb3\u6015\u62d2\u7edd\u522b\u4eba\u7684\u5973\u751f",
      cta: "\u5e97\u91cc\u6216\u4e3b\u9875\u67e5\u770b",
    },
    {
      angleName: "\u4e0d\u6562\u62d2\u7edd",
      scene: "\u522b\u4eba\u6c42\u4f60\u5e2e\u5fd9\uff0c\u4f60\u660e\u660e\u5f88\u7d2f\u8fd8\u662f\u7b54\u5e94",
      question: "\u6211\u5230\u5e95\u662f\u54ea\u4e00\u79cd\u8ba8\u597d",
    },
    sampleType,
  );

  assert.match(prompt, /\u5b66\u59d0\u53e3\u543b/);
  assert.match(prompt, /\u6709\u65f6\u5019\uff0c\u771f\u7684\u89c9\u5f97\u597d\u7d2f/);
  assert.match(prompt, /\u5e97\u91cc/);
  assert.match(prompt, /#\u8ba8\u597d\u578b\u4eba\u683c/);
  assert.match(prompt, /\[cite/);
  assert.match(prompt, /\u4e0d\u8981\u8f93\u51fa/);
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

test("buildDoubaoImageRequestBody omits response_format unless explicitly requested", () => {
  assert.deepEqual(buildDoubaoImageRequestBody("prompt", "ep-test", "1024x1280", ""), {
    model: "ep-test",
    prompt: "prompt",
    size: "1728x2160",
    watermark: false,
  });

  assert.deepEqual(buildDoubaoImageRequestBody("prompt", "ep-test", "1024x1280\r\n", "none"), {
    model: "ep-test",
    prompt: "prompt",
    size: "1728x2160",
    watermark: false,
  });

  assert.deepEqual(buildDoubaoImageRequestBody("prompt", "ep-test", "1728x2160", "b64_json"), {
    model: "ep-test",
    prompt: "prompt",
    size: "1728x2160",
    watermark: false,
    response_format: "b64_json",
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
