const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

const NOTION_VERSION = "2022-06-28";

export function normalizeRedeemCode(value) {
  return String(value ?? "").trim().toUpperCase();
}

export function getRedeemProvider(env = process.env) {
  if (env.NOTION_TOKEN && env.NOTION_REDEEM_CODES_DATABASE_ID) {
    return { type: "notion" };
  }

  if (env.REDEEM_CODES) {
    return { type: "env-codes" };
  }

  return { type: "unconfigured" };
}

export async function redeemCode(payload, env = process.env, fetchImpl = fetch) {
  const code = normalizeRedeemCode(payload?.code);
  const testId = String(payload?.testId ?? "").trim();

  if (!code) {
    return failure(400, "code_required", "请输入兑换码。");
  }

  const provider = getRedeemProvider(env);

  if (provider.type === "notion") {
    return redeemWithNotion({ code, testId }, env, fetchImpl);
  }

  if (provider.type === "env-codes") {
    return redeemWithEnvCodes({ code, testId }, env);
  }

  return failure(503, "redeem_not_configured", "兑换码系统尚未配置，请联系管理员。");
}

export function redeemWithEnvCodes({ code, testId }, env = process.env) {
  const allowedCodes = parseEnvRedeemCodes(env.REDEEM_CODES);
  const normalizedTestId = testId.toLowerCase();
  const matched = allowedCodes.some((entry) => {
    const sameCode = entry.code === code;
    const sameTest = !entry.testId || entry.testId === normalizedTestId;
    return sameCode && sameTest;
  });

  if (!matched) {
    return failure(401, "invalid_code", "兑换码无效，请检查后重试。");
  }

  return {
    ok: true,
    status: 200,
    provider: "env-codes",
    message: "兑换成功。",
  };
}

export function parseEnvRedeemCodes(value = "") {
  return String(value)
    .split(",")
    .map((rawEntry) => rawEntry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [maybeTestId, maybeCode] = entry.split(":");
      if (maybeCode) {
        return {
          testId: maybeTestId.trim().toLowerCase(),
          code: normalizeRedeemCode(maybeCode),
        };
      }

      return {
        testId: "",
        code: normalizeRedeemCode(entry),
      };
    });
}

async function redeemWithNotion({ code, testId }, env, fetchImpl) {
  const databaseId = env.NOTION_REDEEM_CODES_DATABASE_ID;
  const token = env.NOTION_TOKEN;
  const codeProperty = env.NOTION_CODE_PROPERTY || "兑换码";
  const codePropertyType = env.NOTION_CODE_PROPERTY_TYPE || "title";
  const statusProperty = env.NOTION_STATUS_PROPERTY || "状态";
  const unusedStatus = env.NOTION_UNUSED_STATUS || "未使用";
  const usedStatus = env.NOTION_USED_STATUS || "已使用";
  const reusableStatus = env.NOTION_REUSABLE_STATUS || "固定码";

  const queryResponse = await fetchImpl(
    `https://api.notion.com/v1/databases/${databaseId}/query`,
    {
      method: "POST",
      headers: notionHeaders(token),
      body: JSON.stringify({
        filter: buildNotionCodeFilter({
          code,
          codeProperty,
          codePropertyType,
          testId,
          testIdProperty: env.NOTION_TEST_ID_PROPERTY || "测试ID",
          testIdPropertyType: env.NOTION_TEST_ID_PROPERTY_TYPE || "rich_text",
        }),
        page_size: 1,
      }),
    },
  );

  if (!queryResponse.ok) {
    return failure(502, "redeem_lookup_failed", "兑换码系统暂时不可用，请稍后再试。");
  }

  const queryData = await queryResponse.json();
  const page = queryData.results?.[0];

  if (!page) {
    return failure(401, "invalid_code", "兑换码无效，请检查后重试。");
  }

  const statusName = getNotionStatusName(page.properties?.[statusProperty]);
  if (statusName === reusableStatus) {
    return {
      ok: true,
      status: 200,
      provider: "notion",
      reusable: true,
      message: "兑换成功。",
    };
  }

  if (statusName !== unusedStatus) {
    return failure(409, "code_already_used", "这个兑换码已经使用过，请联系管理员。");
  }

  const patchResponse = await fetchImpl(`https://api.notion.com/v1/pages/${page.id}`, {
    method: "PATCH",
    headers: notionHeaders(token),
    body: JSON.stringify({
      properties: {
        [statusProperty]: buildNotionUsedStatusProperty(
          page.properties?.[statusProperty],
          usedStatus,
        ),
      },
    }),
  });

  if (!patchResponse.ok) {
    return failure(502, "redeem_mark_failed", "兑换码已找到，但标记使用失败，请稍后再试。");
  }

  return {
    ok: true,
    status: 200,
    provider: "notion",
    message: "兑换成功。",
  };
}

export function buildNotionCodeFilter({
  code,
  codeProperty,
  codePropertyType,
  testId,
  testIdProperty,
  testIdPropertyType,
}) {
  const filters = [
    {
      property: codeProperty,
      [codePropertyType]: { equals: code },
    },
  ];

  if (testIdProperty && testId) {
    filters.push({ property: testIdProperty, [testIdPropertyType]: { equals: testId } });
  }

  return filters.length === 1 ? filters[0] : { and: filters };
}

export function getNotionStatusName(property) {
  return (
    property?.status?.name ??
    property?.select?.name ??
    property?.rich_text?.[0]?.plain_text ??
    ""
  );
}

export function buildNotionUsedStatusProperty(property, statusName) {
  if (property?.type === "select" || property?.select) {
    return { select: { name: statusName } };
  }

  return { status: { name: statusName } };
}

function notionHeaders(token) {
  return {
    ...JSON_HEADERS,
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
  };
}

function failure(status, error, message) {
  return {
    ok: false,
    status,
    error,
    message,
  };
}

async function readRequestBody(request) {
  if (request.body && typeof request.body === "object" && !request.body.getReader) {
    return request.body;
  }

  let rawBody = "";
  for await (const chunk of request) {
    rawBody += chunk;
  }

  if (!rawBody) return {};
  return JSON.parse(rawBody);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, JSON_HEADERS);
    response.end(JSON.stringify(failure(405, "method_not_allowed", "请使用 POST 请求。")));
    return;
  }

  try {
    const body = await readRequestBody(request);
    const result = await redeemCode(body);
    response.writeHead(result.status, JSON_HEADERS);
    response.end(JSON.stringify(result));
  } catch (error) {
    response.writeHead(400, JSON_HEADERS);
    response.end(
      JSON.stringify(failure(400, "invalid_request", "请求格式不正确，请刷新后重试。")),
    );
  }
}
