import { Buffer } from "node:buffer";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_IMAGE_SIZE = "1680x2240";
const DEFAULT_TEST_ID = "preference-vs-understanding-like";
const PHYSICAL_FOLDER = "web/assets/free-tests/physical-vs-psychological-like";
const PREFERENCE_FOLDER = "web/assets/free-tests/preference-vs-understanding-like";
const CANVAS_WIDTH = 1680;
const CANVAS_HEIGHT = 2240;

const rawStyle = `3:4竖版，小红书手帐拼贴风，温暖米色旧纸背景，真实撕纸毛边，翻开的日记本/关系笔记，白边人物贴纸，旧照片拼贴，便签，胶带，回形针，干花，爱心，红笔箭头，铅笔涂鸦。
整体像“测试日记 / 情绪手帐 / 关系观察笔记”，精致、自然、可以直接发小红书。
不要像网页截图，不要像PPT，不要像简单海报，不要出现大白框、透明卡片、大圆角卡片。
必须留出干净的撕纸标题区和日记本横线纸面，方便后期写清晰中文。装饰只能放在边缘，不能进入主要书写区域。
画面里不要出现任何文字、数字、英文字母、乱码、水印。`;

const preferenceRawStyle = `3:4竖版，小红书原生手帐拼贴风，必须像可直接发布的小红书情绪测试图，不要像网页截图、PPT、Word文档、程序画图。
这次是全新重做，不要灰橄榄文档版，不要规整空白大纸页。主题色改成：温暖旧纸米白、浅雾蓝灰、淡牛皮纸、深咖手写墨、少量砖红批注。整体要比上一版更精致、更满、更像真实手帐。
画面结构参考“小红书测试日记 / 关系观察笔记”：撕纸层叠、翻开的日记本、旧照片、便签、胶带、回形针、干花、红笔箭头、铅笔爱心、小人物白边贴纸都要和纸面自然融合。
必须预留清晰的正文书写区域：正文区像真实日记纸或撕纸，不要透明卡片，不要大白框。装饰只压边缘，不能进入主要文字区。
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
封面底图。上方是一块大号奶油旧纸撕纸标题区，撕纸边缘自然，适合后期写三行大标题。
中间是翻开的关系日记本，日记本上有一个年轻女生白边贴纸，正在低头看手机；左右各有一张旧照片拼贴，一张表达“被偏爱”，一张表达“被理解”。照片要真实复古、有白边。
标题下方留一张空白浅牛皮纸小撕纸，底部留一张空白浅雾蓝灰撕纸说明条。画面要丰富但不乱，不能空。`,
  },
  {
    file: ".raw-02-q1-3.png",
    prompt: `${preferenceRawStyle}
第1-3题底图。顶部是一条空白浅牛皮纸撕纸标题条，标题条下面是一页翻开的日记本纸，纸面有淡淡横线，适合后期写三道题。
正文区要从上到下连续，但不要像空白文档；边缘要有胶带、回形针、旧照片、小人物白边贴纸、干花、红笔箭头和铅笔爱心，让文字以后看起来像写在手帐里。
底部留一张空白浅雾蓝灰撕纸提示条。不要生成任何文字数字。`,
  },
  {
    file: ".raw-03-q4-6.png",
    prompt: `${preferenceRawStyle}
第4-6题底图。顶部是一条空白浅雾蓝灰撕纸标题条，中间是翻开的关系笔记页，纸面有自然旧纸纹理和轻微横线，适合后期写三道题。
画面右侧可以有情侣线稿白边贴纸，左下角可以有旧照片和干花，角落有砖红箭头和手绘爱心。所有装饰必须避开正文区。
底部留一张空白浅牛皮纸提示条。不要生成任何文字数字。`,
  },
  {
    file: ".raw-04-q7-9.png",
    prompt: `${preferenceRawStyle}
第7-9题底图。顶部是一条空白奶油撕纸标题条，中间是一页大关系观察笔记，纸面有真实手帐横线和轻微纸纹，适合写三道题。
边角用浅雾蓝灰胶带、回形针、旧照片、线稿情侣贴纸、干花、铅笔爱心和砖红箭头做拼贴，不能压住正文。
底部留一张空白奶油撕纸提示条。不要生成任何文字数字。`,
  },
  {
    file: ".raw-05-q10-result.png",
    prompt: `${preferenceRawStyle}
最后1题和结果页底图。顶部是一条空白浅雾蓝灰撕纸标题条，中间是一张翻开的日记本纸，上半部分适合写最后1题，下半部分放三张空白撕纸便签作为结果区。
三张结果便签要有纸张阴影和毛边，像贴在日记本上。底部留一张空白砖红或浅雾蓝灰撕纸提示条。
周围有旧照片、线稿人物贴纸、回形针、干花、砖红箭头，但不能压正文和结果便签。不要生成任何文字数字。`,
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

function localDefs() {
  return `<defs>
    <filter id="paperShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#55402f" flood-opacity="0.18"/>
    </filter>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#3d3128" flood-opacity="0.2"/>
    </filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.08"/>
      </feComponentTransfer>
    </filter>
  </defs>`;
}

function localCanvas(body, bg = "#efe6d8") {
  return Buffer.from(`<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    ${localDefs()}
    <rect width="1680" height="2240" fill="${bg}"/>
    <rect width="1680" height="2240" filter="url(#grain)" opacity="0.55"/>
    ${body}
  </svg>`);
}

function localPaper(x, y, width, height, fill = "#f8f1e3", stroke = "#d4c0a2", rotate = 0, opacity = 0.96) {
  const body = `<path d="${tornPath(x, y, width, height)}" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="3" filter="url(#paperShadow)"/>`;
  return rotate ? rotateGroup(x, y, width, height, rotate, body) : body;
}

function localTape(x, y, width, height, fill = "#8a9279", rotate = 0, opacity = 0.78) {
  const body = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="3" fill="${fill}" fill-opacity="${opacity}" filter="url(#softShadow)"/>
    <path d="M${x + 15} ${y} L${x + 15} ${y + height} M${x + 55} ${y} L${x + 55} ${y + height} M${x + 95} ${y} L${x + 95} ${y + height}" stroke="#f2eadc" stroke-width="3" opacity="0.45"/>
    <path d="M${x} ${y + height / 2} L${x + width} ${y + height / 2}" stroke="#f2eadc" stroke-width="3" opacity="0.45"/>`;
  return rotate ? rotateGroup(x, y, width, height, rotate, body) : body;
}

function localClip(x, y, scale = 1, rotate = 0) {
  const body = `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M16 0 C3 19, 3 54, 18 76 C33 98, 68 94, 76 66 C83 42, 67 20, 46 24 C41 7, 25 -8, 16 0 Z" fill="none" stroke="#6f7467" stroke-width="7" stroke-linecap="round"/>
    <path d="M35 15 C24 30, 23 57, 35 70 C46 83, 65 74, 64 56 C63 42, 51 32, 42 38" fill="none" stroke="#b6bab0" stroke-width="5" stroke-linecap="round"/>
  </g>`;
  return rotate ? `<g transform="rotate(${rotate} ${x} ${y})">${body}</g>` : body;
}

function localFlower(x, y, scale = 1, rotate = 0) {
  const body = `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M0 155 C18 98, 14 48, 38 0 M4 112 C-22 82,-18 52,12 40 M16 88 C44 64,58 38,56 5" fill="none" stroke="#9b8262" stroke-width="4" opacity="0.75"/>
    ${[[-8,105],[16,88],[38,58],[54,8],[8,40]].map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="11" fill="#eee0c4" stroke="#b89c72" stroke-width="2"/>`).join("")}
  </g>`;
  return rotate ? `<g transform="rotate(${rotate} ${x} ${y})">${body}</g>` : body;
}

function localHeart(x, y, size = 36, color = "#a4453d", rotate = 0, opacity = 0.7) {
  const pathValue = `M ${x} ${y + size * 0.35} C ${x - size * 0.5} ${y - size * 0.1}, ${x - size} ${y + size * 0.55}, ${x} ${y + size} C ${x + size} ${y + size * 0.55}, ${x + size * 0.5} ${y - size * 0.1}, ${x} ${y + size * 0.35}`;
  return `<path d="${pathValue}" fill="none" stroke="${color}" stroke-width="5" opacity="${opacity}" transform="rotate(${rotate} ${x} ${y})"/>`;
}

function localArrow(x1, y1, x2, y2, color = "#b2483d") {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 28;
  const hx1 = x2 - head * Math.cos(angle - Math.PI / 6);
  const hy1 = y2 - head * Math.sin(angle - Math.PI / 6);
  const hx2 = x2 - head * Math.cos(angle + Math.PI / 6);
  const hy2 = y2 - head * Math.sin(angle + Math.PI / 6);
  return `<path d="M${x1} ${y1} C ${(x1 + x2) / 2} ${y1 - 70}, ${(x1 + x2) / 2} ${y2 + 70}, ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"/>
    <path d="M${x2} ${y2} L${hx1} ${hy1} M${x2} ${y2} L${hx2} ${hy2}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"/>`;
}

function ruledLines(x, y, width, count, gap, color = "#cfc5b2") {
  return Array.from({ length: count }, (_, index) => {
    const lineY = y + index * gap;
    return `<path d="M${x} ${lineY} L${x + width} ${lineY}" stroke="${color}" stroke-width="2" opacity="0.52"/>`;
  }).join("");
}

function polaroid(x, y, width, height, rotate = 0, variant = "couple") {
  const innerX = x + 24;
  const innerY = y + 24;
  const innerW = width - 48;
  const innerH = height - 86;
  const people = variant === "single"
    ? `<circle cx="${innerX + innerW * 0.52}" cy="${innerY + innerH * 0.36}" r="${innerW * 0.11}" fill="#7b6556"/>
       <path d="M${innerX + innerW * 0.35} ${innerY + innerH * 0.82} C${innerX + innerW * 0.42} ${innerY + innerH * 0.48},${innerX + innerW * 0.66} ${innerY + innerH * 0.48},${innerX + innerW * 0.72} ${innerY + innerH * 0.82} Z" fill="#d7d0c2"/>`
    : `<circle cx="${innerX + innerW * 0.38}" cy="${innerY + innerH * 0.42}" r="${innerW * 0.09}" fill="#6f5648"/>
       <circle cx="${innerX + innerW * 0.62}" cy="${innerY + innerH * 0.40}" r="${innerW * 0.09}" fill="#3f352f"/>
       <path d="M${innerX + innerW * 0.22} ${innerY + innerH * 0.86} C${innerX + innerW * 0.28} ${innerY + innerH * 0.55},${innerX + innerW * 0.48} ${innerY + innerH * 0.55},${innerX + innerW * 0.52} ${innerY + innerH * 0.86} Z" fill="#d8c4a6"/>
       <path d="M${innerX + innerW * 0.49} ${innerY + innerH * 0.86} C${innerX + innerW * 0.54} ${innerY + innerH * 0.55},${innerX + innerW * 0.73} ${innerY + innerH * 0.55},${innerX + innerW * 0.79} ${innerY + innerH * 0.86} Z" fill="#aeb8a9"/>`;
  const body = `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#fbf7ef" filter="url(#softShadow)"/>
    <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" fill="#c9b08a"/>
    <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" fill="${variant === "cool" ? "#8f9a90" : "#d1b78d"}" opacity="0.55"/>
    <path d="M${innerX} ${innerY + innerH * 0.62} C${innerX + innerW * 0.2} ${innerY + innerH * 0.45},${innerX + innerW * 0.7} ${innerY + innerH * 0.8},${innerX + innerW} ${innerY + innerH * 0.45} L${innerX + innerW} ${innerY + innerH} L${innerX} ${innerY + innerH} Z" fill="#eee0c7" opacity="0.45"/>
    ${people}
  </g>`;
  return rotate ? rotateGroup(x, y, width, height, rotate, body) : body;
}

function stampPhoto(x, y, width, height, rotate = 0, tone = "#bfa77f") {
  const body = `<g>
    <path d="${tornPath(x, y, width, height, 10)}" fill="#fbf7ef" filter="url(#softShadow)"/>
    <rect x="${x + 20}" y="${y + 18}" width="${width - 40}" height="${height - 42}" fill="${tone}" opacity="0.72"/>
    <rect x="${x + 20}" y="${y + 18}" width="${width - 40}" height="${height - 42}" filter="url(#grain)" opacity="0.5"/>
    <path d="M${x + 20} ${y + height - 88} C${x + width * 0.35} ${y + height - 150},${x + width * 0.6} ${y + height - 40},${x + width - 20} ${y + height - 115} L${x + width - 20} ${y + height - 42} L${x + 20} ${y + height - 42} Z" fill="#efe2c9" opacity="0.48"/>
  </g>`;
  return rotate ? rotateGroup(x, y, width, height, rotate, body) : body;
}

function lineSticker(x, y, scale = 1, rotate = 0) {
  const body = `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M38 178 C30 128,31 75,44 32 C54 0,98 0,108 34 C124 85,120 126,110 178 Z" fill="#fffefa" stroke="#1e1a16" stroke-width="5"/>
    <circle cx="76" cy="52" r="24" fill="#fffefa" stroke="#1e1a16" stroke-width="5"/>
    <path d="M64 50 Q75 62 88 50 M64 70 Q76 82 88 70" fill="none" stroke="#1e1a16" stroke-width="4" stroke-linecap="round"/>
  </g>`;
  return rotate ? `<g transform="rotate(${rotate} ${x} ${y})">${body}</g>` : body;
}

function coupleSticker(x, y, scale = 1, rotate = 0) {
  const body = `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M12 170 L26 76 C32 35,74 30,90 70 L112 170 Z" fill="#fffefa" stroke="#201a16" stroke-width="5"/>
    <circle cx="58" cy="48" r="28" fill="#fffefa" stroke="#201a16" stroke-width="5"/>
    <path d="M44 48 Q58 58 72 48" stroke="#201a16" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M112 170 L128 80 C136 38,180 32,194 72 L214 170 Z" fill="#fffefa" stroke="#201a16" stroke-width="5"/>
    <circle cx="162" cy="50" r="29" fill="#fffefa" stroke="#201a16" stroke-width="5"/>
    <path d="M149 48 Q162 58 175 48" stroke="#201a16" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>`;
  return rotate ? `<g transform="rotate(${rotate} ${x} ${y})">${body}</g>` : body;
}

function coverPersonSticker() {
  return `<g filter="url(#softShadow)">
    <path d="M750 1050 C690 1165,690 1390,760 1500 C810 1575,942 1570,1000 1500 C1078 1407,1035 1150,965 1052 C915 980,795 980,750 1050 Z" fill="#fffefa"/>
    <path d="M790 1120 C735 1235,740 1390,800 1475 C855 1548,930 1538,980 1468 C1032 1390,1000 1210,940 1120 C900 1060,825 1060,790 1120 Z" fill="#aab2a3"/>
    <circle cx="875" cy="1070" r="82" fill="#efd8c8"/>
    <path d="M790 1055 C812 950,956 955,975 1068 C920 1038,855 1030,790 1055 Z" fill="#3d302a"/>
    <rect x="828" y="1246" width="150" height="210" rx="24" fill="#2f3837" transform="rotate(-10 903 1351)"/>
    <rect x="845" y="1265" width="116" height="165" rx="16" fill="#dfe5dc" transform="rotate(-10 903 1351)"/>
  </g>`;
}

function localQuestionBlock(question, x, y, options = {}) {
  const parsed = splitQuestion(question);
  const titleSize = options.titleSize ?? 48;
  const optionSize = options.optionSize ?? 40;
  const lineGap = options.lineGap ?? 58;
  const rotate = options.rotate ?? -0.4;
  return `
    ${handText(`${parsed.number}. ${parsed.title}`, x, y, titleSize, { weight: 500, rotate })}
    ${parsed.options.map(([label, value], index) => handText(`${label}. ${value}`, x + 70, y + 72 + index * lineGap, optionSize, { weight: 500, rotate })).join("")}
  `;
}

function localTitleStrip(title, y = 230, color = "#c8a575", textColor = "#1f1712") {
  return `${localPaper(270, y, 1140, 135, color, "#b28a5d", -1, 0.96)}
    ${handText(title, 840, y + 88, 66, { anchor: "middle", color: textColor, weight: 500, rotate: -1 })}`;
}

function localFooter(textValue, y = 2010, color = "#f3eee4") {
  return `${localPaper(250, y, 1180, 125, color, "#d0c4b2", -1, 0.97)}
    ${handText(textValue, 840, y + 82, 48, { anchor: "middle", weight: 500, rotate: -1 })}`;
}

function localCoverSvg(page) {
  const body = `
    ${localTape(85, 180, 380, 108, "#8c977e", -11, 0.72)}
    ${localTape(1185, 68, 360, 70, "#b5a98d", 2, 0.45)}
    ${preferenceBrand()}
    ${localPaper(245, 235, 1190, 590, "#fff1bf", "#e0c785", -1, 0.98)}
    ${handText(page.title[0], 840, 410, 92, { anchor: "middle", weight: 500, rotate: -1 })}
    ${handText(page.title[1], 840, 570, 102, { anchor: "middle", weight: 500, rotate: -1 })}
    ${handText(page.title[2], 840, 725, 102, { anchor: "middle", weight: 500, rotate: -1 })}
    ${localPaper(610, 850, 460, 110, "#d5b47e", "#b79260", -2, 0.96)}
    ${handText(page.badge, 840, 924, 54, { anchor: "middle", weight: 500, rotate: -2 })}
    ${stampPhoto(180, 1125, 370, 335, -6, "#bfa77f")}
    ${stampPhoto(1135, 1110, 360, 320, 5, "#9fa794")}
    ${coverPersonSticker()}
    ${localFlower(640, 1060, 1.05, -12)}
    ${localArrow(1245, 1010, 1365, 930)}
    ${localHeart(260, 1515, 54, -15, 0.78)}
    ${localClip(1080, 930, 0.85, 4)}
    ${localFooter(page.footer, 1945, "#f4ecdf")}
    ${localFlower(1288, 1882, 0.75, 18)}
    ${localTape(145, 2110, 450, 72, "#8c977e", -2, 0.55)}
  `;
  return localCanvas(body, "#efe8d8");
}

function localQuestionPageSvg(page, variant) {
  const bg = variant === 2 ? "#d7dccf" : variant === 3 ? "#e2e0d9" : "#efe6d6";
  const titleColor = variant === 3 ? "#f8f4ea" : "#c7a174";
  const paperFill = variant === 2 ? "#fbf7ec" : "#f5eddf";
  const sheetRotate = variant === 2 ? -0.5 : variant === 3 ? 1.2 : -0.7;
  const starts = variant === 3 ? [560, 955, 1350] : variant === 2 ? [535, 910, 1285] : [540, 915, 1290];
  const body = `
    ${localTape(40, 270, 430, 100, "#879478", -17, 0.7)}
    ${localTape(1320, 1760, 360, 92, "#879478", -18, 0.68)}
    ${preferenceBrand()}
    ${localTitleStrip(page.title, 220, titleColor, variant === 3 ? "#1f1712" : "#241b15")}
    ${localPaper(135, 395, 1410, 1505, paperFill, "#d5c4a7", sheetRotate, 0.98)}
    ${ruledLines(245, 520, 1180, 22, 62, "#d5c9b7")}
    ${page.questions.map((question, index) => localQuestionBlock(question, 270, starts[index], {
      titleSize: 50,
      optionSize: 41,
      lineGap: 56,
      rotate: variant === 2 ? -0.2 : -0.4,
    })).join("")}
    ${variant === 1 ? stampPhoto(1135, 615, 300, 250, 6, "#bfa77f") : ""}
    ${variant === 2 ? coupleSticker(1185, 515, 1.1, 4) : ""}
    ${variant === 3 ? coupleSticker(1195, 390, 1, 4) : ""}
    ${variant === 1 ? lineSticker(1220, 300, 0.82, 5) : ""}
    ${variant === 2 ? stampPhoto(90, 1535, 275, 245, -7, "#9fa794") : ""}
    ${variant === 3 ? stampPhoto(1190, 760, 230, 205, 8, "#bfa77f") : ""}
    ${localFlower(1280, 1720, 1.08, 18)}
    ${localFlower(100, 1570, 0.92, -20)}
    ${localClip(210, 350, 0.9, -10)}
    ${localClip(1405, 300, 0.65, 12)}
    ${localArrow(1515, 850, 1415, 720)}
    ${localHeart(1270, 1510, 44, 18, 0.48)}
    ${localHeart(450, 845, 34, -8, 0.46)}
    ${localFooter(page.footer, 2010, variant === 2 ? "#d6b482" : "#f1e9dc")}
  `;
  return localCanvas(body, bg);
}

function localResultSvg(page) {
  const body = `
    ${preferenceBrand()}
    ${localTitleStrip(page.title, 210, "#838b73", "#f9f2e6")}
    ${localTape(92, 370, 335, 96, "#879478", -18, 0.72)}
    ${localPaper(150, 405, 1380, 1460, "#f7efe1", "#d4c3a6", -0.5, 0.98)}
    ${ruledLines(260, 560, 1160, 18, 64, "#d6cbb8")}
    ${localQuestionBlock(page.questions[0], 260, 590, { titleSize: 50, optionSize: 43, lineGap: 76, rotate: -0.3 })}
    ${page.results.map((line, index) => {
      const x = 295 + index * 415;
      const [score, result] = line.split("：");
      return `${localPaper(x, 1135, 335, 260, "#eee5d4", "#d1bea0", index === 1 ? 0.5 : -0.6, 0.98)}
        ${handText(`${score}：`, x + 168, 1240, 37, { anchor: "middle", weight: 500, rotate: index === 1 ? 0.5 : -0.6 })}
        ${handText(result, x + 168, 1300, 37, { anchor: "middle", weight: 500, rotate: index === 1 ? 0.5 : -0.6 })}`;
    }).join("")}
    ${coupleSticker(1120, 340, 0.85, 5)}
    ${lineSticker(1285, 700, 0.8, -3)}
    ${stampPhoto(1125, 790, 250, 215, -4, "#9fa794")}
    ${localFlower(92, 1620, 0.9, -12)}
    ${localFlower(1370, 280, 0.82, 12)}
    ${localClip(465, 465, 0.72, 6)}
    ${localClip(120, 1950, 0.75, -8)}
    ${localArrow(1245, 930, 1165, 1035)}
    ${localPaper(215, 1845, 1250, 210, "#838b73", "#6f765f", -0.5, 0.98)}
    ${handText(page.footer[0], 840, 1940, 50, { anchor: "middle", color: "#fbf4e8", weight: 500, rotate: -0.5 })}
    ${handText(page.footer[1], 840, 2020, 48, { anchor: "middle", color: "#fbf4e8", weight: 500, rotate: -0.5 })}
  `;
  return localCanvas(body, "#ece7de");
}

async function renderLocalPreferenceCarousel(folder) {
  const sharp = (await import("sharp")).default;
  await mkdir(folder, { recursive: true });
  const pages = new Map(preferencePages.map((page) => [page.file, page]));
  const outputs = [
    ["01-cover.png", localCoverSvg(pages.get("01-cover.png"))],
    ["02-q1-3.png", localQuestionPageSvg(pages.get("02-q1-3.png"), 1)],
    ["03-q4-6.png", localQuestionPageSvg(pages.get("03-q4-6.png"), 2)],
    ["04-q7-9.png", localQuestionPageSvg(pages.get("04-q7-9.png"), 3)],
    ["05-q10-result.png", localResultSvg(pages.get("05-q10-result.png"))],
  ];
  for (const [file, input] of outputs) {
    await sharp(input).png().toFile(path.join(folder, file));
    console.log(`Rendered ${file}`);
  }
  await writeFile(
    path.join(folder, "image-prompts.md"),
    "# 确定性手帐重做版\n\n这套图片不再使用豆包底图续修，改为程序直接生成完整手帐版式，避免正文和图片不融合、随机压字和错字。\n",
    "utf8"
  );
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
    family: "'AR PL UKai CN', 'AR PL UMing CN', 'KaiTi', 'STKaiti', 'Noto Serif CJK SC', serif",
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
      { x: 335, y: 655, rotate: -0.3 },
      { x: 285, y: 1040, rotate: 0.3 },
      { x: 285, y: 1415, rotate: -0.2 },
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
  const [score, result] = line.split("：");
  return `
    ${handText(`${score}：`, x, y, 38, { anchor: "middle", weight: 500, rotate })}
    ${handText(result, x, y + 62, 38, { anchor: "middle", weight: 500, rotate })}
  `;
}

function preferenceResultOverlay(page) {
  const questionSpec = { x: 270, y: 620, rotate: -0.3, titleSize: 50, optionSize: 45, lineGap: 82 };
  return `
    ${svgFilters()}
    ${preferenceBrand()}
    ${preferenceTitle(page)}
    ${preferencePlainQuestion(page.questions[0], questionSpec)}
    ${preferenceResultCard(page.results[0], 430, 1230, -0.6)}
    ${preferenceResultCard(page.results[1], 840, 1230, 0.4)}
    ${preferenceResultCard(page.results[2], 1250, 1230, -0.4)}
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
