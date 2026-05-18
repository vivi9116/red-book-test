import { Buffer } from "node:buffer";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_IMAGE_SIZE = "1680x2240";
const FOLDER = "web/assets/free-tests/physical-vs-psychological-like";

const rawStyle = `3:4竖版，小红书手帐拼贴风，温暖米色旧纸背景，真实撕纸毛边，翻开的日记本/关系笔记，白边人物贴纸，旧照片拼贴，便签，胶带，回形针，干花，爱心，红笔箭头，铅笔涂鸦。
整体像“测试日记 / 情绪手帐 / 关系观察笔记”，精致、自然、可以直接发小红书。
不要像网页截图，不要像PPT，不要像简单海报，不要出现大白框、透明卡片、大圆角卡片。
必须留出干净的撕纸标题区和日记本横线纸面，方便后期写清晰中文。装饰只能放在边缘，不能进入主要书写区域。
画面里不要出现任何文字、数字、英文字母、乱码、水印。`;

const directPages = [
  {
    file: "01-cover.png",
    prompt: `生成一张 3:4 竖版小红书轮播封面图，主题是“你对TA是生理性喜欢还是心理性喜欢？”
必须是小红书手帐拼贴风，像测试日记、情绪手帐、关系观察笔记，不要像网页截图、不要像简单海报、不要空白、不要只有文字。

画面必须包含：
1. 左上角白色小纸条，写“懂你的X学姐”，旁边有小爱心。
2. 顶部大块奶油黄撕纸标题，粗手写中文大字，分三行写：
你对TA
是生理性喜欢
还是心理性喜欢？
3. 标题下方有奶油黄小胶囊，写“10题测一测”。
4. 中间是翻开的日记本/关系笔记，日记本中央有一个年轻女生剪贴背影，白边贴纸感，低饱和橄榄绿上衣，正在看手机消息。
5. 旁边有两张旧照片拼贴：一张是心动靠近的瞬间，一张是安静聊天的瞬间。
6. 画面有便签、胶带、回形针、干花、爱心、箭头、红笔划线、铅笔涂鸦。
7. 底部撕纸说明写：每题选最像你的答案，算好总分。

色彩：温暖米色旧纸背景，低饱和豆沙红、橄榄绿、奶油黄、浅棕色。
质感：真实旧纸纹理、撕纸毛边、纸张阴影、白边贴纸、复古手帐。
文字必须清晰可读，整体像小红书原生测试图。
严格使用简体中文，不要出现错别字、乱码、无意义字符。除“TA”和“X学姐”外，不要乱写英文字母。`,
  },
];

const rawPages = [
  {
    file: ".raw-02-q1-3.png",
    prompt: `${rawStyle}
第1-3题底图。顶部是一条空白棕色撕纸标题条，中间是一页翻开的空白横线日记本纸，日记本从画面约四分之一高度开始，占据画面中下部，纸面中间必须干净，适合写三道测试题。
女生头像白边贴纸、回形针、旧照片、干花只能放在左右边缘或角落，不能压到纸面中间。底部留一张空白奶油黄撕纸提示条。`,
  },
  {
    file: ".raw-03-q4-6.png",
    prompt: `${rawStyle}
第4-6题底图。顶部是一条空白棕色撕纸标题条，中间是一页翻开的空白横线日记本纸，日记本从画面约四分之一高度开始，占据画面中下部，纸面中间必须干净，适合写三道测试题。
电影票样式贴纸、女生白边贴纸、胶带、干花和回形针只能放在左右边缘或角落，不能压到纸面中间。底部留一张空白小撕纸提示条。`,
  },
  {
    file: ".raw-04-q7-9.png",
    prompt: `${rawStyle}
第7-9题底图。顶部是一条空白棕色撕纸标题条，中间是一页翻开的空白横线日记本纸，日记本从画面约四分之一高度开始，占据画面中下部，纸面中间必须干净，适合写三道测试题。
异地聊天手机贴纸、旧照片、便签、胶带、干花和人物白边贴纸只能放在左右边缘或角落，不能压到纸面中间。底部留一张空白小撕纸提示条。`,
  },
  {
    file: ".raw-05-q10-result.png",
    prompt: `${rawStyle}
最后1题和结果页底图。顶部是一条空白棕色撕纸标题条，中间是一页翻开的空白横线日记本纸，上方留题目区域，下方留三张空白手帐便签，主要书写区域必须干净。
底部留一张空白豆沙红或奶油黄撕纸提示条，周围有旧照片拼贴、人物贴纸、胶带、回形针、干花、爱心和红笔箭头。`,
  },
];

const pages = [
  {
    file: "02-q1-3.png",
    raw: ".raw-02-q1-3.png",
    title: "10题自测｜第1-3题",
    footer: "记下每题分数，最后算总分。",
    questions: [
      ["1. 看到对方第一眼，你最先关注的是？", ["A. 颜值、身材、穿搭等外在形象（3分）", "B. 眼神、气质、说话的感觉（2分）", "C. 说不上来，就是莫名舒服（1分）"]],
      ["2. 和对方独处时，你最强烈的感受是？", ["A. 想靠近，有肢体接触的冲动（3分）", "B. 心跳加速，紧张又害羞（2分）", "C. 内心平静，觉得安心又放松（1分）"]],
      ["3. 对方长时间不回消息，你的反应是？", ["A. 烦躁焦虑，只想立刻见到对方（3分）", "B. 胡思乱想，担心对方不在意自己（2分）", "C. 理解对方在忙，不会过度内耗（1分）"]],
    ],
  },
  {
    file: "03-q4-6.png",
    raw: ".raw-03-q4-6.png",
    title: "10题自测｜第4-6题",
    footer: "选最符合你真实想法的答案。",
    questions: [
      ["4. 你喜欢和对方做的事更多是？", ["A. 约会、逛街、看电影等具象互动（3分）", "B. 聊天谈心，分享日常和心事（2分）", "C. 哪怕各做各的，待在一起就好（1分）"]],
      ["5. 对方犯错让你生气时，你会？", ["A. 看到脸就消气，很难真正计较（3分）", "B. 生气但舍不得凶，很快会原谅（2分）", "C. 理性沟通，希望对方真的改正（1分）"]],
      ["6. 想到对方时，脑海里更多的是？", ["A. 对方的外貌、靠近的瞬间（3分）", "B. 对方的性格、有趣的言行（2分）", "C. 和对方在一起的踏实感（1分）"]],
    ],
  },
  {
    file: "04-q7-9.png",
    raw: ".raw-04-q7-9.png",
    title: "10题自测｜第7-9题",
    footer: "还有最后1题，别忘啦。",
    questions: [
      ["7. 别人夸赞对方时，你更在意？", ["A. 夸赞长相、外形条件（3分）", "B. 夸赞性格、人品教养（2分）", "C. 夸赞对方和你很般配（1分）"]],
      ["8. 异地见不到对方时，你会？", ["A. 极度想念，渴望肢体陪伴（3分）", "B. 精神寄托，每天都想聊天（2分）", "C. 各自安好，见面时更珍惜（1分）"]],
      ["9. 你喜欢对方的点，更多源于？", ["A. 本能的吸引，没有具体理由（3分）", "B. 相处久了，慢慢产生好感（2分）", "C. 三观契合，精神层面的共鸣（1分）"]],
    ],
  },
  {
    file: "05-q10-result.png",
    raw: ".raw-05-q10-result.png",
    title: "10题自测｜最后1题",
    footer: ["算好总分，最后一页见", "看你更偏哪一种喜欢"],
    questions: [["10. 设想未来，你更看重？", ["A. 对方外在条件是否符合期待（3分）", "B. 相处是否开心快乐（2分）", "C. 灵魂契合，能否携手同行（1分）"]]],
    results: ["10-15分：更偏心理性喜欢", "16-23分：两种喜欢都有", "24-30分：更偏生理性喜欢"],
  },
];

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

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function text(value, x, y, size, options = {}) {
  const {
    color = "#432514",
    weight = 700,
    anchor = "start",
    family = "'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif",
    rotate = 0,
    letterSpacing = 0,
  } = options;
  const transform = rotate ? ` transform="rotate(${rotate} ${x} ${y})"` : "";
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}" letter-spacing="${letterSpacing}"${transform}>${esc(value)}</text>`;
}

function brand() {
  return [
    text("懂你的X学姐", 160, 155, 54, { weight: 500, rotate: -2 }),
    text("❤", 625, 150, 46, { color: "#c94f60", weight: 700, rotate: -5 }),
  ].join("");
}

function coverOverlay(page) {
  return `
  ${brand()}
  ${text(page.title[0], 840, 535, 78, { anchor: "middle", weight: 700 })}
  ${text(page.title[1], 840, 685, 96, { anchor: "middle", color: "#b24352", weight: 800 })}
  ${text(page.title[2], 840, 840, 96, { anchor: "middle", color: "#b24352", weight: 800 })}
  ${text(page.badge, 840, 1080, 54, { anchor: "middle", weight: 800 })}
  ${text(page.footer, 840, 2085, 58, { anchor: "middle", color: "#a43b4b", weight: 800 })}
`;
}

function questionLines(question, startY) {
  const [title, options] = question;
  const lines = [text(title, 290, startY, 43, { weight: 700, rotate: -1 })];
  let y = startY + 74;
  for (const option of options) {
    lines.push(text(option, 345, y, 37, { weight: 500, rotate: -1 }));
    y += 58;
  }
  return lines.join("");
}

function questionsOverlay(page) {
  const starts = page.questions.length === 1 ? [720] : [590, 1010, 1430];
  return `
  ${brand()}
  ${text(page.title, 840, 330, 68, { anchor: "middle", color: "#9f3348", weight: 800, rotate: -1 })}
  ${page.questions.map((question, index) => questionLines(question, starts[index])).join("")}
  ${text(page.footer, 840, 2090, 58, { anchor: "middle", color: "#a43b4b", weight: 800, rotate: -1 })}
`;
}

function resultOverlay(page) {
  return `
  ${questionsOverlay({ ...page, footer: "" })}
  ${page.results.map((line, index) => text(line, 360, 1235 + index * 82, 48, { color: "#a43b4b", weight: 800, rotate: -1 })).join("")}
  ${text(page.footer[0], 840, 1975, 50, { anchor: "middle", color: "#a43b4b", weight: 800 })}
  ${text(page.footer[1], 840, 2052, 46, { anchor: "middle", color: "#a43b4b", weight: 800 })}
`;
}

function overlaySvg(page) {
  const body = Array.isArray(page.footer) ? resultOverlay(page) : questionsOverlay(page);
  return Buffer.from(`<svg width="1680" height="2240" viewBox="0 0 1680 2240" xmlns="http://www.w3.org/2000/svg">${body}</svg>`);
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const responseText = await response.text();
  if (!response.ok) throw new Error(`Request failed ${response.status} ${response.statusText}: ${responseText}`);
  return responseText ? JSON.parse(responseText) : {};
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

async function composeImages() {
  const sharp = (await import("sharp")).default;
  for (const page of pages) {
    const rawPath = path.join(FOLDER, page.raw);
    const outputPath = path.join(FOLDER, page.file);
    await sharp(rawPath)
      .resize(1680, 2240, { fit: "cover" })
      .composite([{ input: overlaySvg(page), left: 0, top: 0 }])
      .png()
      .toFile(outputPath);
    console.log(`Composed ${page.file}`);
  }
}

async function main() {
  loadLocalEnv();
  const testId = process.argv[2] || "physical-vs-psychological-like";
  if (testId !== "physical-vs-psychological-like") throw new Error(`Unknown free test id: ${testId}`);

  await mkdir(FOLDER, { recursive: true });
  await writeFile(
    path.join(FOLDER, "image-prompts.md"),
    [...directPages, ...rawPages].map((item) => `# ${item.file}\n\n${item.prompt}\n`).join("\n"),
    "utf8"
  );

  for (const item of directPages) {
    await generateArkImage(item.prompt, path.join(FOLDER, item.file));
    console.log(`Generated ${item.file}`);
  }

  for (const item of rawPages) {
    await generateArkImage(item.prompt, path.join(FOLDER, item.file));
    console.log(`Generated ${item.file}`);
  }
  await composeImages();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
