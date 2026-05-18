import { Buffer } from "node:buffer";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_IMAGE_SIZE = "1680x2240";
const FOLDER = "web/assets/free-tests/physical-vs-psychological-like";

const baseStyle = `生成一张 3:4 竖版小红书轮播图。
必须是小红书手帐拼贴风，像测试日记、情绪手帐、关系观察笔记。
画面要像豆包原生生成的精致手帐图，不要像网页截图、不要像PPT、不要像简单海报、不要像后期叠字模板。
背景是温暖米色旧纸，有真实纸纹、撕纸毛边、纸张阴影和复古手帐质感。
必须有翻开的日记本/关系笔记、白边人物贴纸、旧照片拼贴、便签、胶带、回形针、干花、爱心、箭头、红笔划线、铅笔涂鸦。
文字必须像直接写在撕纸和日记本纸面上，不能用大白框、透明卡片、大圆角卡片压住底图。
左上角白色小撕纸写“懂你的X学姐”，旁边可以有小爱心。
色彩使用低饱和豆沙红、橄榄绿、奶油黄、浅棕色。
严格使用简体中文，不要出现错别字、乱码、无意义字符。除“TA”和“X学姐”外，不要乱写英文字母。`;

const prompts = [
  {
    file: "01-cover.png",
    prompt: `${baseStyle}
封面图，主题是“你对TA是生理性喜欢还是心理性喜欢？”
画面构图必须接近：上半部分是大块奶油黄撕纸标题，下半部分是翻开的日记本和拼贴素材。
顶部大块撕纸标题，粗手写中文大字，分三行写：
你对TA
是生理性喜欢
还是心理性喜欢？
标题下方有奶油黄小胶囊，写“10题测一测”。
日记本中央有一个年轻女生剪贴背影，白边贴纸感，低饱和橄榄绿上衣，正在看手机消息。
旁边有两张旧照片拼贴：一张是心动靠近的瞬间，一张是安静聊天的瞬间。
底部撕纸说明写：每题选最像你的答案，算好总分。`,
  },
  {
    file: "02-q1-3.png",
    prompt: `${baseStyle}
第1-3题。
画面构图必须接近：顶部是棕色撕纸标题，主体是一页翻开的日记本，题目直接写在日记本横线纸面上，右侧可有女生头像白边贴纸和回形针，底部是奶油黄撕纸提示。
顶部大块撕纸标题写：10题自测｜第1-3题

中间日记本纸张上必须逐字写：
1. 看到对方第一眼，你最先关注的是？
A. 颜值、身材、穿搭等外在形象（3分）
B. 眼神、气质、说话的感觉（2分）
C. 说不上来，就是莫名舒服（1分）

2. 和对方独处时，你最强烈的感受是？
A. 想靠近，有肢体接触的冲动（3分）
B. 心跳加速，紧张又害羞（2分）
C. 内心平静，觉得安心又放松（1分）

3. 对方长时间不回消息，你的反应是？
A. 烦躁焦虑，只想立刻见到对方（3分）
B. 胡思乱想，担心对方不在意自己（2分）
C. 理解对方在忙，不会过度内耗（1分）

装饰：女生剪贴白边贴纸、手机聊天便签、旧照片拼贴、胶带、回形针、干花、爱心、箭头、红笔划线、铅笔涂鸦。
底部奶油黄撕纸写：记下每题分数，最后算总分。
绝对不要写“分岔数”“答题分岔数”。`,
  },
  {
    file: "03-q4-6.png",
    prompt: `${baseStyle}
第4-6题。
画面构图必须接近：顶部是棕色撕纸标题，主体是一页翻开的日记本，题目直接写在日记本横线纸面上，旁边有电影票、女生贴纸、胶带和干花，底部是小撕纸提示。
顶部大块撕纸标题写：10题自测｜第4-6题

中间日记本纸张上必须逐字写：
4. 你喜欢和对方做的事更多是？
A. 约会、逛街、看电影等具象互动（3分）
B. 聊天谈心，分享日常和心事（2分）
C. 哪怕各做各的，待在一起就好（1分）

5. 对方犯错让你生气时，你会？
A. 看到脸就消气，很难真正计较（3分）
B. 生气但舍不得凶，很快会原谅（2分）
C. 理性沟通，希望对方真的改正（1分）

6. 想到对方时，脑海里更多的是？
A. 对方的外貌、靠近的瞬间（3分）
B. 对方的性格、有趣的言行（2分）
C. 和对方在一起的踏实感（1分）

装饰：女生剪贴白边贴纸、电影票旧照片、聊天便签、胶带、回形针、干花、爱心、箭头、红笔划线、铅笔涂鸦。
底部小撕纸写：选最符合你真实想法的答案。
电影票可以只画图案，不要写无意义文字。
绝对不要写“真务”“缘眼”“沟通希望对方的改正”“的改正”。`,
  },
  {
    file: "04-q7-9.png",
    prompt: `${baseStyle}
第7-9题。
画面构图必须接近：顶部是棕色撕纸标题，主体是一页翻开的日记本，题目直接写在日记本横线纸面上，旁边有异地聊天手机、旧照片、便签、胶带、干花和人物贴纸。
顶部大块撕纸标题写：10题自测｜第7-9题

中间日记本纸张上必须逐字写：
7. 别人夸赞对方时，你更在意？
A. 夸赞长相、外形条件（3分）
B. 夸赞性格、人品教养（2分）
C. 夸赞对方和你很般配（1分）

8. 异地见不到对方时，你会？
A. 极度想念，渴望肢体陪伴（3分）
B. 精神寄托，每天都想聊天（2分）
C. 各自安好，见面时更珍惜（1分）

9. 你喜欢对方的点，更多源于？
A. 本能的吸引，没有具体理由（3分）
B. 相处久了，慢慢产生好感（2分）
C. 三观契合，精神层面的共鸣（1分）

装饰：女生剪贴白边贴纸、异地聊天手机、旧照片拼贴、便签、胶带、回形针、干花、爱心、箭头、红笔划线、铅笔涂鸦。
底部小撕纸写：还有最后1题，别忘啦。
绝对不要写“别漏啦”。`,
  },
  {
    file: "05-q10-result.png",
    prompt: `${baseStyle}
最后1题和结果页。
画面构图必须接近：顶部是棕色撕纸标题，主体是一页翻开的日记本，最后一题写在上方，结果分数写在下方三张手帐便签里，底部是豆沙红或奶油黄撕纸提示。
顶部大块撕纸标题写：10题自测｜最后1题

日记本上方必须逐字写：
10. 设想未来，你更看重？
A. 对方外在条件是否符合期待（3分）
B. 相处是否开心快乐（2分）
C. 灵魂契合，能否携手同行（1分）

日记本下方用三张手帐便签写：
10-15分：更偏心理性喜欢
16-23分：两种喜欢都有
24-30分：更偏生理性喜欢

底部豆沙红撕纸写：
算好总分，最后一页见
看你更偏哪一种喜欢
装饰：中心人物剪贴白边贴纸、旧照片拼贴、便签、胶带、回形针、干花、爱心、箭头、红笔划线、铅笔涂鸦。
不要写评论引导句。`,
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

async function main() {
  loadLocalEnv();
  const testId = process.argv[2] || "physical-vs-psychological-like";
  if (testId !== "physical-vs-psychological-like") throw new Error(`Unknown free test id: ${testId}`);

  await mkdir(FOLDER, { recursive: true });
  await writeFile(path.join(FOLDER, "image-prompts.md"), prompts.map((item) => `# ${item.file}\n\n${item.prompt}\n`).join("\n"), "utf8");

  for (const item of prompts) {
    await generateArkImage(item.prompt, path.join(FOLDER, item.file));
    console.log(`Generated ${item.file}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
