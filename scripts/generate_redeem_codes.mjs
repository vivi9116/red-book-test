import { randomBytes } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const count = Number(process.argv[2] || 100);
const testId = process.argv[3] || "pleasing-personality-depth";
const outDir = "generated/redeem-codes";
const outPath = path.join(outDir, `${testId}-${new Date().toISOString().slice(0, 10)}.jsonl`);

function codePart() {
  return randomBytes(3).toString("hex").toUpperCase();
}

const codes = new Set();
while (codes.size < count) {
  codes.add(`${codePart()}-${codePart()}`);
}

await mkdir(outDir, { recursive: true });
const lines = [...codes].map((code) => JSON.stringify({ key: `code:${code}`, value: { code, testId, status: "unused" } }));
await writeFile(outPath, `${lines.join("\n")}\n`, "utf8");

console.log(`Generated ${codes.size} codes: ${outPath}`);
