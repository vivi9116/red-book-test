import { randomBytes, timingSafeEqual } from "node:crypto";

const NOTION_VERSION = "2022-06-28";

const DEFAULTS = {
  codeProperty: "\u5151\u6362\u7801",
  statusProperty: "\u72b6\u6001",
  statusPropertyType: "status",
  unusedStatus: "\u672a\u4f7f\u7528",
};

function getConfig(env = process.env) {
  return {
    notionToken: env.NOTION_TOKEN,
    notionDatabaseId: env.NOTION_REDEEM_DATABASE_ID,
    adminToken: env.REDEEM_ADMIN_TOKEN,
    codeProperty: env.REDEEM_CODE_PROPERTY || DEFAULTS.codeProperty,
    statusProperty: env.REDEEM_STATUS_PROPERTY || DEFAULTS.statusProperty,
    statusPropertyType: env.REDEEM_STATUS_PROPERTY_TYPE || DEFAULTS.statusPropertyType,
    unusedStatus: env.REDEEM_UNUSED_CODE_STATUS || DEFAULTS.unusedStatus,
  };
}

function notionHeaders(notionToken) {
  return {
    Authorization: `Bearer ${notionToken}`,
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
  };
}

async function notionJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.message || payload.error || `Notion request failed: ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

function codePart() {
  return randomBytes(3).toString("hex").toUpperCase();
}

function randomCode() {
  return `${codePart()}-${codePart()}`;
}

function clampCount(count) {
  const parsed = Number(count || 20);
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(200, Math.max(1, Math.trunc(parsed)));
}

export function isAuthorized(token, env = process.env) {
  const expected = String(getConfig(env).adminToken || "");
  const actual = String(token || "");
  if (!expected || !actual || expected.length !== actual.length) return false;
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function buildCreateCodePageBody(code, env = process.env) {
  const config = getConfig(env);
  const statusValue =
    config.statusPropertyType === "select"
      ? {
          select: { name: config.unusedStatus },
        }
      : {
          status: { name: config.unusedStatus },
        };

  return {
    parent: { database_id: config.notionDatabaseId },
    properties: {
      [config.codeProperty]: {
        title: [{ text: { content: code } }],
      },
      [config.statusProperty]: statusValue,
    },
  };
}

export async function generateRedeemCodes({
  count = 20,
  env = process.env,
  fetchImpl = fetch,
  codeFactory = randomCode,
}) {
  const config = getConfig(env);
  const total = clampCount(count);

  if (!config.notionToken || !config.notionDatabaseId) {
    throw new Error("\u7f3a\u5c11 NOTION_TOKEN \u6216 NOTION_REDEEM_DATABASE_ID");
  }

  const codes = new Set();
  while (codes.size < total) codes.add(codeFactory());

  for (const code of codes) {
    const response = await fetchImpl("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: notionHeaders(config.notionToken),
      body: JSON.stringify(buildCreateCodePageBody(code, env)),
    });
    await notionJson(response);
  }

  return {
    ok: true,
    count: codes.size,
    codes: [...codes],
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

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, message: "Method not allowed" });
    return;
  }

  try {
    const body = await readBody(req);
    if (!isAuthorized(body.adminToken || req.headers["x-admin-token"])) {
      sendJson(res, 401, { ok: false, message: "\u7ba1\u7406\u5bc6\u7801\u4e0d\u6b63\u786e" });
      return;
    }

    const result = await generateRedeemCodes({ count: body.count });
    sendJson(res, 200, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "\u751f\u6210\u5931\u8d25";
    sendJson(res, 500, { ok: false, message });
  }
}
