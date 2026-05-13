const NOTION_VERSION = "2022-06-28";

const DEFAULTS = {
  codeProperty: "\u5151\u6362\u7801",
  statusProperty: "\u72b6\u6001",
  statusPropertyType: "status",
  unusedStatus: "\u672a\u4f7f\u7528",
  usedStatus: "\u5df2\u4f7f\u7528",
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

export function buildUsedProperties({ status } = {}, env = process.env) {
  const config = getConfig(env);
  const name = status || config.usedStatus;
  const statusValue =
    config.statusPropertyType === "select"
      ? {
          select: { name },
        }
      : {
          status: { name },
        };

  return {
    [config.statusProperty]: statusValue,
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
  env = process.env,
  fetchImpl = fetch,
  now = () => new Date().toISOString(),
  tokenFactory = randomToken,
}) {
  const config = getConfig(env);
  const normalizedCode = normalizeCode(code);

  if (!normalizedCode) {
    throw new Error("\u7f3a\u5c11\u5151\u6362\u7801");
  }
  if (!config.notionToken || !config.notionDatabaseId) {
    throw new Error("\u7f3a\u5c11 NOTION_TOKEN \u6216 NOTION_REDEEM_DATABASE_ID");
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
    throw new Error("\u5151\u6362\u7801\u4e0d\u5b58\u5728");
  }

  const status = propertyText(page.properties?.[config.statusProperty]);
  if (status !== config.unusedStatus) {
    throw new Error("\u5151\u6362\u7801\u5df2\u7ecf\u88ab\u4f7f\u7528");
  }

  const redeemedAt = now();
  const accessToken = tokenFactory();
  const patchUrl = `https://api.notion.com/v1/pages/${page.id}`;
  const patchResponse = await fetchImpl(patchUrl, {
    method: "PATCH",
    headers: notionHeaders(config.notionToken),
    body: JSON.stringify({
      properties: buildUsedProperties({ status: config.usedStatus }, env),
    }),
  });
  await notionJson(patchResponse);

  return {
    ok: true,
    code: normalizedCode,
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
    });
    sendJson(res, 200, result, config.corsOrigin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "\u5151\u6362\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5";
    const status = /\u4e0d\u5b58\u5728/.test(message) ? 404 : /\u5df2\u7ecf\u88ab\u4f7f\u7528/.test(message) ? 409 : /\u7f3a\u5c11\u5151\u6362\u7801/.test(message) ? 400 : 500;
    sendJson(res, status, { ok: false, message }, config.corsOrigin);
  }
}
