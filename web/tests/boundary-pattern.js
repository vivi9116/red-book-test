const resultTypeKeys = [
  "over-giver",
  "guilt-softener",
  "conflict-avoider",
  "hard-wall-builder",
  "self-erasing-adapter",
  "clear-boundary-holder",
];

const dimensions = [
  { key: "requestPressure", name: "请求压力" },
  { key: "guiltResponse", name: "愧疚反应" },
  { key: "conflictTolerance", name: "冲突承受" },
  { key: "selfSpace", name: "自我空间" },
  { key: "responsibilitySplit", name: "责任分清" },
  { key: "repairExpression", name: "表达修复" },
];

const optionTexts = {
  "over-giver": [
    "我会先答应下来，之后再想自己能不能承受。",
    "我习惯多做一点，怕别人觉得我不够好相处。",
    "我经常把别人的急事也变成自己的任务。",
    "我会先照顾现场顺不顺，很少马上确认自己的余量。",
    "我容易用付出来维持关系里的安全感。",
    "我常常等到很累，才发现自己又接太多了。",
  ],
  "guilt-softener": [
    "我一拒绝就会愧疚，忍不住想解释很久。",
    "我会担心对方失望，哪怕这个要求本来就不合理。",
    "我很怕自己显得冷漠、自私或不近人情。",
    "我说不之后会反复想：是不是我太过分了。",
    "我容易把别人的不开心自动算成自己的责任。",
    "我需要很久才敢相信，拒绝不等于伤害关系。",
  ],
  "conflict-avoider": [
    "我会先把不舒服压下去，避免把关系弄僵。",
    "我宁愿自己委屈一点，也不想当场发生冲突。",
    "我会用沉默、忍耐或转移话题来让气氛过去。",
    "我害怕说清楚之后，对方会冷脸或疏远我。",
    "我经常等到忍不住了，才一次性爆出来。",
    "我最难的是在不撕破脸的情况下表达不愿意。",
  ],
  "hard-wall-builder": [
    "我一旦觉得被越界，会立刻变得很硬。",
    "我会直接拉开距离，让对方知道不能再靠近。",
    "我不太想解释太多，因为解释也像被继续消耗。",
    "我容易从忍到爆，最后边界变成一道墙。",
    "我宁愿显得不好惹，也不想再被随便要求。",
    "我需要练习的不是有边界，而是边界不要只在受伤后出现。",
  ],
  "self-erasing-adapter": [
    "我会先配合别人的节奏，慢慢忘了自己原本想怎样。",
    "我很会调整自己，直到后来分不清那是不是我真正愿意。",
    "我会把自己的计划让出来，好像这样比较省事。",
    "我常用理解别人来替代确认自己。",
    "我容易在关系里变得很好说话，但心里越来越空。",
    "我需要重新听见自己的偏好，而不只是适应关系。",
  ],
  "clear-boundary-holder": [
    "我会先停一下，确认这件事是不是我真的愿意接。",
    "我可以表达不方便，同时保持语气温和。",
    "我会把对方的情绪和我的责任分开看。",
    "我能接受别人短暂失望，但不把它等同于关系坏了。",
    "我愿意协商替代方案，而不是硬扛或突然消失。",
    "我正在练习让边界稳定出现，而不是等到耗尽才出现。",
  ],
};

const resultTypes = [
  {
    key: "over-giver",
    name: "过度承担型",
    short: "总是先接住别人，最后才想起自己",
    summary:
      "你的边界最容易在“别人需要我”的时刻变软。你不是没有原则，而是太习惯先把关系和场面照顾好，等事情过去以后，才发现自己的时间、情绪和体力都被占满了。",
    origin:
      "你可能很早就熟悉一种经验：懂事、能帮忙、少添麻烦，会让关系更稳定。久而久之，你把被需要和被认可绑在了一起。",
    pattern:
      "别人一开口，你先评估对方急不急，而不是先评估自己有没有余量。你越在乎一个人，越容易把对方的任务也接到自己身上。",
    relationshipFocus:
      "你要看的不是自己够不够善良，而是每次答应之前，是否真的给自己留了选择权。",
    actionPractice: "先练习延迟答复，用“我看一下安排再回复你”替代立刻答应。",
    path: ["本周记录三次你差点自动答应的请求。", "每次答应前先问自己：我有多少真实余量？", "删掉一件不是你必须承担的任务。"],
  },
  {
    key: "guilt-softener",
    name: "愧疚软化型",
    short: "一说不，就觉得自己像坏人",
    summary:
      "你的边界常常被愧疚感软化。你知道自己不想答应，但对方一失落、一沉默，或者你想象对方会不开心，你就很容易退回去解释、补偿、让步。",
    origin:
      "你可能把拒绝和伤害关系联系在一起，也可能习惯用“让别人舒服”来证明自己是值得被喜欢的。",
    pattern:
      "你说不以后会反复解释，甚至主动给出更多补偿，让边界从清楚变成模糊。",
    relationshipFocus:
      "你真正要练的不是变冷漠，而是允许别人有失望，同时不把失望全部背到自己身上。",
    actionPractice: "拒绝时只解释一次，避免用过度补偿把边界重新交出去。",
    path: ["准备一句低负担拒绝：这次我不方便。", "观察愧疚出现时，它是在保护什么。", "把对方的情绪还给对方处理。"],
  },
  {
    key: "conflict-avoider",
    name: "冲突回避型",
    short: "宁愿忍一忍，也不想把话说破",
    summary:
      "你不是没有边界，而是很怕边界一说出口，关系就会紧张。于是你常常先忍、先算了、先让气氛过去，直到累积太多才突然爆发或疏远。",
    origin:
      "你可能经历过表达不满会带来冷脸、指责或更大冲突，所以身体学会了先保平安。",
    pattern:
      "当下你看起来很好说话，内心却不断记账。边界没有在小处被表达，最后就容易在大处变成崩溃。",
    relationshipFocus:
      "你的关键练习是把边界提前一点说出来，让关系有机会修正，而不是等到你撑不住才处理。",
    actionPractice: "用具体事实表达一个小不舒服，不上升成对人的评价。",
    path: ["选一个低风险场景说出小边界。", "用“这件事我有点不舒服”开头。", "表达后观察关系是否真的因此崩坏。"],
  },
  {
    key: "hard-wall-builder",
    name: "高墙防御型",
    short: "被越界后，边界会一下子变得很硬",
    summary:
      "你的边界不是太弱，而是经常来得太晚。你前面可能忍了很多，一旦确认自己被消耗或不被尊重，就会迅速筑起高墙，让对方很难再靠近。",
    origin:
      "你可能有过边界被反复忽视的经验，所以学会用强硬、撤离或冷处理来保护自己。",
    pattern:
      "你会从配合跳到拒绝沟通，中间缺少一个温和但清楚的提醒阶段。",
    relationshipFocus:
      "你需要的不是拆掉边界，而是让边界更早、更稳定、更可沟通地出现。",
    actionPractice: "在情绪到 5 分时就表达，不等到 9 分才关门。",
    path: ["给自己的越界信号设一个早期提醒。", "提前说：这件事我需要停一下。", "把撤离时间和回来沟通的时间说清楚。"],
  },
  {
    key: "self-erasing-adapter",
    name: "自我消音型",
    short: "太会适应别人，慢慢听不见自己",
    summary:
      "你很会体谅、配合、调整，但也容易在关系里把自己的偏好降到很小。你不是没有想法，而是太快把“别人比较需要”放到了前面。",
    origin:
      "你可能习惯通过适应环境来获得安全感：少表达、少坚持、少制造麻烦，关系就比较平稳。",
    pattern:
      "你常说随便、都可以、看你，但事后会有一种不被看见的空感。",
    relationshipFocus:
      "你的练习不是马上强势，而是先恢复对自己偏好的感知。",
    actionPractice: "每天做一个小选择，并且不把它立刻让出去。",
    path: ["记录今天我真正想要的三个小偏好。", "在低风险场景表达一次“我更想要”。", "区分体谅别人和取消自己。"],
  },
  {
    key: "clear-boundary-holder",
    name: "清晰守界型",
    short: "能温和表达，也能稳定守住自己",
    summary:
      "你已经有一定边界能力。你能看见自己的余量，也愿意考虑关系里的协商空间。你不是不在乎别人，而是开始学会把别人的需要和自己的责任分开。",
    origin:
      "你可能经过长期练习，逐渐明白稳定关系不需要靠无限退让维持。",
    pattern:
      "你更倾向于提前沟通、给出替代方案，也能接受别人短暂不开心。",
    relationshipFocus:
      "你的重点是保持稳定，不把成长变成新的高标准任务。",
    actionPractice: "继续使用温和而清楚的边界句式，让边界成为关系里的常规语言。",
    path: ["保留一个最有效的边界句。", "每周复盘一次哪些边界被稳定守住。", "把精力投入到真正值得互相尊重的关系里。"],
  },
];

const reportDetails = Object.fromEntries(
  resultTypes.map((type) => [
    type.key,
    {
      coreInsight: type.summary,
      sourceMap: [
        type.origin,
        "这个模式曾经帮助你维持关系里的安全感，但现在也可能让你在靠近别人时先牺牲自己的空间。",
        "它不是你的缺陷，而是一套需要被看见、被更新的关系应对方式。",
      ],
      relationshipPatterns: [
        type.pattern,
        "你越在乎一段关系，越容易把边界表达变成一件需要反复斟酌的事。",
        "当边界没有被及时表达，它会以委屈、冷掉、爆发或突然想逃开的方式回来提醒你。",
      ],
      triggerScenes: [
        "别人临时提出请求，留给你的反应时间很少。",
        "对方表现出失望、沉默或不开心，你开始怀疑自己是不是太过分。",
        "你的计划被不断打断，却又很难马上说出不方便。",
      ],
      strengths: "你很在乎关系质量，也有体谅别人处境的能力，这让你在关系里有温度。",
      risks: "如果边界总是靠消耗自己来维持，关系表面稳定，内里却会慢慢积累疲惫和距离。",
      actionPlan: [
        "先把“我愿不愿意”写下来，再考虑“别人会不会失望”。",
        "准备一句固定边界句，降低临场表达难度。",
        "拒绝时只解释一次，不用反复证明自己是好人。",
        "把对方的情绪和你的责任分开记录。",
        "选择一个低风险关系，练习温和但不退让的表达。",
      ],
    },
  ]),
);

const prompts = [
  ["requestPressure", "别人临时请你帮忙，而你其实已经很累了，你第一反应更像："],
  ["requestPressure", "当对方说“就这一次”时，你更容易："],
  ["requestPressure", "你答应别人之前，最常先考虑的是："],
  ["requestPressure", "你最容易在哪类请求里失去边界："],
  ["requestPressure", "当你发现自己又接太多时，通常已经："],
  ["requestPressure", "如果给你的请求压力命名，它更像："],
  ["guiltResponse", "你拒绝别人后，最容易出现的感觉是："],
  ["guiltResponse", "对方露出失望表情时，你会："],
  ["guiltResponse", "你最怕自己的拒绝被理解成："],
  ["guiltResponse", "你解释边界时，常常会："],
  ["guiltResponse", "愧疚感最容易在什么时候把你拉回去："],
  ["guiltResponse", "你最需要重新相信的是："],
  ["conflictTolerance", "当你想表达不满时，你最常卡在："],
  ["conflictTolerance", "关系气氛变紧时，你通常会："],
  ["conflictTolerance", "你把不舒服压下去的理由常常是："],
  ["conflictTolerance", "如果边界一直没有说出口，最后更可能变成："],
  ["conflictTolerance", "你最想避免的关系画面是："],
  ["conflictTolerance", "你需要练习的冲突方式是："],
  ["selfSpace", "你的个人时间被打断时，你更容易："],
  ["selfSpace", "别人问“你都可以吧”时，你常常："],
  ["selfSpace", "你最容易让出的自我空间是："],
  ["selfSpace", "当你想独处却有人需要你时，你会："],
  ["selfSpace", "你在关系里最容易忽略自己的哪部分："],
  ["selfSpace", "你最想拿回来的空间是："],
  ["responsibilitySplit", "别人情绪不好时，你会自动觉得："],
  ["responsibilitySplit", "当一件事明明不是你的责任，你仍可能："],
  ["responsibilitySplit", "你最难分清的是："],
  ["responsibilitySplit", "你常把关系稳定归因于："],
  ["responsibilitySplit", "当别人没有处理自己的部分时，你会："],
  ["responsibilitySplit", "你需要练习的责任边界是："],
  ["repairExpression", "如果已经被越界了，你更可能："],
  ["repairExpression", "你希望对方如何理解你的边界："],
  ["repairExpression", "表达边界后，你最需要的修复动作是："],
  ["repairExpression", "当对方愿意协商时，你会："],
  ["repairExpression", "你最想拥有的边界状态是："],
  ["repairExpression", "这份测试最想帮你看见的是："],
];

function buildQuestions() {
  return prompts.map(([dimension, text], index) => {
    const start = index % resultTypeKeys.length;
    const keys = [
      resultTypeKeys[start],
      resultTypeKeys[(start + 1) % resultTypeKeys.length],
      resultTypeKeys[(start + 3) % resultTypeKeys.length],
      resultTypeKeys[(start + 5) % resultTypeKeys.length],
    ];

    return {
      id: index + 1,
      dimension,
      text,
      options: keys.map((key, optionIndex) => ({
        id: `${index + 1}-${optionIndex + 1}`,
        text: optionTexts[key][index % optionTexts[key].length],
        scores: { [key]: 4 - optionIndex },
        dimensionScore: 4 - optionIndex,
      })),
    };
  });
}

export const boundaryPatternTest = {
  id: "boundary-pattern",
  layoutVariant: "boundary-lines",
  title: "边界感模式测试",
  subtitle: "看清你在请求、愧疚、冲突和自我空间里，最容易把边界交出去的方式。",
  badge: "36 题深度边界报告",
  theme: {
    name: "red-line-journal",
    motif: "boundary line, door, no-note, relationship ruler",
    colors: {
      background: "#f4efe6",
      surface: "#fff8f1",
      primary: "#a8564a",
      secondary: "#6f7f63",
      ink: "#2f332d",
      muted: "#757066",
      danger: "#9b4a42",
      repair: "#557c6b",
    },
  },
  previewSpec: {
    title: "你的关系边界线报告",
    note: "boundary map",
    metaphor: "一张手帐里的关系距离尺，红线、门牌、被划掉的过度承担清单和温和拒绝便签。",
  },
  previewModules: [
    "你最容易交出边界的场景",
    "愧疚感如何让你退回去",
    "你的过度承担和防御高墙",
    "适合你的第一句边界练习",
  ],
  reportModules: ["主类型", "副倾向", "边界维度", "形成线索", "修复练习"],
  dimensions,
  resultTypes,
  reportDetails,
  questions: buildQuestions(),
};
