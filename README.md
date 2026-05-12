# XHS Emotion Test Content Automation

This repository runs a GitHub Actions workflow that generates Xiaohongshu single-image content drafts for an emotion-test account.

The workflow reads the active test from Notion, creates content angles when needed, generates one resonance post and one conversion post, creates an image with Gemini, and writes the draft back to Notion.

## Required GitHub Secrets

Add these in `Settings -> Secrets and variables -> Actions -> New repository secret`:

```text
GEMINI_API_KEY
NOTION_TOKEN
NOTION_TEST_DATABASE_ID=ee729d8b490d4d678606d48ea4f34c85
NOTION_ANGLE_DATABASE_ID=fb197fd302974a168ca35048ee54129d
NOTION_CONTENT_DATABASE_ID=cb65950acb9f437cb29e552144ef3f30
```

## Optional GitHub Variables

Add these in `Settings -> Secrets and variables -> Actions -> Variables` if you want to override defaults:

```text
GEMINI_TEXT_MODEL=gemini-2.5-flash-lite
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
XHS_TARGET_TEST_NAME=表演型讨好测试
```

## Manual run

Go to `Actions -> XHS Content Automation -> Run workflow`.

Use mode:

- `both`
- `resonance`
- `conversion`

## Smoke test

Run `Actions -> Secrets Smoke Test -> Run workflow` first. It checks GitHub Secrets, Notion access, and Gemini API access without generating images.

## Notion dashboard

https://www.notion.so/35e486c7f2f5817a9ab0ed7c47d1f659
