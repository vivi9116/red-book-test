import { randomBytes } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const count = Number(process.argv[2] || 100);
const testId = process.argv[3] || "pleasing-personality-depth";
const outDir = "generated/redeem-codes";
const date = new Date().toISOString().slice(0, 10);
const csvPath = path.join(outDir, `${testId}-${date}.csv`);
const jsonPath = path.join(outDir, `${testId}-${date}.json`);

function codePart() {
  return randomBytes(3).toString("hex").toUpperCase();
}

const codes = new Set();
while (codes.size < count) {
  codes.add(`${codePart()}-${codePart()}`);
}

await mkdir(outDir, { recursive: true });
const rows = [["兑换码", "测试ID", "状态"], ...[...codes].map((code) => [code, testId, "未使用"])];
const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
const json = [...codes].map((code) => ({ code, testId, status: "未使用" }));

await writeFile(csvPath, `${csv}\n`, "utf8");
await writeFile(jsonPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");

console.log(`Generated ${codes.size} Notion-ready codes: ${csvPath}`);
console.log(`Generated JSON backup: ${jsonPath}`);
