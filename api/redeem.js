const NOTION_VERSION = "2022-06-28";

const DEFAULTS = {
  codeProperty: "兑换码",
  statusProperty: "状态",
  statusPropertyType: "status",
  testIdProperty: "测试ID",
  usedAtProperty: "使用时间",
  accessTokenProperty: "访问令牌",
  unusedStatus: "未使用",
  usedStatus: "已使用",
};

export function normalizeCode(code) {
  return String(code || "").trim().replace(/\s+/g, "").toUpperCase();
}

function getConfig(env = process.env) {
  return {
    notionToken: env.NOTION_TOKEN,
    notionDatabaseId: env.NOTION_REDEEM_DATABASE_ID,
    codeProperty: env.REDEEM_CODE_PROPERTY || DEFAULTS.codeProperty,
    statusProperty: env.REDEEM_STATUS_PROPERTY || DEFAULTS.statusProperty,
    statusPropertyType: env.REDEEM_STATUS_PROPERTY_TYPE || DEFAULTS.statusPropertyType,
    testIdProperty: env.REDEEM_TEST_ID_PROPERTY || DEFAULTS.testIdProperty,
    usedAtProperty: env.REDEEM_USED_AT_PROPERTY || DEFAULTS.usedAtProperty,
    accessTokenProperty: env.REDEEM_ACCESS_TOKEN_PROPERTY || DEFAULTS.accessTokenProperty,
    unusedStatus: env.REDEEM_UNUSED_CODE_STATUS || DEFAULTS.unusedStatus,
    usedStatus: env.REDEEM_USED_CODE_STATUS || DEFAULTS.usedStatus,
    corsOrigin: env.CORS_ORIGIN || "*",
  };
}

function notionHeaders(notionToken) {
  return {
    Authorization: `Bearer ${notionToken}`,
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
  };
}

export function buildRedeemQuery(code, env = process.env) {
  const config = getConfig(env);
  return {
    filter: {
      property: config.codeProperty,
      title: {
        equals: normalizeCode(code),
      },
    },
    page_size: 1,
  };
}

export function buildUsedProperties({ status, usedAt, accessToken }, env = process.env) {
  const config = getConfig(env);
  const statusValue =
    config.statusPropertyType === "select"
      ? {
          select: {
            name: status || config.usedStatus,
          },
        }
      : {
          status: {
            name: status || config.usedStatus,
          },
        };

  return {
    [config.statusProperty]: statusValue,
    [config.usedAtProperty]: {
      date: {
        start: usedAt,
      },
    },
    [config.accessTokenProperty]: {
      rich_text: [
        {
          text: {
            content: accessToken,
          },
        },
      ],
    },
  };
}

function propertyText(property) {
  if (!property) return "";
  if (property.type === "title") return (property.title || []).map((item) => item.plain_text || "").join("");
  if (property.type === "rich_text") return (property.rich_text || []).map((item) => item.plain_text || "").join("");
  if (property.type === "select") return property.select?.name || "";
  if (property.type === "status") return property.status?.name || "";

  if (Array.isArray(property.title)) return property.title.map((item) => item.plain_text || "").join("");
  if (Array.isArray(property.rich_text)) return property.rich_text.map((item) => item.plain_text || "").join("");
  return property.select?.name || property.status?.name || "";
}

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function notionJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.message || payload.error || `Notion request failed: ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

export async function redeemWithNotion({
  code,
  testId,
  env = process.env,
  fetchImpl = fetch,
  now = () => new Date().toISOString(),
  tokenFactory = randomToken,
}) {
  const config = getConfig(env);
  const normalizedCode = normalizeCode(code);
  const normalizedTestId = String(testId || "").trim();

  if (!normalizedCode || !normalizedTestId) {
    throw new Error("缺少兑换码或测试 ID");
  }
  if (!config.notionToken || !config.notionDatabaseId) {
    throw new Error("缺少 NOTION_TOKEN 或 NOTION_REDEEM_DATABASE_ID");
  }

  const queryUrl = `https://api.notion.com/v1/databases/${config.notionDatabaseId}/query`;
  const queryResponse = await fetchImpl(queryUrl, {
    method: "POST",
    headers: notionHeaders(config.notionToken),
    body: JSON.stringify(buildRedeemQuery(normalizedCode, env)),
  });
  const queryPayload = await notionJson(queryResponse);
  const page = queryPayload.results?.[0];

  if (!page) {
    throw new Error("兑换码不存在");
  }

  const status = propertyText(page.properties?.[config.statusProperty]);
  if (status !== config.unusedStatus) {
    throw new Error("兑换码已经被使用");
  }

  const pageTestId = propertyText(page.properties?.[config.testIdProperty]);
  if (pageTestId && pageTestId !== normalizedTestId) {
    throw new Error("兑换码不适用于当前测试");
  }

  const redeemedAt = now();
  const accessToken = tokenFactory();
  const patchUrl = `https://api.notion.com/v1/pages/${page.id}`;
  const patchResponse = await fetchImpl(patchUrl, {
    method: "PATCH",
    headers: notionHeaders(config.notionToken),
    body: JSON.stringify({
      properties: buildUsedProperties({
        status: config.usedStatus,
        usedAt: redeemedAt,
        accessToken,
      }, env),
    }),
  });
  await notionJson(patchResponse);

  return {
    ok: true,
    code: normalizedCode,
    testId: normalizedTestId,
    accessToken,
    redeemedAt,
  };
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}

function sendJson(res, status, body, origin = "*") {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  const config = getConfig();

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", config.corsOrigin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, message: "Method not allowed" }, config.corsOrigin);
    return;
  }

  try {
    const body = await readBody(req);
    const result = await redeemWithNotion({
      code: body.code,
      testId: body.testId,
    });
    sendJson(res, 200, result, config.corsOrigin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "兑换失败，请稍后再试";
    const status = /不存在/.test(message) ? 404 : /已经被使用/.test(message) ? 409 : /不适用|缺少兑换码/.test(message) ? 400 : 500;
    sendJson(res, status, { ok: false, message }, config.corsOrigin);
  }
}
