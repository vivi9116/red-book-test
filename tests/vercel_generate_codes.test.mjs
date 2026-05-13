import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCreateCodePageBody,
  generateRedeemCodes,
  isAuthorized,
} from "../api/generate-codes.js";

const env = {
  NOTION_TOKEN: "secret_test",
  NOTION_REDEEM_DATABASE_ID: "db_test",
  REDEEM_ADMIN_TOKEN: "admin_secret",
};

test("isAuthorized requires the admin token", () => {
  assert.equal(isAuthorized("admin_secret", env), true);
  assert.equal(isAuthorized("wrong", env), false);
});

test("buildCreateCodePageBody creates a two-column Notion redeem row", () => {
  assert.deepEqual(buildCreateCodePageBody("AB12CD-EF34", env), {
    parent: { database_id: "db_test" },
    properties: {
      兑换码: {
        title: [{ text: { content: "AB12CD-EF34" } }],
      },
      状态: {
        status: { name: "未使用" },
      },
    },
  });
});

test("buildCreateCodePageBody supports select-based status columns", () => {
  const body = buildCreateCodePageBody("AB12CD-EF34", {
    ...env,
    REDEEM_STATUS_PROPERTY_TYPE: "select",
  });

  assert.equal(body.properties["状态"].select.name, "未使用");
});

test("generateRedeemCodes writes generated rows to Notion", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return { ok: true, json: async () => ({ id: `page_${calls.length}` }) };
  };

  const result = await generateRedeemCodes({
    count: 2,
    env,
    fetchImpl,
    codeFactory: (() => {
      const codes = ["AB12CD-EF34", "AB12CD-EF35"];
      return () => codes.shift();
    })(),
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.codes, ["AB12CD-EF34", "AB12CD-EF35"]);
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /\/pages$/);
  assert.equal(JSON.parse(calls[0].options.body).properties["状态"].status.name, "未使用");
});
