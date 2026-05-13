const jsonHeaders = (origin) => ({
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});

function jsonResponse(body, status = 200, origin = "*") {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders(origin),
  });
}

function normalizeCode(code) {
  return String(code || "").trim().replace(/\s+/g, "").toUpperCase();
}

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default {
  async fetch(request, env) {
    const origin = env.CORS_ORIGIN || request.headers.get("Origin") || "*";
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: jsonHeaders(origin) });
    }

    if (request.method !== "POST" || url.pathname !== "/redeem") {
      return jsonResponse({ ok: false, message: "Not found" }, 404, origin);
    }

    if (!env.REDEEM_CODES) {
      return jsonResponse({ ok: false, message: "REDEEM_CODES KV namespace is not configured" }, 500, origin);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ ok: false, message: "Invalid JSON body" }, 400, origin);
    }

    const code = normalizeCode(payload.code);
    const testId = String(payload.testId || "");
    if (!code || !testId) {
      return jsonResponse({ ok: false, message: "缺少兑换码或测试 ID" }, 400, origin);
    }

    const key = `code:${code}`;
    const record = await env.REDEEM_CODES.get(key, "json");
    if (!record) {
      return jsonResponse({ ok: false, message: "兑换码不存在" }, 404, origin);
    }
    if (record.testId && record.testId !== testId) {
      return jsonResponse({ ok: false, message: "兑换码不适用于当前测试" }, 400, origin);
    }
    if (record.status !== "unused") {
      return jsonResponse({ ok: false, message: "兑换码已被使用" }, 409, origin);
    }

    const accessToken = randomToken();
    const usedAt = new Date().toISOString();
    await env.REDEEM_CODES.put(
      key,
      JSON.stringify({
        ...record,
        status: "used",
        usedAt,
        accessToken,
      }),
    );
    await env.REDEEM_CODES.put(
      `access:${accessToken}`,
      JSON.stringify({
        code,
        testId,
        createdAt: usedAt,
      }),
      { expirationTtl: 60 * 60 * 24 * 365 },
    );

    return jsonResponse({ ok: true, code, testId, accessToken, redeemedAt: usedAt }, 200, origin);
  },
};
