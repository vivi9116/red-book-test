# Paid Emotion Test Web

This repository hosts the paid psychological test web app, Vercel API routes, and Notion redeem-code flow.

It no longer contains the scheduled Xiaohongshu content automation workflow. The current scope is:

- Paid test page
- Redeem-code gate
- Vercel API for redeeming codes
- Vercel API for generating codes into Notion
- Xiaohongshu cover image and long-form sales copy as manual product assets

## Paid Test Web App

The responsive paid test is in `web/`.

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

## One-Time Redeem Codes

The test page shows a redeem-code screen before the test starts.

- First successful redemption is saved in the user's browser with `localStorage`
- The same user can reopen the page and test again on the same browser/device
- A shared code cannot be reused once the Vercel API marks it as used in Notion
- Notion only needs two columns: `兑换码` and `状态`

Deploy the paid test on Vercel from the repository root. `vercel.json` serves the static app from `web/` and keeps `/api/redeem` and `/api/generate-codes` as serverless API routes.

Create a Notion database for redeem codes with these properties:

```text
兑换码       title
状态         select, with 未使用 and 已使用
```

Because the current Notion database uses a Select column for `状态`, set this Vercel variable:

```text
REDEEM_STATUS_PROPERTY_TYPE=select
```

Required Vercel environment variables:

```text
NOTION_TOKEN=<your Notion integration token>
NOTION_REDEEM_DATABASE_ID=2546cabcf4f14f9a9e4538bec70fdb68
REDEEM_ADMIN_TOKEN=<a private admin password for generating codes>
REDEEM_STATUS_PROPERTY_TYPE=select
```

Optional Vercel variables if you want different Notion property names:

```text
REDEEM_CODE_PROPERTY=兑换码
REDEEM_STATUS_PROPERTY=状态
REDEEM_UNUSED_CODE_STATUS=未使用
REDEEM_USED_CODE_STATUS=已使用
```

Generate codes through Vercel:

```text
POST https://your-vercel-domain.vercel.app/api/generate-codes
Content-Type: application/json

{
  "adminToken": "your REDEEM_ADMIN_TOKEN",
  "count": 50
}
```

The API writes 50 rows into Notion with `状态 = 未使用` and returns the generated codes. After a Xiaohongshu buyer pays, copy one unused `兑换码` from Notion and send it to the buyer.

Local backup generation is still available:

```text
npm run generate:codes -- 100
```

## Xiaohongshu Sales Assets

Manual Xiaohongshu assets for each paid test live under:

```text
assets/xiaohongshu/<test-id>/
```

Current paid test:

```text
assets/xiaohongshu/pleasing-personality-depth/
```

Expected files:

```text
README.md
cover-prompt.md
long-copy.md
cover.png
```

`cover.png` is the final generated image. The prompt and long-form copy are committed as editable source files.

## Deployment

Current Vercel production URL:

```text
https://red-book-test-xi.vercel.app/
```

After changing environment variables in Vercel, redeploy the project so the API routes read the latest values.

## Tests

```text
npm test
npm run validate:web
```
