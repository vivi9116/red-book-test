const ACCESS_STORAGE_KEY = "xhs_paid_test_access_v1";
const LOCAL_PREVIEW_CODE = "PREVIEW-2026";
const redeemConfig = window.XHS_REDEEM_CONFIG || {};

const resultTypes = [
  {
    key: "appease",
    name: "讨好求稳型脚本",
    short: "用懂事换稳定",
    summary: "你很容易把关系里的平静看得比自己的真实感受更重要。你不是没有脾气，而是太熟悉“别惹别人不高兴”的安全策略。",
    origin: "这种脚本可能来自早期关系里的不稳定感。小时候你也许很早就学会观察大人的脸色，用乖、懂事、不添麻烦来维持关系安全。",
    pattern: "在亲密关系里，你会先照顾对方的感受，再确认自己想要什么。久了以后，你可能连自己的不愿意都听不清。",
    relationshipFocus: "最容易触发你的是对方冷脸、沉默、语气变淡，或任何让你感觉关系快要不稳的瞬间。",
    actionPractice: "本周先练习在答应前停 10 秒，只问自己一句：我是真的愿意，还是只是害怕关系变糟？",
    path: ["把对方情绪和自己责任分开", "从低风险小拒绝开始练习", "允许关系里出现短暂不一致"],
  },
  {
    key: "alert",
    name: "情绪警觉型脚本",
    short: "总在扫描危险",
    summary: "你对关系气氛非常敏感。别人一句话、一个表情、一次没回消息，都可能让你进入预判和复盘。",
    origin: "这种脚本可能来自需要长期察言观色的成长经验。你很早就学会在事情变坏前先发现、先调整、先保护自己。",
    pattern: "你会把很多模糊信号理解成危险信号。你的敏感很珍贵，但当它一直被用来扫描风险，你会很难真正放松。",
    relationshipFocus: "最容易触发你的是不明确的沉默、忽冷忽热、没有解释的距离感。",
    actionPractice: "本周练习把猜测换成确认：我注意到你刚才沉默了，我不确定原因，可以告诉我吗？",
    path: ["先区分事实和想象", "把预判换成询问", "给身体一点慢下来的时间"],
  },
  {
    key: "confirmation",
    name: "缺爱确认型脚本",
    short: "反复确认自己重要",
    summary: "你很渴望稳定的爱，但也很容易怀疑自己是否真的值得被留下。关系越重要，你越容易想确认。",
    origin: "这种脚本可能和早期被忽视、被比较、或爱不够稳定有关。你可能很少体验到“不表现也被爱”的感觉。",
    pattern: "你会通过对方是否回复、是否主动、是否需要你来确认自己重要。一旦确认感不足，你会变得焦虑或失落。",
    relationshipFocus: "最容易触发你的是被忽视、被放在后面、对方没有及时回应你的期待。",
    actionPractice: "本周写下两种价值：我被回应时的价值，以及我没有被回应时仍然拥有的价值。",
    path: ["把被爱和被及时回应分开", "减少用测试关系换安全感", "建立不靠对方反应支撑的自我确认"],
  },
  {
    key: "withdraw",
    name: "回避封闭型脚本",
    short: "靠撤回来保护自己",
    summary: "当关系让你不安时，你更容易把自己收起来。不是你冷漠，而是靠近曾经让你感觉不安全。",
    origin: "这种脚本可能来自需求没有被好好回应的经验。久而久之，你学会少表达、少期待、少麻烦别人。",
    pattern: "你在关系里可能看起来独立，但内心其实有很多不敢说出口的需要。你怕一开口，就会失望。",
    relationshipFocus: "最容易触发你的是被追问、被要求立刻回应、或感觉自己的脆弱不被接住。",
    actionPractice: "本周练习表达一个小需求，不解释太多，只说：这件事我需要一点支持。",
    path: ["允许自己有需求", "从小范围表达开始", "区分独立和被迫孤立"],
  },
  {
    key: "repair",
    name: "自责修复型脚本",
    short: "关系出问题先怪自己",
    summary: "关系一有波动，你很容易先找自己的问题。自责让你感觉还有办法修复，但也会让你承担太多。",
    origin: "这种脚本可能来自经常被要求反省、被否定、或需要为大人的情绪负责的经历。",
    pattern: "你会用解释、道歉、加倍付出来修复关系。可是有些关系问题，本来就不是你一个人的责任。",
    relationshipFocus: "最容易触发你的是误会、冲突、对方失望，尤其是你无法马上把气氛变好时。",
    actionPractice: "本周每次自责时，写下三栏：我的责任、对方的责任、情境的影响。",
    path: ["停止把所有问题归到自己身上", "练习责任切分", "允许关系修复需要双方参与"],
  },
  {
    key: "control",
    name: "控制安全型脚本",
    short: "掌控才敢安心",
    summary: "你需要很多确定性才敢放松。计划、边界、答案、承诺，都会让你觉得关系更可控。",
    origin: "这种脚本可能来自早期环境里的不可预测。你学会用掌控细节来抵消不安。",
    pattern: "你不是故意强势，而是很怕事情失控后自己又回到无助的位置。越在乎，越容易想抓紧。",
    relationshipFocus: "最容易触发你的是模糊承诺、计划变化、对方临时改变决定。",
    actionPractice: "本周练习把一个低风险计划留出弹性，观察不确定出现时身体的反应。",
    path: ["区分稳定和完全可控", "练习承受小范围不确定", "把控制换成清晰沟通"],
  },
];

const questions = [
  { id: 1, text: "对方突然沉默时，你最先想到的是：", options: [["是不是我哪里做错了", "repair"], ["我得赶紧让气氛好起来", "appease"], ["这是不是关系变坏的信号", "alert"], ["算了，我先退回自己这里", "withdraw"]] },
  { id: 2, text: "亲密关系里，你最怕的是：", options: [["自己不够重要", "confirmation"], ["冲突失控", "appease"], ["对方忽冷忽热", "alert"], ["被看见脆弱后失望", "withdraw"]] },
  { id: 3, text: "别人不高兴时，你更容易：", options: [["先检查是不是自己的错", "repair"], ["主动照顾对方情绪", "appease"], ["反复观察对方变化", "alert"], ["想把局面控制清楚", "control"]] },
  { id: 4, text: "小时候你可能更熟悉：", options: [["少提要求比较安全", "withdraw"], ["懂事才不被嫌弃", "appease"], ["要看大人脸色", "alert"], ["表现好才被看见", "confirmation"]] },
  { id: 5, text: "当关系里出现误会，你会：", options: [["解释很多遍", "repair"], ["压下委屈先和好", "appease"], ["担心对方从此疏远", "confirmation"], ["希望立刻把规则说清楚", "control"]] },
  { id: 6, text: "你表达需求时最常有的感觉是：", options: [["怕麻烦别人", "withdraw"], ["怕别人不高兴", "appease"], ["怕对方不回应", "confirmation"], ["怕说不清导致失控", "control"]] },
  { id: 7, text: "你最容易被哪句话刺中：", options: [["你怎么又想太多", "alert"], ["你能不能别这么敏感", "repair"], ["你别总是躲着", "withdraw"], ["你是不是不相信我", "control"]] },
  { id: 8, text: "关系稳定时，你会更想：", options: [["确认对方真的在乎我", "confirmation"], ["保持现在别出问题", "appease"], ["弄清楚未来会怎样", "control"], ["终于可以一个人喘口气", "withdraw"]] },
  { id: 9, text: "父母情绪不好时，你可能学会了：", options: [["别惹他们", "appease"], ["提前发现不对劲", "alert"], ["把错先揽到自己身上", "repair"], ["躲起来比较安全", "withdraw"]] },
  { id: 10, text: "当计划被临时改变，你会：", options: [["明显不安，想重新掌控", "control"], ["担心是不是自己不重要", "confirmation"], ["先配合别扫兴", "appease"], ["默默抽离情绪", "withdraw"]] },
  { id: 11, text: "你最常压下去的是：", options: [["真实需求", "withdraw"], ["不满和拒绝", "appease"], ["焦虑和猜测", "alert"], ["被忽视后的失落", "confirmation"]] },
  { id: 12, text: "恋爱里你更容易：", options: [["反复确认爱还在不在", "confirmation"], ["对方一冷就紧张", "alert"], ["先道歉修复", "repair"], ["需要明确承诺才安心", "control"]] },
  { id: 13, text: "你最熟悉的安全感来源是：", options: [["大家都别生气", "appease"], ["我能提前预判", "alert"], ["对方明确选择我", "confirmation"], ["事情在掌控中", "control"]] },
  { id: 14, text: "当你受委屈时，你通常：", options: [["先忍过去", "appease"], ["想是不是自己太敏感", "repair"], ["不说，慢慢关上门", "withdraw"], ["希望对方给明确说法", "control"]] },
  { id: 15, text: "你对“被爱”的理解更像：", options: [["不被抛下", "confirmation"], ["不制造麻烦", "appease"], ["不用一直警觉", "alert"], ["可以提出需要", "withdraw"]] },
  { id: 16, text: "别人越靠近你，你可能越：", options: [["害怕失去", "confirmation"], ["害怕暴露需求", "withdraw"], ["害怕关系失控", "control"], ["害怕自己做不好", "repair"]] },
  { id: 17, text: "冲突后你最想做的是：", options: [["马上和好", "appease"], ["弄清楚到底哪里错了", "repair"], ["确认对方还要不要我", "confirmation"], ["先冷下来独处", "withdraw"]] },
  { id: 18, text: "你最想从报告里看见：", options: [["我为什么总讨好", "appease"], ["我为什么总紧张", "alert"], ["我为什么总怕不被爱", "confirmation"], ["我为什么总想控制", "control"]] },
  { id: 19, text: "你最容易重复的关系位置是：", options: [["照顾者", "appease"], ["观察者", "alert"], ["等待被选择的人", "confirmation"], ["独自扛住的人", "withdraw"]] },
  { id: 20, text: "当别人提出需求，你会先：", options: [["判断怎么配合", "appease"], ["想自己能不能做好", "repair"], ["担心拒绝后被冷落", "confirmation"], ["想边界会不会被打乱", "control"]] },
  { id: 21, text: "你最不敢承认的是：", options: [["我其实很怕被丢下", "confirmation"], ["我其实一直很累", "appease"], ["我其实很难信任稳定", "alert"], ["我其实也想被照顾", "withdraw"]] },
  { id: 22, text: "你更容易把问题归因于：", options: [["我不够好", "repair"], ["我没照顾好别人", "appease"], ["关系里有危险", "alert"], ["事情不够确定", "control"]] },
  { id: 23, text: "你最需要练习的是：", options: [["不用马上修复", "repair"], ["不用一直配合", "appease"], ["不用反复确认", "confirmation"], ["不用完全掌控", "control"]] },
  { id: 24, text: "如果从今天开始改变，你最想先学会：", options: [["表达真实需要", "withdraw"], ["让关系里可以有分歧", "appease"], ["让不确定不等于危险", "alert"], ["把价值感还给自己", "confirmation"]] },
];

const state = {
  screen: readStoredAccess() ? "intro" : "redeem",
  index: 0,
  answers: new Map(),
  redeemError: "",
  redeemLoading: false,
};

const app = document.querySelector("#app");

function normalizeRedeemCode(code) {
  return String(code || "").trim().replace(/\s+/g, "").toUpperCase();
}

function isLocalPreview() {
  return ["file:", "http:"].includes(window.location.protocol) && ["", "localhost", "127.0.0.1"].includes(window.location.hostname);
}

function readStoredAccess() {
  try {
    const stored = JSON.parse(localStorage.getItem(ACCESS_STORAGE_KEY) || "null");
    if (stored?.accessToken) return stored;
  } catch {
    localStorage.removeItem(ACCESS_STORAGE_KEY);
  }
  return null;
}

function storeAccess(access) {
  localStorage.setItem(
    ACCESS_STORAGE_KEY,
    JSON.stringify({
      code: access.code || "",
      accessToken: access.accessToken,
      redeemedAt: access.redeemedAt || new Date().toISOString(),
    }),
  );
}

async function redeemCode(code) {
  const normalizedCode = normalizeRedeemCode(code);
  if (!normalizedCode) throw new Error("请输入兑换码");

  if (isLocalPreview() && normalizedCode === LOCAL_PREVIEW_CODE) {
    return { ok: true, code: normalizedCode, accessToken: `preview-${Date.now()}`, redeemedAt: new Date().toISOString() };
  }

  if (!redeemConfig.apiUrl) throw new Error("暂未配置兑换接口");

  const response = await fetch(redeemConfig.apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: normalizedCode }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) throw new Error(payload.message || "兑换码无效或已被使用");
  return { ...payload, code: normalizedCode };
}

function calculateReport() {
  const scores = Object.fromEntries(resultTypes.map((type) => [type.key, 0]));
  for (const answer of state.answers.values()) scores[answer] += 1;
  const ranked = resultTypes
    .map((type) => ({ ...type, score: scores[type.key], percent: Math.round((scores[type.key] / questions.length) * 100) }))
    .sort((a, b) => b.score - a.score);
  return { scores, ranked, primary: ranked[0], secondary: ranked[1], totalRisk: Math.min(96, Math.max(35, Math.round((ranked[0].score + ranked[1].score) * 3.4 + state.answers.size * 0.7))) };
}

function renderRedeem() {
  app.innerHTML = `
    <div class="screen redeem-screen">
      <div class="redeem-card">
        <span class="score-pill">付费测试入口</span>
        <h2>输入兑换码后开始测试</h2>
        <p class="lead">兑换成功后，本设备会记住授权，下次重新打开网页也可以继续测试。</p>
        <label class="redeem-field">
          <span>兑换码</span>
          <input id="redeem-code" inputmode="text" autocomplete="one-time-code" placeholder="例如 AB8K-29QD" ${state.redeemLoading ? "disabled" : ""} />
        </label>
        ${state.redeemError ? `<p class="redeem-error">${state.redeemError}</p>` : ""}
        <button class="primary-btn" data-action="redeem" ${state.redeemLoading ? "disabled" : ""}>${state.redeemLoading ? "正在验证..." : "验证并开始"}</button>
      </div>
    </div>
  `;
}

function renderIntro() {
  app.innerHTML = `
    <div class="screen intro">
      <div class="intro-copy">
        <span class="score-pill">完整付费报告体验</span>
        <h2>看清你在亲密关系里重复的成长脚本。</h2>
        <p class="lead">这份测试会从讨好、警觉、确认、回避、自责、控制六个方向，整理你的关系反应、形成来源和改变路径。</p>
      </div>
      <div class="start-strip">
        <span>约 4 分钟</span>
        <span>24 题</span>
        <span>6 类报告</span>
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
        <div class="progress-meta"><span>第 ${state.index + 1} 题 / ${questions.length}</span><span>${progress}%</span></div>
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
          <div class="dimension-label"><span>${item.name}</span><span>${item.score} / ${questions.length}</span></div>
          <div class="dimension-track"><div class="dimension-fill" style="width:${Math.max(8, item.percent)}%"></div></div>
        </div>
      `,
    )
    .join("");

  app.innerHTML = `
    <div class="screen report">
      <span class="score-pill">关系脚本强度 ${report.totalRisk}</span>
      <h2>${report.primary.name}</h2>
      <p class="lead">你的第二倾向是「${report.secondary.name}」。这说明你的关系反应不是单一问题，而是由主要脚本和辅助脚本一起形成。</p>
      <div class="report-grid">
        <section class="report-section"><h3>你的核心画像</h3><p>${report.primary.summary}</p></section>
        <section class="report-section"><h3>可能的形成来源</h3><p>${report.primary.origin}</p></section>
        <section class="report-section"><h3>你在关系中的模式</h3><p>${report.primary.pattern}</p></section>
        <section class="report-section"><h3>最容易被触发的场景</h3><p>${report.primary.relationshipFocus}</p></section>
        <section class="report-section"><h3>六维度占比</h3>${dimensions}</section>
        <section class="report-section"><h3>本周练习</h3><p>${report.primary.actionPractice}</p></section>
        <section class="report-section"><h3>如何开始改变</h3><ul>${report.primary.path.map((item) => `<li>${item}</li>`).join("")}</ul></section>
        <section class="report-section"><h3>全部类型总览</h3><div class="type-list">${report.ranked.map((item) => `<div class="type-chip"><span>${item.name}</span><strong>${item.score}</strong></div>`).join("")}</div></section>
      </div>
      <div class="nav-row">
        <button class="secondary-btn" data-action="restart">重测</button>
        <button class="primary-btn" data-action="save">保存报告</button>
      </div>
    </div>
  `;
}

function render() {
  if (state.screen === "redeem") renderRedeem();
  if (state.screen === "intro") renderIntro();
  if (state.screen === "question") renderQuestion();
  if (state.screen === "report") renderReport();
}

app.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  if (action === "redeem") {
    const code = document.querySelector("#redeem-code")?.value;
    state.redeemError = "";
    state.redeemLoading = true;
    render();
    try {
      storeAccess(await redeemCode(code));
      state.screen = "intro";
    } catch (error) {
      state.screen = "redeem";
      state.redeemError = error.message || "兑换失败，请稍后再试";
    } finally {
      state.redeemLoading = false;
      render();
    }
    return;
  }
  if (action === "start") {
    if (!readStoredAccess()) state.screen = "redeem";
    else state.screen = "question";
    state.index = 0;
  }
  if (action === "answer") state.answers.set(questions[state.index].id, target.dataset.type);
  if (action === "back" && state.index > 0) state.index -= 1;
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
  if (action === "save") window.print();
  render();
});

render();
