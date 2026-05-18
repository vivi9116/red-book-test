import { Buffer } from "node:buffer";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const WIDTH = 1680;
const HEIGHT = 2240;
const DEFAULT_IMAGE_SIZE = `${WIDTH}x${HEIGHT}`;

const TEST = {
  id: "physical-vs-psychological-like",
  folder: "web/assets/free-tests/physical-vs-psychological-like",
  brand: "懂你的X学姐",
  coverTitle: ["你对TA", "是生理性喜欢", "还是心理性喜欢？"],
  slides: [
    {
      file: "01-cover.png",
      type: "cover",
      heading: "10题测一测",
      footer: "记下你的分数，查看结果",
      prompt: basePrompt("封面背景：翻开的关系日记本，中心是女生看手机的白边贴纸剪贴，左右有旧照片拼贴、便签、胶带、回形针、干花、爱心、红笔箭头。画面上方和底部留出干净撕纸区域，不能出现任何文字、字母、数字、假字、乱码。"),
    },
    {
      file: "02-q1-3.png",
      type: "questions",
      heading: "10题自测｜第1-3题",
      footer: "记下你的分数，查看结果",
      questions: [
        ["1. 看到对方第一眼，你最先关注的是？", ["A. 颜值、身材、穿搭等外在形象（3分）", "B. 眼神、气质、说话的感觉（2分）", "C. 说不上来，就是莫名舒服（1分）"]],
        ["2. 和对方独处时，你最强烈的感受是？", ["A. 想靠近，有肢体接触的冲动（3分）", "B. 心跳加速，紧张又害羞（2分）", "C. 内心平静，觉得安心又放松（1分）"]],
        ["3. 对方长时间不回消息，你的反应是？", ["A. 烦躁焦虑，只想立刻见到对方（3分）", "B. 胡思乱想，担心对方不在意自己（2分）", "C. 理解对方在忙，不会过度内耗（1分）"]],
      ],
      prompt: basePrompt("第1-3题背景：翻开的空白关系笔记本占画面中心，右侧有女生白边贴纸、手机聊天便签、胶带、回形针、干花和爱心涂鸦。日记本页面必须保持干净留白，不能出现任何文字、字母、数字、假字、乱码。"),
    },
    {
      file: "03-q4-6.png",
      type: "questions",
      heading: "10题自测｜第4-6题",
      footer: "记下你的分数，查看结果",
      questions: [
        ["4. 你喜欢和对方做的事更多是？", ["A. 约会、逛街、看电影等具象互动（3分）", "B. 聊天谈心，分享日常和心事（2分）", "C. 哪怕各做各的，待在一起就好（1分）"]],
        ["5. 对方犯错让你生气时，你会？", ["A. 看到脸就消气，很难真正计较（3分）", "B. 生气但舍不得凶，很快会原谅（2分）", "C. 理性沟通，希望对方真的改正（1分）"]],
        ["6. 想到对方时，脑海里更多的是？", ["A. 对方的外貌、靠近的瞬间（3分）", "B. 对方的性格、有趣的言行（2分）", "C. 和对方在一起的踏实感（1分）"]],
      ],
      prompt: basePrompt("第4-6题背景：翻开的空白关系笔记本占画面中心，边缘有电影票、聊天便签、女生白边贴纸、胶带、回形针、干花、红笔箭头和铅笔涂鸦。日记本页面必须保持干净留白，不能出现任何文字、字母、数字、假字、乱码。"),
    },
    {
      file: "04-q7-9.png",
      type: "questions",
      heading: "10题自测｜第7-9题",
      footer: "记下你的分数，查看结果",
      questions: [
        ["7. 别人夸赞对方时，你更在意？", ["A. 夸赞长相、外形条件（3分）", "B. 夸赞性格、人品教养（2分）", "C. 夸赞对方和你很般配（1分）"]],
        ["8. 异地见不到对方时，你会？", ["A. 极度想念，渴望肢体陪伴（3分）", "B. 精神寄托，每天都想聊天（2分）", "C. 各自安好，见面时更珍惜（1分）"]],
        ["9. 你喜欢对方的点，更多源于？", ["A. 本能的吸引，没有具体理由（3分）", "B. 相处久了，慢慢产生好感（2分）", "C. 三观契合，精神层面的共鸣（1分）"]],
      ],
      prompt: basePrompt("第7-9题背景：翻开的空白关系笔记本占画面中心，边缘有异地聊天手机、女生白边贴纸、旧照片拼贴、便签、胶带、回形针、干花、爱心、箭头。日记本页面必须保持干净留白，不能出现任何文字、字母、数字、假字、乱码。"),
    },
    {
      file: "05-q10-result.png",
      type: "result",
      heading: "10题自测｜最后1题",
      footer: "记下你的分数，查看结果",
      questions: [
        ["10. 设想未来，你更看重？", ["A. 对方外在条件是否符合期待（3分）", "B. 相处是否开心快乐（2分）", "C. 灵魂契合，能否携手同行（1分）"]],
      ],
      resultLines: ["10-15分：更偏心理性喜欢", "16-23分：两种喜欢都有", "24-30分：更偏生理性喜欢"],
      prompt: basePrompt("最后1题背景：翻开的空白关系笔记本和结果便签区域，中心有女生白边贴纸、旧照片拼贴、便签、胶带、回形针、干花、爱心、箭头、红笔划线。页面必须保持干净留白，不能出现任何文字、字母、数字、假字、乱码。"),
    },
  ],
};

function basePrompt(scene) {
  return `生成一张 3:4 竖版小红书手帐拼贴风背景图。
风格：温暖米色旧纸背景，大块撕纸标题区域，翻开的日记本/关系笔记，中心人物剪贴，有白边贴纸感，旧照片拼贴、便签、胶带、回形针、干花、爱心、箭头、红笔划线、铅笔涂鸦。
颜色：低饱和豆沙红、橄榄绿、奶油黄、浅棕色。
质感：测试日记、情绪手帐、关系观察笔记、真实旧纸、撕纸毛边、纸张阴影。
重要：不要像网页截图，不要像简单海报，不要空。不要生成任何文字、字母、数字、假字、乱码，所有文字区域都保持空白。
${scene}`;
}

function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] ||= value;
    }
  }
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) throw new Error(`Request failed ${response.status} ${response.statusText}: ${text}`);
  return text ? JSON.parse(text) : {};
}

async function generateArkImage(prompt, outputPath) {
  const apiKey = requiredEnv("ARK_API_KEY");
  const baseUrl = (process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3").replace(/\/+$/, "");
  const model = process.env.DOUBAO_IMAGE_MODEL || "doubao-seedream-4-0-250828";
  const size = process.env.ARK_IMAGE_SIZE || DEFAULT_IMAGE_SIZE;

  const response = await requestJson(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, prompt, size, response_format: "b64_json", watermark: false }),
  });

  const image = response?.data?.[0];
  let buffer;
  if (image?.b64_json) {
    buffer = Buffer.from(image.b64_json, "base64");
  } else if (image?.url) {
    const imageResponse = await fetch(image.url);
    if (!imageResponse.ok) throw new Error(`Image download failed: ${imageResponse.status}`);
    buffer = Buffer.from(await imageResponse.arrayBuffer());
  } else {
    throw new Error("Ark image response did not include b64_json or url");
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buffer);
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function text(x, y, value, size, color = "#4a2a19", weight = 700, anchor = "start") {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}" font-family="Noto Sans CJK SC, Microsoft YaHei, PingFang SC, sans-serif">${esc(value)}</text>`;
}

function paperRect(x, y, w, h, fill = "#fff8e9", stroke = "#e4bf86", opacity = 0.94) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="4"/>`;
}

function overlaySvg(slide) {
  const parts = [
    `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">`,
    paperRect(95, 82, 430, 92, "#fffaf2", "#d5a987", 0.96),
    text(310, 142, TEST.brand, 44, "#3d2416", 700, "middle"),
  ];

  if (slide.type === "cover") {
    parts.push(
      paperRect(170, 220, 1340, 560, "#fbedbd", "#e2c276", 0.95),
      text(840, 370, TEST.coverTitle[0], 100, "#4a2a19", 800, "middle"),
      text(840, 505, TEST.coverTitle[1], 104, "#b44758", 800, "middle"),
      text(840, 650, TEST.coverTitle[2], 104, "#4a2a19", 800, "middle"),
      paperRect(600, 820, 480, 95, "#f5d276", "#d59b42", 0.98),
      text(840, 884, slide.heading, 54, "#3d2416", 800, "middle"),
      paperRect(270, 1968, 1140, 120, "#fff2ca", "#e2bc79", 0.96),
      text(840, 2045, slide.footer, 64, "#a23d4d", 800, "middle")
    );
  } else {
    parts.push(
      paperRect(250, 225, 1180, 132, "#d7ad77", "#c99762", 0.92),
      text(840, 312, slide.heading, 82, "#a23d4d", 800, "middle"),
      paperRect(170, 430, 1340, slide.type === "result" ? 990 : 1360, "#fffaf0", "#ead5b5", 0.94)
    );

    let y = 545;
    for (const [question, options] of slide.questions) {
      parts.push(text(260, y, question, 54, "#4a2a19", 800));
      y += 80;
      for (const option of options) {
        parts.push(text(310, y, option, 43, "#4a2a19", 700));
        y += 62;
      }
      y += 58;
    }

    if (slide.resultLines) {
      parts.push(paperRect(255, 1030, 1170, 305, "#fff2ca", "#e2bc79", 0.97));
      let ry = 1115;
      for (const line of slide.resultLines) {
        parts.push(text(330, ry, line, 48, "#a23d4d", 800));
        ry += 82;
      }
    }

    parts.push(
      paperRect(270, 1968, 1140, 120, "#fff2ca", "#e2bc79", 0.97),
      text(840, 2045, slide.footer, 64, "#a23d4d", 800, "middle")
    );
  }

  parts.push("</svg>");
  return Buffer.from(parts.join(""), "utf8");
}

async function composeText(basePath, outputPath, slide) {
  const sharp = (await import("sharp")).default;
  await sharp(basePath)
    .resize(WIDTH, HEIGHT, { fit: "cover" })
    .composite([{ input: overlaySvg(slide), left: 0, top: 0 }])
    .png()
    .toFile(outputPath);
}

async function main() {
  loadLocalEnv();
  const testId = process.argv[2] || TEST.id;
  if (testId && testId !== TEST.id) throw new Error(`Unknown free test id: ${testId}`);

  await mkdir(TEST.folder, { recursive: true });
  await writeFile(
    path.join(TEST.folder, "image-prompts.md"),
    TEST.slides.map((item) => `# ${item.file}\n\n${item.prompt}\n`).join("\n"),
    "utf8"
  );

  for (const slide of TEST.slides) {
    const rawPath = path.join(TEST.folder, `.raw-${slide.file}`);
    const outputPath = path.join(TEST.folder, slide.file);
    await generateArkImage(slide.prompt, rawPath);
    await composeText(rawPath, outputPath, slide);
    await rm(rawPath, { force: true });
    console.log(`Generated ${slide.file}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
