import { Buffer } from "node:buffer";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_IMAGE_SIZE = "1680x2240";
const DEFAULT_TEST_ID = "preference-vs-understanding-like";
const PHYSICAL_FOLDER = "web/assets/free-tests/physical-vs-psychological-like";
const PREFERENCE_FOLDER = "web/assets/free-tests/preference-vs-understanding-like";

const rawStyle = `3:4竖版，小红书手帐拼贴风，温暖米色旧纸背景，真实撕纸毛边，翻开的日记本/关系笔记，白边人物贴纸，旧照片拼贴，便签，胶带，回形针，干花，爱心，红笔箭头，铅笔涂鸦。
整体像“测试日记 / 情绪手帐 / 关系观察笔记”，精致、自然、可以直接发小红书。
不要像网页截图，不要像PPT，不要像简单海报，不要出现大白框、透明卡片、大圆角卡片。
必须留出干净的撕纸标题区和日记本横线纸面，方便后期写清晰中文。装饰只能放在边缘，不能进入主要书写区域。
画面里不要出现任何文字、数字、英文字母、乱码、水印。`;

const preferenceRawStyle = `3:4竖版，小红书手帐拼贴风，但这一套主题色必须区别于上一套豆沙红奶油黄：主色是旧信纸米白、灰橄榄、浅牛皮纸、炭黑手写墨迹，只有少量低饱和红笔箭头做点缀。
整体参考“关系观察笔记 / 旧信纸测试页”：一张主要纸面承载正文，排版干净、有呼吸感，像真实写在纸上的测试，不要很多漂浮卡片。
画面必须预留清晰的大面积旧纸正文区、空撕纸标题条、空底部提示条。装饰只放边角：格子胶带、回形针、干花、旧照片、小人物白边贴纸、铅笔爱心。
不要网页截图，不要PPT，不要空白排版，不要大块透明白框，不要规整软件卡片，不要粉色/豆沙红大面积铺色。
画面里不要出现任何文字、数字、英文字母、乱码、水印。`;

const physicalDirectPages = [
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

const physicalRawPages = [
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

const physicalPages = [
  {
    file: "02-q1-3.png",
    raw: ".raw-02-q1-3.png",
    title: "10题自测｜第1-3题",
    footer: "记下分数，最后算总分。",
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
    footer: "选最符合真实想法的一项。",
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

const preferenceDirectPages = [];

const preferenceRawPages = [
  {
    file: ".raw-01-cover.png",
    prompt: `${preferenceRawStyle}
封面底图。上半部分是一块大号浅米白/灰白撕纸标题区，形状自然、有毛边，适合写三行大标题；左上角只留空白位置给账号名，不要做粉色角标。
中间是一页旧信纸关系笔记，中央有年轻女生白边贴纸，正在看手机聊天；两侧有旧照片拼贴：一张像被坚定选择的瞬间，一张像安静谈心的瞬间。
标题下方留一张空白浅牛皮纸小撕纸，底部留一张空白灰白撕纸说明条。画面要像真实手帐拼贴，干净、有秩序，不要大面积粉色或豆沙红。`,
  },
  {
    file: ".raw-02-q1-3.png",
    prompt: `${preferenceRawStyle}
第1-3题底图。顶部是一块空白浅牛皮纸撕纸标题条，下方是一张占画面主体的旧信纸/关系笔记纸面，纸面要完整、干净、适合直接写三道题。
不要三张题卡，不要圆形编号章，不要选项色块。只在边角放回形针、格子胶带、旧照片、小人物贴纸、干花和少量红笔箭头。底部留一张空白灰白撕纸提示条。不要生成任何文字数字。`,
  },
  {
    file: ".raw-03-q4-6.png",
    prompt: `${preferenceRawStyle}
第4-6题底图。顶部是一块空白灰白撕纸标题条，中间是一整页翻开的旧关系笔记纸面，纸面从上到下干净连贯，适合直接写三道题和选项。
不要漂浮题卡，不要透明卡片，不要圆形编号章。边角放灰橄榄胶带、旧照片、线稿情侣贴纸、红笔下划线涂鸦、干花。不要生成任何文字数字。`,
  },
  {
    file: ".raw-04-q7-9.png",
    prompt: `${preferenceRawStyle}
第7-9题底图。顶部是一块空白灰白撕纸标题条，中间是一张大旧信纸，像关系观察笔记页，正文区域连续、干净，适合写三道题。
不要三张票据卡，不要复杂拼贴压住正文。边角放旧照片、线稿情侣贴纸、回形针、干花、灰色铅笔爱心和少量红笔箭头。底部留空白灰白撕纸提示条。不要生成任何文字数字。`,
  },
  {
    file: ".raw-05-q10-result.png",
    prompt: `${preferenceRawStyle}
最后1题和结果页底图。顶部是一块空白灰白或灰橄榄撕纸标题条，中间是一张大旧信纸，上方适合写最后一题，下方并排放三张空白小便签作为结果区。
底部留一张空白灰橄榄或浅牛皮纸撕纸提示条。周围有旧照片、线稿人物贴纸、回形针、干花、少量红笔箭头。不要大面积豆沙红，不要生成任何文字数字。`,
  },
];

const preferencePages = [
  {
    file: "01-cover.png",
    raw: ".raw-01-cover.png",
    layout: "preference-cover",
    title: ["你喜欢一个人", "是想被偏爱", "还是想被理解？"],
    badge: "10题测一测",
    footer: "每题选最像你的一项，算好总分。",
  },
  {
    file: "02-q1-3.png",
    raw: ".raw-02-q1-3.png",
    layout: "preference-questions",
    title: "10题自测｜第1-3题",
    footer: "记下分数，最后算总分。",
    questions: [
      ["1. 对方哪种举动最容易让你心动？", ["A. 明显把你放在特别位置（3分）", "B. 稳定回应你的情绪和需要（2分）", "C. 能听懂你没说出口的话（1分）"]],
      ["2. 关系里，你最想确认的是？", ["A. 我是不是对方的优先选择（3分）", "B. 我们相处是否舒服稳定（2分）", "C. 我能不能安心做真实的自己（1分）"]],
      ["3. 对方忽然冷淡时，你更希望？", ["A. 对方主动哄你，给你确定感（3分）", "B. 对方说明原因，不让你乱猜（2分）", "C. 对方愿意认真聊你的感受（1分）"]],
    ],
  },
  {
    file: "03-q4-6.png",
    raw: ".raw-03-q4-6.png",
    layout: "preference-questions-alt",
    title: "10题自测｜第4-6题",
    footer: "选最符合真实想法的一项。",
    questions: [
      ["4. 收到礼物时，你更在意？", ["A. 对方有没有专门为你用心（3分）", "B. 礼物是否适合你当下需要（2分）", "C. 对方是否真的观察过你（1分）"]],
      ["5. 吵架后，你最想得到的是？", ["A. 对方先靠近，别让你悬着（3分）", "B. 两个人坐下来把话说清楚（2分）", "C. 对方能理解你为什么难过（1分）"]],
      ["6. 朋友夸你们般配时，你更开心的是？", ["A. 对方对你很明显地特别（3分）", "B. 你们相处节奏很舒服（2分）", "C. 你们精神上真的聊得来（1分）"]],
    ],
  },
  {
    file: "04-q7-9.png",
    raw: ".raw-04-q7-9.png",
    layout: "preference-questions-ticket",
    title: "10题自测｜第7-9题",
    footer: "还有最后1题，别忘啦。",
    questions: [
      ["7. 对方很忙时，你更需要？", ["A. 再忙也愿意给你一点回应（3分）", "B. 提前说清安排，让你安心（2分）", "C. 忙完后认真听你说话（1分）"]],
      ["8. 想到未来，你更看重？", ["A. 对方能不能坚定选择你（3分）", "B. 两个人生活节奏是否一致（2分）", "C. 对方能不能理解你的底层想法（1分）"]],
      ["9. 你最怕在关系里出现？", ["A. 被忽略、被放到后面（3分）", "B. 忽冷忽热、没有稳定感（2分）", "C. 不被理解、越说越孤单（1分）"]],
    ],
  },
  {
    file: "05-q10-result.png",
    raw: ".raw-05-q10-result.png",
    layout: "preference-result",
    title: "10题自测｜最后1题",
    footer: ["记住总分和最像的题号", "看你更需要哪一种喜欢"],
    questions: [["10. 最打动你的喜欢是？", ["A. 明目张胆的偏爱和选择（3分）", "B. 稳定陪伴，遇事有回应（2分）", "C. 懂你的沉默，也懂你的脆弱（1分）"]]],
    results: ["10-15分：更想被理解", "16-23分：两种都需要", "24-30分：更想被偏爱"],
  },
];

const TESTS = {
  "physical-vs-psychological-like": {
    folder: PHYSICAL_FOLDER,
    directPages: physicalDirectPages,
    rawPages: physicalRawPages,
    pages: physicalPages,
  },
  "preference-vs-understanding-like": {
    folder: PREFERENCE_FOLDER,
    directPages: preferenceDirectPages,
    rawPages: preferenceRawPages,
    pages: preferencePages,
  },
};

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

function handText(value, x, y, size, options = {}) {
  return text(value, x, y, size, {
    family: "'Noto Serif CJK SC', 'KaiTi', 'STKaiti', 'Microsoft YaHei', serif",
    color: "#1f1712",
    weight: 500,
    ...options,
  });
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

function svgFilters() {
  return `<defs>
    <filter id="paperShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#6b3d24" flood-opacity="0.16"/>
    </filter>
  </defs>`;
}

function rotateGroup(x, y, width, height, degrees, body) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  return `<g transform="rotate(${degrees} ${cx} ${cy})">${body}</g>`;
}

function tornPath(x, y, width, height, notch = 18) {
  return [
    `M ${x + notch} ${y + 8}`,
    `L ${x + width * 0.22} ${y}`,
    `L ${x + width * 0.44} ${y + 10}`,
    `L ${x + width * 0.66} ${y + 2}`,
    `L ${x + width - notch} ${y + 9}`,
    `Q ${x + width + 3} ${y + height * 0.18} ${x + width - 7} ${y + height * 0.36}`,
    `L ${x + width - 3} ${y + height * 0.66}`,
    `Q ${x + width - 14} ${y + height - 4} ${x + width - notch} ${y + height - 8}`,
    `L ${x + width * 0.78} ${y + height}`,
    `L ${x + width * 0.54} ${y + height - 9}`,
    `L ${x + width * 0.31} ${y + height - 1}`,
    `L ${x + notch} ${y + height - 10}`,
    `Q ${x - 4} ${y + height * 0.72} ${x + 7} ${y + height * 0.48}`,
    `L ${x + 2} ${y + height * 0.2}`,
    `Q ${x + 6} ${y + 12} ${x + notch} ${y + 8}`,
    "Z",
  ].join(" ");
}

function paper(x, y, width, height, options = {}) {
  const {
    fill = "#fff7e9",
    stroke = "#d9ae78",
    opacity = 0.86,
    rotate = 0,
    dash = "12 10",
  } = options;
  const body = `<path d="${tornPath(x, y, width, height)}" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="4" stroke-dasharray="${dash}" filter="url(#paperShadow)"/>`;
  return rotate ? rotateGroup(x, y, width, height, rotate, body) : body;
}

function brush(x, y, width, height, color = "#f2c6be", opacity = 0.52, rotate = 0) {
  const body = `<path d="${tornPath(x, y, width, height, 10)}" fill="${color}" fill-opacity="${opacity}"/>`;
  return rotate ? rotateGroup(x, y, width, height, rotate, body) : body;
}

function preferenceBrand() {
  return [
    handText("懂你的X学姐", 150, 170, 54, { weight: 500, rotate: -2 }),
    `<path d="M 520 144 C 540 116, 586 126, 570 168 C 558 198, 524 206, 510 174 C 498 146, 518 142, 520 144 Z" fill="none" stroke="#8e3f33" stroke-width="5" opacity="0.45"/>`,
  ].join("");
}

function preferenceCoverOverlay(page) {
  return `
  ${svgFilters()}
  ${preferenceBrand()}
  ${handText(page.title[0], 955, 405, 96, { anchor: "middle", weight: 700, rotate: -1 })}
  ${handText(page.title[1], 955, 555, 104, { anchor: "middle", weight: 700, rotate: -1 })}
  ${handText(page.title[2], 955, 705, 104, { anchor: "middle", weight: 700, rotate: -1 })}
  ${handText(page.badge, 840, 878, 58, { anchor: "middle", weight: 700, rotate: -2 })}
  ${handText(page.footer, 840, 1985, 55, { anchor: "middle", weight: 600, rotate: -1 })}
`;
}

function splitQuestion(question) {
  const [rawTitle, rawOptions] = question;
  const match = rawTitle.match(/^(\d+)\.\s*(.+)$/);
  return {
    number: match ? match[1] : "",
    title: match ? match[2] : rawTitle,
    options: rawOptions.map((option) => {
      const optionMatch = option.match(/^([A-C])\.\s*(.+)$/);
      return optionMatch ? [optionMatch[1], optionMatch[2]] : ["", option];
    }),
  };
}

function preferenceTitle(page, y = 250, rotate = -1) {
  return `
    ${handText(page.title, 840, y, 70, { anchor: "middle", weight: 600, rotate })}
  `;
}

function preferenceFooter(value, y = 2070) {
  return handText(value, 840, y, 52, { anchor: "middle", weight: 500, rotate: -1 });
}

function preferencePlainQuestion(question, spec) {
  const parsed = splitQuestion(question);
  return `
    ${handText(`${parsed.number}.`, spec.x, spec.y, 48, { weight: 500, rotate: spec.rotate ?? 0 })}
    ${handText(parsed.title, spec.x + 95, spec.y, spec.titleSize ?? 48, { weight: 500, rotate: spec.rotate ?? 0 })}
    ${parsed.options.map(([label, value], optionIndex) => {
      const y = spec.y + 78 + optionIndex * (spec.lineGap ?? 62);
      return handText(`${label}. ${value}`, spec.x + 105, y, spec.optionSize ?? 42, { weight: 500, rotate: spec.rotate ?? 0 });
    }).join("")}
  `;
}

function preferenceQuestionsOverlay(page) {
  const variants = {
    "preference-questions": [
      { x: 275, y: 590, rotate: -0.5 },
      { x: 275, y: 1010, rotate: 0.4 },
      { x: 275, y: 1430, rotate: -0.4 },
    ],
    "preference-questions-alt": [
      { x: 260, y: 565, rotate: -0.4 },
      { x: 260, y: 980, rotate: 0.3 },
      { x: 260, y: 1400, rotate: -0.2 },
    ],
    "preference-questions-ticket": [
      { x: 270, y: 565, rotate: -0.3 },
      { x: 270, y: 970, rotate: 0.3 },
      { x: 270, y: 1380, rotate: -0.2 },
    ],
  };
  const specs = variants[page.layout] ?? variants["preference-questions"];
  return `
    ${svgFilters()}
    ${preferenceBrand()}
    ${preferenceTitle(page)}
    ${page.questions.map((question, index) => preferencePlainQuestion(question, specs[index])).join("")}
    ${preferenceFooter(page.footer)}
  `;
}

function preferenceResultCard(line, x, y, rotate) {
  return handText(line, x, y, 39, { anchor: "middle", weight: 500, rotate });
}

function preferenceResultOverlay(page) {
  const questionSpec = { x: 270, y: 620, rotate: -0.3, titleSize: 50, optionSize: 45, lineGap: 82 };
  return `
    ${svgFilters()}
    ${preferenceBrand()}
    ${preferenceTitle(page)}
    ${preferencePlainQuestion(page.questions[0], questionSpec)}
    ${preferenceResultCard(page.results[0], 440, 1515, -0.6)}
    ${preferenceResultCard(page.results[1], 840, 1515, 0.4)}
    ${preferenceResultCard(page.results[2], 1240, 1515, -0.4)}
    ${handText(page.footer[0], 840, 1940, 52, { anchor: "middle", color: "#f8f0df", weight: 500, rotate: -1 })}
    ${handText(page.footer[1], 840, 2025, 46, { anchor: "middle", color: "#f8f0df", weight: 500, rotate: -1 })}
  `;
}

function overlaySvg(page) {
  let body;
  if (page.layout === "preference-cover") {
    body = preferenceCoverOverlay(page);
  } else if (page.layout === "preference-result") {
    body = preferenceResultOverlay(page);
  } else if (page.layout?.startsWith("preference-")) {
    body = preferenceQuestionsOverlay(page);
  } else {
    body = Array.isArray(page.footer) ? resultOverlay(page) : questionsOverlay(page);
  }
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

async function composeImages(folder, pages) {
  const sharp = (await import("sharp")).default;
  for (const page of pages) {
    const rawPath = path.join(folder, page.raw);
    const outputPath = path.join(folder, page.file);
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
  const testId = process.argv[2] || DEFAULT_TEST_ID;
  const config = TESTS[testId];
  if (!config) throw new Error(`Unknown free test id: ${testId}`);

  await mkdir(config.folder, { recursive: true });
  await writeFile(
    path.join(config.folder, "image-prompts.md"),
    [...config.directPages, ...config.rawPages].map((item) => `# ${item.file}\n\n${item.prompt}\n`).join("\n"),
    "utf8"
  );

  for (const item of config.directPages) {
    await generateArkImage(item.prompt, path.join(config.folder, item.file));
    console.log(`Generated ${item.file}`);
  }

  for (const item of config.rawPages) {
    await generateArkImage(item.prompt, path.join(config.folder, item.file));
    console.log(`Generated ${item.file}`);
  }
  await composeImages(config.folder, config.pages);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
