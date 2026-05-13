const resultTypes = [
  {
    key: "conflict",
    name: "冲突敏感型讨好",
    short: "一冷脸就先道歉",
    summary:
      "你最容易被关系里的冷脸、沉默和语气变化触发。很多时候你不是确定自己做错了，而是太害怕关系因为冲突变坏。",
    origin:
      "这种模式常来自早期关系里的不稳定感。你可能很早就学会观察气氛，用道歉、解释和退让来换取关系恢复平静。",
    pattern:
      "在亲密关系里，你容易把对方的沉默理解成惩罚；在朋友和职场关系里，你会优先压下不满，先把场面维持好。",
    path: ["先分清事实和想象：对方沉默，不等于你做错。", "练习把道歉换成确认：你刚刚沉默，是需要时间还是不舒服？", "冲突出现时，先照顾自己的身体反应，再处理关系。"],
    relationshipFocus:
      "你的关系雷区通常不是大吵，而是冷下来的一瞬间。对方语气轻一点、回复慢一点，你的身体可能已经先进入紧张状态。",
    boundaryPractice:
      "本周练习只做一件事：当你想立刻道歉时，先写下三种解释。只有其中一种是“我做错了”，另外两种留给对方和情境。",
  },
  {
    key: "sacrifice",
    name: "牺牲承担型讨好",
    short: "不愿意也会答应",
    summary:
      "你很容易把自己的需求往后放。你不是没有边界，而是每次要说“不”时，愧疚感会先替别人说服你。",
    origin:
      "这种模式可能和“懂事才安全”的经验有关。你习惯用承担、配合、不给别人添麻烦，来证明自己是值得被喜欢的。",
    pattern:
      "你会在关系里自动补位：别人没说完你就接住，别人开口你就答应。久了以后，你会分不清自己是真的愿意，还是已经习惯了。",
    path: ["每次答应前停 10 秒，问自己：我是真的愿意吗？", "从低风险拒绝开始练习，比如改时间、降范围、只答应一部分。", "把“我不方便”当作完整理由，不急着补偿对方。"],
    relationshipFocus:
      "你的消耗常常发生在答应之后。表面上关系很顺，内心却会积累一种“为什么又是我”的疲惫。",
    boundaryPractice:
      "本周练习一个半拒绝句式：我今天只能帮到这里。它不会把关系推翻，但会让你重新感受到边界。",
  },
  {
    key: "emotion",
    name: "情绪照顾型讨好",
    short: "总怕别人失望",
    summary:
      "你对别人的情绪非常敏感。别人不开心时，你会本能地想做点什么，好像只要对方情绪变好，关系才算安全。",
    origin:
      "这种模式常来自过早承担情绪劳动的经历。你可能曾经需要照顾大人的脸色，或者被期待做一个不让人操心的人。",
    pattern:
      "你会把对方的失望、烦躁、疲惫都揽到自己身上。你很会安抚别人，却常常忘了问自己累不累。",
    path: ["把别人的情绪还给别人：我可以关心，但不必负责。", "练习表达事实：我看见你不开心，但我不知道原因。", "在安慰别人之前，先确认自己有没有力气。"],
    relationshipFocus:
      "你很容易成为关系里的情绪缓冲垫。别人不开心，你会先检查自己哪里没做好，而不是先确认那是不是你的责任。",
    boundaryPractice:
      "本周练习把关心和负责分开：我愿意听你说，但我不能替你解决全部情绪。",
  },
  {
    key: "needed",
    name: "被需要型讨好",
    short: "被需要才安心",
    summary:
      "你最熟悉的安全感来自“我还有用”。只要别人需要你，你就会觉得关系还在，自己也还有价值。",
    origin:
      "这种模式可能和价值感绑定有关。你可能很少体验到无条件的接纳，于是慢慢把被需要、被依赖，当成自己重要的证明。",
    pattern:
      "你容易被需要感吸引，也容易被消耗型关系困住。别人越依赖你，你越难离开，因为那里面藏着一种被确认的感觉。",
    path: ["区分被爱和被使用：需要你，不等于珍惜你。", "练习在不帮忙的时候，也确认自己的价值。", "留意让你越来越累的关系，而不是只看对方是否需要你。"],
    relationshipFocus:
      "你会被“我需要你”这句话打动。它给你一种很强的存在感，但也可能让你忽略自己是否真的被珍惜。",
    boundaryPractice:
      "本周练习记录两种价值：我帮了什么，以及我什么都没做时仍然拥有的价值。",
  },
  {
    key: "selfBlame",
    name: "自责修复型讨好",
    short: "关系出问题先怪自己",
    summary:
      "你很容易把关系问题归因到自己身上。哪怕对方也有责任，你也会先想：是不是我不够好。",
    origin:
      "这种模式可能来自长期被否定或被要求反省的关系经验。你习惯通过找自己的问题，来获得一点可控感。",
    pattern:
      "在关系冷下来时，你会加倍解释、加倍修复、加倍证明。你以为是在挽回关系，其实也在不断削弱自己的位置。",
    path: ["把责任分成三份：我的、对方的、情境的。", "停止用过度解释换理解，真正愿意理解你的人不需要你证明很多遍。", "当自责出现时，先问：我掌握了全部事实吗？"],
    relationshipFocus:
      "你习惯用自责换可控感。只要都是自己的问题，好像就还能修复；但这也会让你承担本不属于你的部分。",
    boundaryPractice:
      "本周练习责任切分：每次自责时写下“我的责任、对方的责任、情境的影响”，不允许只写自己。",
  },
  {
    key: "sensitive",
    name: "高敏预判型讨好",
    short: "提前预判所有人的需要",
    summary:
      "你很会预判别人的需求和情绪变化。你的敏感不是问题，但如果它总是用来扫描危险，你会长期处在紧绷里。",
    origin:
      "这种模式可能来自关系里缺少稳定回应。你学会了在事情变坏之前先察觉、先调整、先把自己藏起来。",
    pattern:
      "你常常还没确认对方需要什么，就已经开始迎合。你很少真正放松，因为你总在提前处理还没有发生的问题。",
    path: ["把预判改成询问：你需要我做什么吗？", "允许别人直接说需求，不把猜测当任务。", "练习在关系里慢一点，不急着立刻表现得周到。"],
    relationshipFocus:
      "你太擅长提前扫描关系风险。你的敏感很珍贵，但当它一直用来预判危险，你会很难真正放松。",
    boundaryPractice:
      "本周练习把猜测改成一句确认：我不确定你是不是需要这个，你可以直接告诉我。",
  },
];

const questions = [
  { id: 1, text: "别人突然不回消息，你第一反应是：", options: [["我是不是说错话了", "conflict"], ["他可能有事，我别打扰", "sacrifice"], ["是不是我让他失望了", "emotion"], ["他是不是不需要我了", "needed"]] },
  { id: 2, text: "朋友临时找你帮忙，但你很累，你会：", options: [["怕尴尬还是答应", "conflict"], ["先把自己的事放一边", "sacrifice"], ["担心自己帮不好", "emotion"], ["被需要反而踏实", "needed"]] },
  { id: 3, text: "关系里最让你难受的是：", options: [["冲突和冷脸", "conflict"], ["让别人失望", "emotion"], ["自己没价值", "needed"], ["最后又变成我的错", "selfBlame"]] },
  { id: 4, text: "你最常说的话更像：", options: [["对不起，是不是我……", "selfBlame"], ["没事，我可以", "sacrifice"], ["你别不开心", "emotion"], ["需要我做什么吗", "needed"]] },
  { id: 5, text: "当你表达真实想法时，你最怕：", options: [["对方生气", "conflict"], ["对方觉得我自私", "sacrifice"], ["对方失望或冷淡", "emotion"], ["对方不再需要我", "needed"]] },
  { id: 6, text: "你在关系里最容易压下去的是：", options: [["不满", "conflict"], ["疲惫", "sacrifice"], ["需求", "emotion"], ["孤独", "needed"]] },
  { id: 7, text: "被夸“懂事”的时候，你内心可能是：", options: [["至少没惹人讨厌", "conflict"], ["累但觉得值得", "sacrifice"], ["应该继续照顾好别人", "emotion"], ["终于有点价值", "needed"]] },
  { id: 8, text: "如果一段关系变冷，你最容易：", options: [["先道歉", "conflict"], ["加倍付出", "sacrifice"], ["反复猜对方情绪", "sensitive"], ["想办法让对方需要我", "needed"]] },
  { id: 9, text: "同事把临时任务丢给你，你更可能：", options: [["怕拒绝后关系尴尬", "conflict"], ["默默接下来", "sacrifice"], ["担心领导觉得我不配合", "emotion"], ["证明自己可靠", "needed"]] },
  { id: 10, text: "别人语气变轻，你会：", options: [["马上紧张", "conflict"], ["减少自己的要求", "sacrifice"], ["努力让气氛好起来", "emotion"], ["猜他真正想要什么", "sensitive"]] },
  { id: 11, text: "你最容易被哪句话击中：", options: [["你怎么这么敏感", "sensitive"], ["你别总想太多", "selfBlame"], ["你能不能帮我一下", "needed"], ["你怎么又拒绝", "conflict"]] },
  { id: 12, text: "你拒绝别人后最常出现的是：", options: [["害怕被讨厌", "conflict"], ["很强的愧疚", "sacrifice"], ["担心对方失望", "emotion"], ["反复证明自己不是坏人", "selfBlame"]] },
  { id: 13, text: "亲密关系里，你最容易：", options: [["害怕冷战", "conflict"], ["过度迁就", "sacrifice"], ["照顾对方情绪", "emotion"], ["用付出留住对方", "needed"]] },
  { id: 14, text: "朋友聚会里你常常：", options: [["观察谁不开心", "sensitive"], ["配合大家安排", "sacrifice"], ["怕自己扫兴", "conflict"], ["主动照顾所有人", "emotion"]] },
  { id: 15, text: "别人夸你会照顾人，你会：", options: [["觉得自己终于有用", "needed"], ["下次更不敢停", "sacrifice"], ["担心没照顾好谁", "emotion"], ["暗暗松一口气", "conflict"]] },
  { id: 16, text: "你最难说出口的是：", options: [["我不想", "sacrifice"], ["我生气了", "conflict"], ["这不是我的责任", "emotion"], ["我也需要被照顾", "needed"]] },
  { id: 17, text: "发生误会时，你会先：", options: [["解释很多遍", "selfBlame"], ["道歉让关系缓和", "conflict"], ["担心对方难过", "emotion"], ["牺牲自己的立场", "sacrifice"]] },
  { id: 18, text: "你对关系最深的担心是：", options: [["冲突后回不去了", "conflict"], ["我不够好", "selfBlame"], ["我没有用就会被丢下", "needed"], ["我让别人不舒服", "emotion"]] },
  { id: 19, text: "别人提出需求时，你的大脑像在：", options: [["快速算会不会得罪人", "conflict"], ["自动安排自己怎么配合", "sacrifice"], ["扫描对方情绪", "sensitive"], ["确认自己还重要", "needed"]] },
  { id: 20, text: "你最常忽略自己的：", options: [["愤怒", "conflict"], ["时间", "sacrifice"], ["界限", "emotion"], ["价值感", "needed"]] },
  { id: 21, text: "你听到“不用了”时可能会：", options: [["觉得自己做错了", "selfBlame"], ["担心关系疏远", "conflict"], ["不知道自己还有什么用", "needed"], ["继续追问要不要帮忙", "sensitive"]] },
  { id: 22, text: "你最怕被别人评价为：", options: [["难相处", "conflict"], ["自私", "sacrifice"], ["冷漠", "emotion"], ["没价值", "needed"]] },
  { id: 23, text: "你习惯提前做很多，是因为：", options: [["怕场面变糟", "sensitive"], ["不想麻烦别人", "sacrifice"], ["想让别人舒服", "emotion"], ["怕自己被嫌弃", "selfBlame"]] },
  { id: 24, text: "关系里你最容易反复想的是：", options: [["刚才我是不是过分了", "selfBlame"], ["他为什么突然冷淡", "conflict"], ["她会不会很失望", "emotion"], ["我是不是不重要了", "needed"]] },
  { id: 25, text: "当你真的很累，你会：", options: [["继续说没事", "sacrifice"], ["怕自己情绪影响别人", "emotion"], ["担心拒绝后被讨厌", "conflict"], ["等别人先发现我累", "needed"]] },
  { id: 26, text: "你对沉默的感受更像：", options: [["危险信号", "conflict"], ["是不是我没做好", "selfBlame"], ["对方是不是需要安抚", "emotion"], ["我要不要主动做点什么", "sensitive"]] },
  { id: 27, text: "你最容易吸引到的人是：", options: [["情绪忽冷忽热的人", "conflict"], ["习惯索取的人", "sacrifice"], ["需要被照顾的人", "needed"], ["让你不断猜的人", "sensitive"]] },
  { id: 28, text: "你最想练习的是：", options: [["不急着道歉", "conflict"], ["不自动答应", "sacrifice"], ["不承担别人的情绪", "emotion"], ["不靠有用证明价值", "needed"]] },
  { id: 29, text: "你小时候可能更常被期待：", options: [["别惹人生气", "conflict"], ["懂事一点", "sacrifice"], ["照顾大人的心情", "emotion"], ["表现得有用", "needed"]] },
  { id: 30, text: "你对自己的要求常常是：", options: [["不能让关系变坏", "conflict"], ["不能添麻烦", "sacrifice"], ["不能让别人失望", "emotion"], ["必须有价值", "needed"]] },
  { id: 31, text: "别人不高兴时，你会先想：", options: [["是不是我的错", "selfBlame"], ["我要怎么缓和", "conflict"], ["我要怎么安慰", "emotion"], ["我要怎么帮上忙", "needed"]] },
  { id: 32, text: "你最容易消耗在：", options: [["反复复盘", "selfBlame"], ["过度承担", "sacrifice"], ["情绪观察", "sensitive"], ["关系修复", "conflict"]] },
  { id: 33, text: "你最希望别人明白：", options: [["我也会害怕", "conflict"], ["我不是永远都有空", "sacrifice"], ["我也有自己的情绪", "emotion"], ["我不帮忙也值得被爱", "needed"]] },
  { id: 34, text: "你和父母相处时最熟悉的是：", options: [["看脸色", "sensitive"], ["不顶嘴", "conflict"], ["少提要求", "sacrifice"], ["做个有用的孩子", "needed"]] },
  { id: 35, text: "你最容易把爱理解成：", options: [["不冲突", "conflict"], ["多付出", "sacrifice"], ["让对方开心", "emotion"], ["被需要", "needed"]] },
  { id: 36, text: "如果从今天开始改变，你最需要先学会：", options: [["冲突不等于失去", "conflict"], ["拒绝不等于自私", "sacrifice"], ["关心不等于负责", "emotion"], ["无用也有价值", "needed"]] },
];

const state = {
  screen: "intro",
  index: 0,
  answers: new Map(),
};

const app = document.querySelector("#app");

function calculateReport() {
  const scores = Object.fromEntries(resultTypes.map((type) => [type.key, 0]));
  for (const answer of state.answers.values()) {
    scores[answer] += 1;
  }

  const ranked = resultTypes
    .map((type) => ({ ...type, score: scores[type.key], percent: Math.round((scores[type.key] / questions.length) * 100) }))
    .sort((a, b) => b.score - a.score);

  const primary = ranked[0];
  const secondary = ranked[1];
  const totalRisk = Math.min(96, Math.max(32, Math.round((primary.score + secondary.score) * 3.2 + state.answers.size * 0.75)));
  return { scores, ranked, primary, secondary, totalRisk };
}

function render() {
  if (state.screen === "intro") renderIntro();
  if (state.screen === "question") renderQuestion();
  if (state.screen === "report") renderReport();
}

function renderIntro() {
  app.innerHTML = `
    <div class="screen intro">
      <div class="intro-copy">
        <span class="score-pill">完整付费报告体验</span>
        <h2>看清你是哪一种讨好，而不是只知道“我好像很累”。</h2>
        <p class="lead">这份测试会从冲突敏感、牺牲承担、情绪照顾、被需要、自责修复、高敏预判六个方向，整理你的关系模式、形成来源和边界练习路径。</p>
      </div>
      <div class="start-strip">
        <span>约 5 分钟</span>
        <span>36 道题</span>
        <span>6 维报告</span>
      </div>
      <button class="primary-btn" data-action="start">开始测试</button>
    </div>
  `;
}

function renderQuestion() {
  const question = questions[state.index];
  const progress = Math.round(((state.index + 1) / questions.length) * 100);
  const selected = state.answers.get(question.id);

  app.innerHTML = `
    <div class="screen">
      <div class="progress-row">
        <div class="progress-meta">
          <span>第 ${state.index + 1} 题 / ${questions.length}</span>
          <span>${progress}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
      </div>
      <h2 class="question-title">${question.text}</h2>
      <div class="options">
        ${question.options
          .map(
            ([label, type], optionIndex) => `
              <button class="option${selected === type ? " selected" : ""}" data-action="answer" data-type="${type}" aria-pressed="${selected === type}">
                <span class="option-mark">${String.fromCharCode(65 + optionIndex)}</span>
                <span>${label}</span>
              </button>
            `,
          )
          .join("")}
      </div>
      <div class="nav-row">
        <button class="secondary-btn" data-action="back" ${state.index === 0 ? "disabled" : ""}>上一题</button>
        <button class="primary-btn" data-action="next" ${selected ? "" : "disabled"}>${state.index === questions.length - 1 ? "查看报告" : "下一题"}</button>
      </div>
    </div>
  `;
}

function renderReport() {
  const report = calculateReport();
  const dimensions = report.ranked
    .map(
      (item) => `
        <div class="dimension">
          <div class="dimension-label"><span>${item.name}</span><span>${item.score} / 36</span></div>
          <div class="dimension-track"><div class="dimension-fill" style="width:${Math.max(8, item.percent)}%"></div></div>
        </div>
      `,
    )
    .join("");

  app.innerHTML = `
    <div class="screen report">
      <span class="score-pill">关系压抑指数 ${report.totalRisk}</span>
      <h2>${report.primary.name}</h2>
      <p class="lead">你的第二倾向是「${report.secondary.name}」。这说明你的讨好不只是单一反应，而是由主要模式和辅助模式一起构成。</p>

      <div class="report-grid">
        <section class="report-section">
          <h3>你的核心画像</h3>
          <p>${report.primary.summary}</p>
        </section>
        <section class="report-section">
          <h3>第二倾向如何影响你</h3>
          <p>你的第二倾向是「${report.secondary.name}」。主类型解释你最常用的关系求生方式，第二倾向则解释你为什么会在某些场景里突然变得更敏感、更退让，或更想证明自己有价值。</p>
        </section>
        <section class="report-section">
          <h3>六维度占比</h3>
          ${dimensions}
        </section>
        <section class="report-section">
          <h3>可能的形成来源</h3>
          <p>${report.primary.origin}</p>
        </section>
        <section class="report-section">
          <h3>你在关系中的模式</h3>
          <p>${report.primary.pattern}</p>
        </section>
        <section class="report-section">
          <h3>最容易被触发的关系场景</h3>
          <p>${report.primary.relationshipFocus}</p>
        </section>
        <section class="report-section">
          <h3>如何开始改变</h3>
          <ul>${report.primary.path.map((item) => `<li>${item}</li>`).join("")}</ul>
        </section>
        <section class="report-section">
          <h3>本周边界练习</h3>
          <p>${report.primary.boundaryPractice}</p>
        </section>
        <section class="report-section">
          <h3>全部类型总览</h3>
          <div class="type-list">
            ${report.ranked.map((item) => `<div class="type-chip"><span>${item.name}</span><strong>${item.score}</strong></div>`).join("")}
          </div>
        </section>
      </div>

      <div class="nav-row">
        <button class="secondary-btn" data-action="restart">重测</button>
        <button class="primary-btn" data-action="save">保存报告</button>
      </div>
    </div>
  `;
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  if (action === "start") {
    state.screen = "question";
    state.index = 0;
  }
  if (action === "answer") {
    state.answers.set(questions[state.index].id, target.dataset.type);
  }
  if (action === "back" && state.index > 0) {
    state.index -= 1;
  }
  if (action === "next") {
    if (!state.answers.has(questions[state.index].id)) return;
    if (state.index === questions.length - 1) state.screen = "report";
    else state.index += 1;
  }
  if (action === "restart") {
    state.answers.clear();
    state.screen = "intro";
    state.index = 0;
  }
  if (action === "save") {
    window.print();
  }

  render();
});

render();
