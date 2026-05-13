# XHS Emotion Test Content Automation

This repository runs a GitHub Actions workflow that generates Xiaohongshu single-image content drafts for an emotion-test account.

The workflow reads the active test from Notion, creates content angles when needed, generates one resonance post and one conversion post, creates an image with Volcengine Ark Seedream, and writes the draft back to Notion.

## Paid test web app

The responsive paid test prototype is in `web/`.

Open `web/index.html` in a browser to try it. It is a static app, so it does not need a backend or build step.

Included modules:

- 36-question paid version of the pleasing-personality test
- 6 result types
- Dimension score bars
- Origin explanation
- Relationship pattern explanation
- Change path
- Mobile, tablet, and desktop responsive layouts

Validation:

```text
npm run validate:web
```

### One-time redeem codes on Vercel + Notion

The test page now shows a redeem-code screen before the test starts.

- First successful redemption is saved in the user's browser with `localStorage`
- The same user can reopen the page and test again on the same browser/device
- A shared code cannot be reused once the Vercel API marks it as used in Notion

Deploy the paid test on Vercel from the repository root. `vercel.json` serves the static app from `web/` and keeps `/api/redeem` as a serverless API route.

Frontend config:

`web/config.js` points the page to the same-origin Vercel API:

```html
<script src="./config.js"></script>
<script src="./app.js" defer></script>
```

Vercel environment variables:

```text
NOTION_TOKEN=<your Notion integration token>
NOTION_REDEEM_DATABASE_ID=<your redeem-code database id>
```

Create a Notion database for redeem codes with these properties:

```text
兑换码       title
测试ID       text
状态         status or select, with 未使用 and 已使用
使用时间     date
访问令牌     text
```

Optional Vercel variables if you want different Notion property names:

```text
REDEEM_CODE_PROPERTY=兑换码
REDEEM_STATUS_PROPERTY=状态
REDEEM_STATUS_PROPERTY_TYPE=status
REDEEM_TEST_ID_PROPERTY=测试ID
REDEEM_USED_AT_PROPERTY=使用时间
REDEEM_ACCESS_TOKEN_PROPERTY=访问令牌
REDEEM_UNUSED_CODE_STATUS=未使用
REDEEM_USED_CODE_STATUS=已使用
```

If your Notion `状态` property is a Select column instead of a Status column, set `REDEEM_STATUS_PROPERTY_TYPE=select`.

Generate codes:

```text
npm run generate:codes -- 100 pleasing-personality-depth
```

Import the generated CSV into the Notion redeem-code database. After a Xiaohongshu buyer pays, copy one row whose `状态` is `未使用`, send that `兑换码` to the buyer, and let the API change the row to `已使用` after redemption.

## Required GitHub Secrets

Add these in `Settings -> Secrets and variables -> Actions -> New repository secret`:

```text
ARK_API_KEY
NOTION_TOKEN
NOTION_TEST_DATABASE_ID=ee729d8b490d4d678606d48ea4f34c85
NOTION_ANGLE_DATABASE_ID=fb197fd302974a168ca35048ee54129d
NOTION_CONTENT_DATABASE_ID=cb65950acb9f437cb29e552144ef3f30
```

## Optional GitHub Variables

Add these in `Settings -> Secrets and variables -> Actions -> Variables` if you want to override defaults:

```text
TEXT_PROVIDER=doubao
IMAGE_PROVIDER=doubao
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_TEXT_MODEL=<your text model or ep- endpoint>
DOUBAO_IMAGE_MODEL=doubao-seedream-4-0-250828
DOUBAO_IMAGE_SIZE=1728x2160
DOUBAO_IMAGE_RESPONSE_FORMAT=<optional; leave empty for endpoint defaults>
XHS_TARGET_TEST_NAME=<optional exact Notion test name>
```

## Manual run

Go to `Actions -> XHS Content Automation -> Run workflow`.

Use mode:

- `auto`
- `both`
- `resonance`
- `conversion`

## Smoke test

Run `Actions -> Secrets Smoke Test -> Run workflow` first. It checks GitHub Secrets, Notion access, and Doubao text API access without generating images.

## Notion dashboard

https://www.notion.so/35e486c7f2f5817a9ab0ed7c47d1f659
