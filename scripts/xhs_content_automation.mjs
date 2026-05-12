import { Buffer } from "node:buffer";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const NOTION_VERSION = "2022-06-28";

const ZH = {
  resonance: "\u5171\u9e23\u578b",
  conversion: "\u6d4b\u8bd5\u5f15\u5bfc\u578b",
  pass: "\u901a\u8fc7",
  active: "\u4e3b\u63a8",
};

const CONTENT_TYPES = [ZH.resonance, ZH.conversion];

const TEST = {
  name: "\u6d4b\u8bd5\u540d\u79f0",
  status: "\u4e3b\u63a8\u72b6\u6001",
  audience: "\u76ee\u6807\u7528\u6237",
  pain: "\u6838\u5fc3\u75db\u70b9",
  scenes: "\u5178\u578b\u573a\u666f",
  fear: "\u7528\u6237\u6700\u6015\u627f\u8ba4",
  wanted: "\u7528\u6237\u6700\u60f3\u542c\u5230",
  modules: "\u62a5\u544a\u6a21\u5757",
  sellingPoints: "\u6d4b\u8bd5\u5356\u70b9",
  banned: "\u7981\u7528\u8868\u8fbe",
  visual: "\u89c6\u89c9\u98ce\u683c",
  cta: "\u4e3b\u9875\u5f15\u5bfc\u8bdd\u672f",
  backend: "\u540e\u7aef\u4ea7\u54c1",
};

const ANGLE = {
  name: "\u89d2\u5ea6\u540d\u79f0",
  test: "\u5bf9\u5e94\u6d4b\u8bd5",
  type: "\u5185\u5bb9\u7c7b\u578b",
  scene: "\u5177\u4f53\u573a\u666f",
  emotions: "\u60c5\u7eea\u5173\u952e\u8bcd",
  question: "\u60ac\u5ff5\u95ee\u9898",
  cover: "\u5c01\u9762\u6807\u9898",
  used: "\u662f\u5426\u5df2\u4f7f\u7528",
};

const CONTENT = {
  title: "\u5185\u5bb9\u6807\u9898",
  publishDate: "\u53d1\u5e03\u65e5\u671f",
  test: "\u5bf9\u5e94\u6d4b\u8bd5",
  angle: "\u5bf9\u5e94\u89d2\u5ea6",
  type: "\u5185\u5bb9\u7c7b\u578b",
  cover: "\u5c01\u9762\u6807\u9898",
  body: "\u6b63\u6587\u6587\u6848",
  pinned: "\u7f6e\u9876\u8bc4\u8bba",
  tags: "\u6807\u7b7e",
  imagePrompt: "\u56fe\u7247\u63d0\u793a\u8bcd",
  reviewResult: "\u5ba1\u6838\u7ed3\u679c",
  reviewNotes: "\u5ba1\u6838\u610f\u89c1",
  status: "\u72b6\u6001",
};

export function extractJsonObject(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : text.trim();

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error(`No JSON object found in model output: ${candidate.slice(0, 300)}`);
    }
    const objectText = candidate.slice(start, end + 1);
    try {
      return JSON.parse(objectText);
    } catch {
      return JSON.parse(escapeControlCharactersInJsonStrings(objectText));
    }
  }
}

export function escapeControlCharactersInJsonStrings(text) {
  let result = "";
  let inString = false;
  let escaped = false;

  for (const char of text) {
    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      result += char;
      escaped = inString;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString && char === "\n") {
      result += "\\n";
      continue;
    }

    if (inString && char === "\r") {
      result += "\\r";
      continue;
    }

    if (inString && char === "\t") {
      result += "\\t";
      continue;
    }

    result += char;
  }

  return result;
}

export function extractGeminiText(response) {
  const parts = response?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((part) => part.text || "").join("\n").trim();
  if (!text) throw new Error("Gemini response did not include text output");
  return text;
}

export function extractDoubaoText(response) {
  const content = response?.choices?.[0]?.message?.content;
  const text = Array.isArray(content)
    ? content.map((part) => part.text || part.content || "").join("\n").trim()
    : String(content ?? "").trim();
  if (!text) throw new Error("Doubao response did not include text output");
  return text;
}

export function extractDoubaoImageData(response) {
  const item = response?.data?.[0];
  if (item?.b64_json) {
    return { mimeType: "image/png", data: item.b64_json, url: "" };
  }
  if (item?.url) {
    return { mimeType: "image/png", data: "", url: item.url };
  }
  throw new Error("Doubao image response did not include data[0].b64_json or data[0].url");
}

export function extractGeminiImageData(response) {
  const parts = response?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    const inlineData = part.inlineData || part.inline_data;
    if (inlineData?.data) {
      return {
        mimeType: inlineData.mimeType || inlineData.mime_type || "image/png",
        data: inlineData.data,
      };
    }
  }
  throw new Error("Gemini image response did not include inline image data");
}

export function notionPlainText(property) {
  if (!property) return "";
  if (property.title) return property.title.map((part) => part.plain_text ?? "").join("");
  if (property.rich_text) return property.rich_text.map((part) => part.plain_text ?? "").join("");
  if (property.select) return property.select?.name ?? "";
  if (property.status) return property.status?.name ?? "";
  if (property.checkbox !== undefined) return String(property.checkbox);
  if (property.multi_select) return property.multi_select.map((item) => item.name).join(", ");
  if (property.date) return property.date?.start ?? "";
  if (property.number !== undefined) return String(property.number ?? "");
  return "";
}

export function safeSlug(value) {
  const slug = String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "content";
}

export function normalizeProvider(value, fallback) {
  return String(value || fallback).trim().toLowerCase();
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function richText(value) {
  return { rich_text: [{ text: { content: String(value ?? "").slice(0, 1900) } }] };
}

function titleText(value) {
  return { title: [{ text: { content: String(value ?? "").slice(0, 1900) } }] };
}

function selectValue(value) {
  return { select: { name: value } };
}

function statusValue(value) {
  return { status: { name: value } };
}

function multiSelect(values) {
  return { multi_select: [...new Set(values.filter(Boolean))].slice(0, 12).map((name) => ({ name })) };
}

function relationValue(pageId) {
  return pageId ? { relation: [{ id: pageId }] } : undefined;
}

function dateValue(value) {
  return { date: { start: value } };
}

function notionHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
  };
}

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(attempt) {
  return Math.min(1000 * 2 ** attempt, 10000);
}

export async function requestJson(url, options, settings = {}) {
  const maxAttempts = settings.maxAttempts ?? 5;
  const fetchImpl = settings.fetchImpl ?? fetch;
  const sleepImpl = settings.sleepImpl ?? sleep;
  const logImpl = settings.logImpl ?? console.warn;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetchImpl(url, options);
    const text = await response.text();
    if (response.ok) return text ? JSON.parse(text) : {};

    const canRetry = RETRYABLE_STATUS_CODES.has(response.status) && attempt < maxAttempts - 1;
    if (!canRetry) throw new Error(`Request failed ${response.status} ${response.statusText}: ${text}`);

    const delay = retryDelayMs(attempt);
    logImpl(`Transient request failure ${response.status}; retrying in ${delay}ms: ${url}`);
    await sleepImpl(delay);
  }

  throw new Error(`Request failed after ${maxAttempts} attempts: ${url}`);
}

async function notionQueryDatabase(databaseId, body = {}) {
  const token = requiredEnv("NOTION_TOKEN");
  return requestJson(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: notionHeaders(token),
    body: JSON.stringify(body),
  });
}

async function notionCreatePage(databaseId, properties, children = []) {
  const token = requiredEnv("NOTION_TOKEN");
  return requestJson("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: notionHeaders(token),
    body: JSON.stringify({ parent: { database_id: databaseId }, properties, children }),
  });
}

async function notionPatchPage(pageId, properties) {
  const token = requiredEnv("NOTION_TOKEN");
  return requestJson(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: notionHeaders(token),
    body: JSON.stringify({ properties }),
  });
}

async function geminiGenerateContent(model, prompt) {
  const apiKey = requiredEnv("GEMINI_API_KEY");
  return requestJson(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });
}

function arkBaseUrl() {
  return (process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3").replace(/\/+$/, "");
}

async function doubaoChatCompletion(prompt) {
  const apiKey = requiredEnv("ARK_API_KEY");
  const model = process.env.DOUBAO_TEXT_MODEL || "doubao-seed-1-6-250615";

  return requestJson(`${arkBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You write precise, restrained Chinese Xiaohongshu emotion-test content and return JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });
}

export function buildDoubaoImageRequestBody(prompt, model, size, responseFormat) {
  const body = {
    model,
    prompt,
    size,
    watermark: false,
  };
  const normalizedFormat = String(responseFormat || "").trim().toLowerCase();
  if (normalizedFormat && !["default", "none", "omit"].includes(normalizedFormat)) {
    body.response_format = normalizedFormat;
  }
  return body;
}

async function doubaoGenerateImage(prompt, outputPath) {
  const apiKey = requiredEnv("ARK_API_KEY");
  const model = process.env.DOUBAO_IMAGE_MODEL || "doubao-seedream-4-0-250828";
  const size = process.env.DOUBAO_IMAGE_SIZE || "1024x1280";
  const responseFormat = process.env.DOUBAO_IMAGE_RESPONSE_FORMAT || "";

  const response = await requestJson(`${arkBaseUrl()}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildDoubaoImageRequestBody(prompt, model, size, responseFormat)),
  });

  const image = extractDoubaoImageData(response);
  let imageBuffer;
  if (image.data) {
    imageBuffer = Buffer.from(image.data, "base64");
  } else {
    const imageResponse = await fetch(image.url);
    if (!imageResponse.ok) throw new Error(`Failed to download Doubao generated image: ${imageResponse.status}`);
    imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, imageBuffer);
}

async function openAIResponsesJson(prompt) {
  const provider = normalizeProvider(process.env.TEXT_PROVIDER, "gemini");
  if (provider === "doubao") {
    const response = await doubaoChatCompletion(prompt);
    return extractJsonObject(extractDoubaoText(response));
  }

  if (provider !== "gemini") throw new Error(`TEXT_PROVIDER must be "gemini" or "doubao". Got: ${provider}`);
  const model = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash-lite";
  const response = await geminiGenerateContent(model, prompt);
  return extractJsonObject(extractGeminiText(response));
}

async function generateImage(prompt, outputPath) {
  const provider = normalizeProvider(process.env.IMAGE_PROVIDER, "doubao");
  if (provider === "doubao") {
    await doubaoGenerateImage(prompt, outputPath);
    return;
  }

  if (provider !== "gemini") throw new Error(`IMAGE_PROVIDER must be "doubao" or "gemini". Got: ${provider}`);
  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
  const response = await geminiGenerateContent(model, prompt);
  const image = extractGeminiImageData(response);
  const imageBuffer = Buffer.from(image.data, "base64");

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, imageBuffer);
}

function pageToTestCard(page) {
  const props = page.properties || {};
  return {
    pageId: page.id,
    testName: notionPlainText(props[TEST.name]),
    status: notionPlainText(props[TEST.status]),
    audience: notionPlainText(props[TEST.audience]),
    pain: notionPlainText(props[TEST.pain]),
    scenes: notionPlainText(props[TEST.scenes]),
    fear: notionPlainText(props[TEST.fear]),
    wanted: notionPlainText(props[TEST.wanted]),
    modules: notionPlainText(props[TEST.modules]),
    sellingPoints: notionPlainText(props[TEST.sellingPoints]),
    banned: notionPlainText(props[TEST.banned]),
    visual: notionPlainText(props[TEST.visual]),
    cta: notionPlainText(props[TEST.cta]),
    backend: notionPlainText(props[TEST.backend]),
  };
}

function pageToAngle(page) {
  const props = page.properties || {};
  return {
    pageId: page.id,
    angleName: notionPlainText(props[ANGLE.name]),
    contentType: notionPlainText(props[ANGLE.type]),
    scene: notionPlainText(props[ANGLE.scene]),
    emotions: notionPlainText(props[ANGLE.emotions]),
    question: notionPlainText(props[ANGLE.question]),
    coverTitle: notionPlainText(props[ANGLE.cover]),
    used: notionPlainText(props[ANGLE.used]) === "true",
  };
}

async function getActiveTest() {
  const databaseId = requiredEnv("NOTION_TEST_DATABASE_ID");
  const result = await notionQueryDatabase(databaseId);
  if (!result.results?.length) throw new Error("The Notion test database is empty.");

  const targetName = process.env.XHS_TARGET_TEST_NAME;
  if (targetName) {
    const exact = result.results.find((page) => notionPlainText(page.properties?.[TEST.name]) === targetName);
    if (exact) return pageToTestCard(exact);
    throw new Error(`XHS_TARGET_TEST_NAME was not found: ${targetName}`);
  }

  const active = result.results.find((page) =>
    [ZH.active, "In progress", "Done"].includes(notionPlainText(page.properties?.[TEST.status]))
  );
  return pageToTestCard(active || result.results[0]);
}

async function getUnusedAngle(contentType) {
  const databaseId = requiredEnv("NOTION_ANGLE_DATABASE_ID");
  const result = await notionQueryDatabase(databaseId);
  return (result.results || [])
    .map(pageToAngle)
    .find((angle) => angle.contentType === contentType && !angle.used) || null;
}

function angleGenerationPrompt(testCard) {
  return `You are a Xiaohongshu content strategist for a Chinese female emotion-test account.

Create 30 single-image content angles for this test product. Output JSON only:
{
  "angles": [
    {
      "angle_name": "Chinese angle name",
      "content_type": "${ZH.resonance}",
      "scene": "specific Chinese daily-life scene",
      "emotion_keywords": ["Chinese keyword"],
      "open_question": "Chinese curiosity gap",
      "cover_title": "short Chinese cover title"
    }
  ]
}

Rules:
- Create 15 items with content_type "${ZH.resonance}" and 15 with "${ZH.conversion}".
- Every scene must be specific and concrete.
- Conversion angles must create the question: which type am I, why am I like this, or what did I sacrifice in relationships?
- Avoid diagnosis, cure promises, shame, fearmongering, and generic self-love talk.

Test product:
${JSON.stringify(testCard, null, 2)}`;
}

async function createAnglesIfNeeded(testCard, contentType) {
  const existing = await getUnusedAngle(contentType);
  if (existing) return existing;

  const databaseId = requiredEnv("NOTION_ANGLE_DATABASE_ID");
  const generated = await openAIResponsesJson(angleGenerationPrompt(testCard));
  const angles = Array.isArray(generated.angles) ? generated.angles : [];

  for (const angle of angles) {
    await notionCreatePage(databaseId, {
      [ANGLE.name]: titleText(angle.angle_name),
      [ANGLE.test]: relationValue(testCard.pageId),
      [ANGLE.type]: selectValue(angle.content_type),
      [ANGLE.scene]: richText(angle.scene),
      [ANGLE.emotions]: multiSelect(angle.emotion_keywords || []),
      [ANGLE.question]: richText(angle.open_question),
      [ANGLE.cover]: richText(angle.cover_title),
      [ANGLE.used]: { checkbox: false },
    });
  }

  const angle = await getUnusedAngle(contentType);
  if (!angle) throw new Error(`Could not find or generate an unused angle for ${contentType}`);
  return angle;
}

function contentPrompt(testCard, angle, contentType) {
  return `You are a Xiaohongshu content strategist for a Chinese female emotion-test account.

Generate one single-image Xiaohongshu post. Output JSON only:
{
  "cover_title": "short Chinese title for the image",
  "body": "Chinese Xiaohongshu caption",
  "pinned_comment": "Chinese pinned comment",
  "tags": ["Chinese tag"],
  "image_prompt": "Chinese prompt for Doubao Seedream image generation"
}

Caption structure:
1. A concrete daily-life scene.
2. Emotional recognition.
3. Name the relationship pattern without medical diagnosis.
4. Leave a curiosity gap.
5. If content_type is "${ZH.conversion}", naturally guide the user to check the homepage test. If it is "${ZH.resonance}", do not hard sell.

Image style:
- 4:5 vertical Xiaohongshu cover.
- Low-saturation watercolor picture-book style.
- Soft pink-white and blue-gray palette.
- One young woman in a specific emotional scene.
- Clear Chinese cover title area at the top.
- Gentle, not scary, not medicalized.

Forbidden: diagnosis, cure promises, severe mental illness claims, "you must be", shame, fearmongering.

Test product:
${JSON.stringify(testCard, null, 2)}

Angle:
${JSON.stringify(angle, null, 2)}

Content type: ${contentType}`;
}

function reviewPrompt(content) {
  return `Review this Xiaohongshu emotion-test post for safety. Output JSON only:
{
  "review_result": "${ZH.pass}",
  "risks": [],
  "revision_suggestions": []
}

Reject or suggest changes if it sounds like medical diagnosis, absolute judgment, fearmongering, cure promise, shame, attack, generic fluff, or hard external traffic diversion.

Post:
${JSON.stringify(content, null, 2)}`;
}

function revisePrompt(content, review) {
  return `Rewrite the post according to the review. Output the same JSON shape only.

Original:
${JSON.stringify(content, null, 2)}

Review:
${JSON.stringify(review, null, 2)}`;
}

async function generateReviewedContent(testCard, angle, contentType) {
  let content = await openAIResponsesJson(contentPrompt(testCard, angle, contentType));
  let review = await openAIResponsesJson(reviewPrompt(content));

  if (review.review_result !== ZH.pass) {
    content = await openAIResponsesJson(revisePrompt(content, review));
    review = await openAIResponsesJson(reviewPrompt(content));
  }

  return { content, review };
}

function textBlock(type, text) {
  return {
    object: "block",
    type,
    [type]: { rich_text: [{ type: "text", text: { content: String(text ?? "").slice(0, 1900) } }] },
  };
}

function githubRawUrl(relativePath) {
  const repo = process.env.GITHUB_REPOSITORY;
  const branch = process.env.GITHUB_REF_NAME || "main";
  if (!repo) return "";
  const encodedPath = relativePath.split("/").map(encodeURIComponent).join("/");
  return `https://raw.githubusercontent.com/${repo}/${branch}/${encodedPath}`;
}

async function createContentDraft({ testCard, angle, contentType, content, review, imagePath }) {
  const databaseId = requiredEnv("NOTION_CONTENT_DATABASE_ID");
  const today = new Date().toISOString().slice(0, 10);
  const title = `${today} ${contentType} ${content.cover_title}`;
  const imageUrl = imagePath ? githubRawUrl(imagePath.replaceAll("\\", "/")) : "";
  const reviewNotes = [...(review.risks || []), ...(review.revision_suggestions || [])].join("\n");

  const properties = {
    [CONTENT.title]: titleText(title),
    [CONTENT.publishDate]: dateValue(today),
    [CONTENT.test]: relationValue(testCard.pageId),
    [CONTENT.angle]: relationValue(angle.pageId),
    [CONTENT.type]: selectValue(contentType),
    [CONTENT.cover]: richText(content.cover_title),
    [CONTENT.body]: richText(content.body),
    [CONTENT.pinned]: richText(content.pinned_comment),
    [CONTENT.tags]: multiSelect(content.tags || []),
    [CONTENT.imagePrompt]: richText(content.image_prompt),
    [CONTENT.reviewResult]: selectValue(review.review_result || ZH.pass),
    [CONTENT.reviewNotes]: richText(reviewNotes),
    [CONTENT.status]: statusValue(review.review_result === ZH.pass ? "In progress" : "Not started"),
  };

  const children = [
    textBlock("heading_2", "Cover title"),
    textBlock("paragraph", content.cover_title),
    textBlock("heading_2", "Caption"),
    textBlock("paragraph", content.body),
    textBlock("heading_2", "Pinned comment"),
    textBlock("paragraph", content.pinned_comment),
    textBlock("heading_2", "Tags"),
    textBlock("paragraph", (content.tags || []).map((tag) => `#${tag}`).join(" ")),
    textBlock("heading_2", "Image"),
    textBlock("paragraph", imageUrl || imagePath),
    textBlock("heading_2", "Image prompt"),
    textBlock("paragraph", content.image_prompt),
    textBlock("heading_2", "Review"),
    textBlock("paragraph", `${review.review_result}\n${reviewNotes}`),
  ];

  return notionCreatePage(databaseId, properties, children);
}

async function runOneContentType(testCard, contentType) {
  const angle = await createAnglesIfNeeded(testCard, contentType);
  const { content, review } = await generateReviewedContent(testCard, angle, contentType);
  const today = new Date().toISOString().slice(0, 10);
  const imagePath = path.join("generated", today, `${safeSlug(`${contentType}-${content.cover_title}`)}.png`);

  await generateImage(content.image_prompt, imagePath);
  await createContentDraft({
    testCard,
    angle,
    contentType,
    content,
    review,
    imagePath,
  });
  await notionPatchPage(angle.pageId, { [ANGLE.used]: { checkbox: true } });

  console.log(`Created ${contentType}: ${content.cover_title}`);
}

export async function main() {
  const testCard = await getActiveTest();
  const rawMode = process.env.XHS_CONTENT_MODE || "both";
  const mode = rawMode === "resonance" ? ZH.resonance : rawMode === "conversion" ? ZH.conversion : rawMode;
  const types = mode === "both" ? CONTENT_TYPES : [mode];

  for (const contentType of types) {
    if (!CONTENT_TYPES.includes(contentType)) {
      throw new Error(`XHS_CONTENT_MODE must be "both", "${ZH.resonance}", or "${ZH.conversion}". Got: ${contentType}`);
    }
    await runOneContentType(testCard, contentType);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
