import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRedeemQuery,
  buildUsedProperties,
  normalizeCode,
  redeemWithNotion,
} from "../api/redeem.js";

const env = {
  NOTION_TOKEN: "secret_test",
  NOTION_REDEEM_DATABASE_ID: "db_test",
};

test("normalizeCode removes spaces and uppercases buyer codes", () => {
  assert.equal(normalizeCode(" ab12 cd-ef34 "), "AB12CD-EF34");
});

test("buildRedeemQuery searches Notion by code", () => {
  assert.deepEqual(buildRedeemQuery("AB12CD-EF34"), {
    filter: {
      property: "兑换码",
      title: {
        equals: "AB12CD-EF34",
      },
    },
    page_size: 1,
  });
});

test("buildUsedProperties marks a Notion redeem code as used", () => {
  const properties = buildUsedProperties({
    status: "已使用",
    usedAt: "2026-05-13T11:00:00.000Z",
    accessToken: "token_123",
  });

  assert.equal(properties["状态"].status.name, "已使用");
  assert.equal(properties["使用时间"].date.start, "2026-05-13T11:00:00.000Z");
  assert.equal(properties["访问令牌"].rich_text[0].text.content, "token_123");
});

test("buildUsedProperties can update a select-based Notion status column", () => {
  const properties = buildUsedProperties(
    {
      status: "已使用",
      usedAt: "2026-05-13T11:00:00.000Z",
      accessToken: "token_123",
    },
    { REDEEM_STATUS_PROPERTY_TYPE: "select" },
  );

  assert.equal(properties["状态"].select.name, "已使用");
});

test("redeemWithNotion rejects a used code without updating Notion", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({
        results: [
          {
            id: "page_used",
            properties: {
              状态: { status: { name: "已使用" } },
              测试ID: { rich_text: [{ plain_text: "pleasing-personality-depth" }] },
            },
          },
        ],
      }),
    };
  };

  await assert.rejects(
    () => redeemWithNotion({ code: "AB12CD-EF34", testId: "pleasing-personality-depth", env, fetchImpl }),
    /已经被使用/,
  );
  assert.equal(calls.length, 1);
});

test("redeemWithNotion updates an unused matching Notion code", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (String(url).includes("/query")) {
      return {
        ok: true,
        json: async () => ({
          results: [
            {
              id: "page_unused",
              properties: {
                状态: { status: { name: "未使用" } },
                测试ID: { rich_text: [{ plain_text: "pleasing-personality-depth" }] },
              },
            },
          ],
        }),
      };
    }
    return { ok: true, json: async () => ({}) };
  };

  const result = await redeemWithNotion({
    code: " ab12 cd-ef34 ",
    testId: "pleasing-personality-depth",
    env,
    fetchImpl,
    now: () => "2026-05-13T11:00:00.000Z",
    tokenFactory: () => "token_123",
  });

  assert.deepEqual(result, {
    ok: true,
    code: "AB12CD-EF34",
    testId: "pleasing-personality-depth",
    accessToken: "token_123",
    redeemedAt: "2026-05-13T11:00:00.000Z",
  });
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /\/databases\/db_test\/query$/);
  assert.match(calls[1].url, /\/pages\/page_unused$/);
  assert.equal(JSON.parse(calls[1].options.body).properties["状态"].status.name, "已使用");
});
