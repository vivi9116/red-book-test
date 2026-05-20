import { scoreTest } from "./test-engine.js";
import { attachmentPatternTest } from "./tests/attachment-pattern.js";
import { boundaryPatternTest } from "./tests/boundary-pattern.js";
import { emotionalBurnoutPatternTest } from "./tests/emotional-burnout-pattern.js";
import { familyOriginPatternTest } from "./tests/family-origin-pattern.js";

const availableTests = [attachmentPatternTest, familyOriginPatternTest, emotionalBurnoutPatternTest, boundaryPatternTest];
const testsById = {
  "attachment-pattern": attachmentPatternTest,
  "family-origin-pattern": familyOriginPatternTest,
  "emotional-burnout-pattern": emotionalBurnoutPatternTest,
  "boundary-pattern": boundaryPatternTest,
};

const query = new URLSearchParams(window.location.search);
const requestedTestId = query.get("test");
const activeTest = requestedTestId ? testsById[requestedTestId] : null;

const state = {
  index: 0,
  answers: {},
};

const testCatalog = document.querySelector("#test-catalog");
const testList = document.querySelector("#test-list");
const testTopbar = document.querySelector("#test-topbar");
const productStage = document.querySelector("#product-stage");
const testPanel = document.querySelector("#test-panel");
const topbarEyebrow = document.querySelector("#topbar-eyebrow");
const topbarTitle = document.querySelector("#topbar-title");
const topbarBadge = document.querySelector("#topbar-badge");
const previewBoard = document.querySelector("#preview-board");
const paperVisual = document.querySelector("#paper-visual");
const paperTitle = document.querySelector("#paper-title");
const paperNote = document.querySelector("#paper-note");
const visualContent = document.querySelector("#visual-content");
const moduleList = document.querySelector("#module-list");
const intro = document.querySelector("#intro");
const quiz = document.querySelector("#quiz");
const report = document.querySelector("#report");
const eyebrow = document.querySelector("#intro-eyebrow");
const title = document.querySelector("#intro-title");
const subtitle = document.querySelector("#intro-subtitle");
const previewList = document.querySelector("#preview-list");
const startButton = document.querySelector("#start-button");
const redeemCode = document.querySelector("#redeem-code");
const redeemMessage = document.querySelector("#redeem-message");
const progressLabel = document.querySelector("#progress-label");
const dimensionLabel = document.querySelector("#dimension-label");
const timeLabel = document.querySelector("#time-label");
const progressFill = document.querySelector("#progress-fill");
const questionTitle = document.querySelector("#question-title");
const options = document.querySelector("#options");
const prevButton = document.querySelector("#prev-button");
const nextButton = document.querySelector("#next-button");

if (activeTest) {
  testCatalog.classList.add("hidden");
  testTopbar.classList.remove("hidden");
  productStage.classList.remove("hidden");
  previewBoard.classList.remove("hidden");
  testPanel.classList.remove("hidden");
  intro.classList.remove("hidden");
  applyTheme(activeTest);
  renderTopbar();
  renderPreviewBoard();
  renderIntro();
} else {
  document.body.classList.remove("has-active-test", "family-theme", "relationship-theme", "journal-theme", "boundary-theme");
  renderCatalog();
}

startButton.addEventListener("click", async () => {
  if (!activeTest) return;

  const code = redeemCode.value.trim();
  if (!code) {
    redeemCode.focus();
    redeemCode.classList.add("needs-code");
    setRedeemMessage("请填写兑换码。", "error");
    return;
  }

  setRedeemLoading(true);
  setRedeemMessage("正在验证兑换码...", "info");

  const redeemResult = await verifyRedeemCode(code);
  if (!redeemResult.ok) {
    setRedeemLoading(false);
    setRedeemMessage(redeemResult.message, "error");
    redeemCode.focus();
    redeemCode.classList.add("needs-code");
    return;
  }

  setRedeemMessage("兑换成功，正在进入测试。", "success");
  beginTest();
});

redeemCode.addEventListener("input", () => {
  redeemCode.classList.remove("needs-code");
  clearRedeemMessage();
});

async function verifyRedeemCode(code) {
  try {
    const response = await fetch("/api/redeem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        testId: activeTest.id,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.ok) {
      return {
        ok: false,
        message: data.message || "兑换码验证失败，请稍后再试。",
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: "兑换码系统暂时不可用，请稍后再试。",
    };
  }
}

function beginTest() {
  intro.classList.add("hidden");
  previewBoard.classList.add("hidden");
  productStage.classList.add("is-testing");
  quiz.classList.remove("hidden");
  renderQuestion();
  testPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setRedeemLoading(isLoading) {
  startButton.disabled = isLoading;
  startButton.textContent = isLoading ? "验证中" : "开始";
}

function setRedeemMessage(message, tone) {
  redeemMessage.textContent = message;
  redeemMessage.className = `redeem-message ${tone}`;
}

function clearRedeemMessage() {
  redeemMessage.textContent = "";
  redeemMessage.className = "redeem-message hidden";
}

prevButton.addEventListener("click", () => {
  state.index = Math.max(0, state.index - 1);
  renderQuestion();
});

nextButton.addEventListener("click", () => {
  if (!activeTest) return;

  const question = activeTest.questions[state.index];
  if (!state.answers[question.id]) return;

  if (state.index === activeTest.questions.length - 1) {
    renderReport();
    return;
  }

  state.index += 1;
  renderQuestion();
});

function renderCatalog() {
  document.title = "付费测试";
  testList.innerHTML = availableTests
    .map((testConfig) => {
      const href = `?test=${testConfig.id}`;
      return `
        <a class="test-card" href="${href}">
          <span>${escapeHtml(testConfig.badge)}</span>
          <strong>${escapeHtml(testConfig.title)}</strong>
          <small>${escapeHtml(testConfig.subtitle)}</small>
        </a>
      `;
    })
    .join("");
}

function renderTopbar() {
  topbarEyebrow.textContent = activeTest.badge;
  topbarTitle.textContent = activeTest.title;
  topbarBadge.textContent = `${activeTest.questions.length} 题`;
}

function renderPreviewBoard() {
  const preview = renderVisualPreview(activeTest);
  const modules = getPreviewModules(activeTest);

  previewBoard.dataset.layout = activeTest.layoutVariant;
  previewBoard.classList.add("compact");
  paperVisual.className = `paper-visual ${preview.className}`;
  paperTitle.textContent = preview.title;
  paperNote.textContent = preview.note;
  visualContent.innerHTML = preview.html;
  moduleList.innerHTML = modules
    .map(
      (module) => `
        <div>
          <strong>${escapeHtml(module.title)}</strong>
          <span>${escapeHtml(module.description)}</span>
        </div>
      `,
    )
    .join("");
}

function renderIntro() {
  document.title = activeTest.title;
  eyebrow.textContent = activeTest.badge;
  title.textContent = "开始 36 题测试";
  subtitle.textContent = activeTest.subtitle;
  previewList.innerHTML = activeTest.previewModules
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
}

function renderQuestion() {
  const question = activeTest.questions[state.index];
  const dimension = activeTest.dimensions.find((item) => item.key === question.dimension);
  const progress = Math.round(((state.index + 1) / activeTest.questions.length) * 100);

  progressLabel.textContent = `${state.index + 1} / ${activeTest.questions.length}`;
  dimensionLabel.textContent = dimension.name;
  timeLabel.textContent = `已完成 ${progress}% · 预计还需 ${estimateRemainingMinutes(state.index, activeTest.questions.length)} 分钟`;
  progressFill.style.width = `${progress}%`;
  questionTitle.textContent = question.text;
  prevButton.disabled = state.index === 0;
  nextButton.textContent = state.index === activeTest.questions.length - 1 ? "看报告" : "下一题";
  nextButton.disabled = !state.answers[question.id];

  options.innerHTML = question.options
    .map((option) => {
      const selected = state.answers[question.id] === option.id;
      return `<button class="option${selected ? " selected" : ""}" type="button" data-option="${option.id}" aria-pressed="${selected}">${escapeHtml(option.text)}</button>`;
    })
    .join("");

  options.querySelectorAll(".option").forEach((button) => {
    button.addEventListener("click", () => {
      state.answers[question.id] = button.dataset.option;
      renderQuestion();
    });
  });
}

function renderReport() {
  const scored = scoreTest(activeTest, state.answers);
  const detail = activeTest.reportDetails?.[scored.primary.key];

  quiz.classList.add("hidden");
  report.classList.remove("hidden");
  report.innerHTML = `
    <p class="eyebrow">你的付费测试报告</p>
    <h2>${escapeHtml(scored.primary.name)}</h2>
    <p class="result-short">${escapeHtml(scored.primary.short)}</p>
    <p class="report-lead">${escapeHtml(scored.primary.summary)}</p>
    ${renderReportOverview(scored, detail)}
    <div class="report-grid">
      <section>
        <h3>副倾向</h3>
        <p>${escapeHtml(scored.secondary.name)}：${escapeHtml(scored.secondary.short)}</p>
      </section>
      <section>
        <h3>形成线索</h3>
        <p>${escapeHtml(scored.primary.origin)}</p>
      </section>
      <section>
        <h3>重复模式</h3>
        <p>${escapeHtml(scored.primary.pattern)}</p>
      </section>
      <section>
        <h3>行动练习</h3>
        <p>${escapeHtml(scored.primary.actionPractice)}</p>
      </section>
    </div>
    ${renderDeepReport(detail)}
    <section class="dimension-panel">
      <h3>${escapeHtml(activeTest.reportModules[2] ?? "维度条")}</h3>
      ${renderDimensionBars(scored.dimensions)}
    </section>
    <section class="path-panel">
      <h3>${escapeHtml(activeTest.reportModules.at(-1) ?? "第一步计划")}</h3>
      <ol>${scored.primary.path.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </section>
  `;
}

function renderReportOverview(scored, detail) {
  return `
    <section class="report-overview">
      <div>
        <span>主线模式</span>
        <strong>${escapeHtml(scored.primary.name)}</strong>
        <p>${escapeHtml(detail?.coreInsight ?? scored.primary.summary)}</p>
      </div>
      <div>
        <span>副倾向</span>
        <strong>${escapeHtml(scored.secondary.name)}</strong>
        <p>${escapeHtml(scored.secondary.short)}</p>
      </div>
      <div>
        <span>当前提醒</span>
        <strong>不是贴标签，是看见脚本</strong>
        <p>${escapeHtml(scored.primary.relationshipFocus)}</p>
      </div>
    </section>
  `;
}

function renderDeepReport(detail) {
  if (!detail) return "";

  return `
    <section class="report-detail-section">
      <div class="report-section-heading">
        <span>01</span>
        <h3>你的模式是怎么形成的</h3>
      </div>
      ${renderSignalList(detail.sourceMap)}
    </section>
    <section class="report-detail-section">
      <div class="report-section-heading">
        <span>02</span>
        <h3>它在关系里通常怎么出现</h3>
      </div>
      ${renderSignalList(detail.relationshipPatterns)}
    </section>
    <section class="report-detail-section">
      <div class="report-section-heading">
        <span>03</span>
        <h3>最容易触发你的场景</h3>
      </div>
      ${renderSignalList(detail.triggerScenes)}
    </section>
    <section class="report-detail-section report-balance">
      <div>
        <span>你的优势</span>
        <p>${escapeHtml(detail.strengths)}</p>
      </div>
      <div>
        <span>需要留意</span>
        <p>${escapeHtml(detail.risks)}</p>
      </div>
    </section>
    <section class="report-detail-section report-action-plan">
      <div class="report-section-heading">
        <span>04</span>
        <h3>接下来 7 天的改写练习</h3>
      </div>
      <ol>${detail.actionPlan.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </section>
  `;
}

function renderSignalList(items) {
  return `
    <ul class="report-signal-list">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function renderDimensionBars(dimensions) {
  return activeTest.dimensions
    .map((dimension) => {
      const value = dimensions[dimension.key];
      return `
        <div class="dimension-row">
          <span>${escapeHtml(dimension.name)}</span>
          <div class="dimension-track"><i style="width: ${value}%"></i></div>
          <strong>${value}</strong>
        </div>
      `;
    })
    .join("");
}

function estimateRemainingMinutes(currentIndex, totalQuestions) {
  const remainingQuestions = Math.max(0, totalQuestions - currentIndex - 1);
  return Math.max(1, Math.ceil(remainingQuestions * 0.18));
}

function applyTheme(testConfig) {
  const root = document.documentElement;
  const colors = testConfig.theme.colors;

  document.body.classList.add("has-active-test");
  document.body.classList.toggle("family-theme", testConfig.id === "family-origin-pattern");
  document.body.classList.toggle("relationship-theme", testConfig.id === "attachment-pattern");
  document.body.classList.toggle("journal-theme", testConfig.id === "emotional-burnout-pattern");
  document.body.classList.toggle("boundary-theme", testConfig.id === "boundary-pattern");
  root.dataset.theme = testConfig.theme.name;
  root.style.setProperty("--color-background", colors.background);
  root.style.setProperty("--color-surface", colors.surface);
  root.style.setProperty("--color-primary", colors.primary);
  root.style.setProperty("--color-secondary", colors.secondary);
  root.style.setProperty("--color-ink", colors.ink);
  root.style.setProperty("--color-muted", colors.muted);
  root.style.setProperty("--color-danger", colors.danger);
  root.style.setProperty("--color-repair", colors.repair);
}

function renderVisualPreview(testConfig) {
  if (testConfig.layoutVariant === "boundary-lines") {
    return {
      className: "boundary-lines-preview",
      title: "你的关系边界线报告",
      note: "boundary map",
      html: `
        <div class="boundary-door" aria-hidden="true">
          <span class="door-panel"></span>
          <span class="door-sign">我的空间</span>
          <i></i>
        </div>
        <div class="boundary-redline" aria-hidden="true">
          <b>不方便</b>
          <span></span>
          <b>我需要想一下</b>
        </div>
        <div class="boundary-notes" aria-hidden="true">
          <span>过度承担</span>
          <span>愧疚退让</span>
          <span>温和拒绝</span>
        </div>
        <div class="boundary-ruler" aria-hidden="true">
          <span>我</span><i></i><span>关系</span><i></i><span>别人</span>
        </div>
        <div class="crossed-list" aria-hidden="true">
          <strong>不是都要我来接住</strong>
          <p>请求 / 愧疚 / 冲突 / 自我空间</p>
        </div>
        <span class="xhs-sticker sticker-boundary" aria-hidden="true">red line</span>
        <span class="doodle-star star-one" aria-hidden="true">✦</span>
      `,
    };
  }

  if (testConfig.layoutVariant === "journal-dashboard") {
    return {
      className: "journal-dashboard-preview",
      title: "你的情绪内耗能量报告",
      note: "energy journal",
      html: `
        <div class="energy-dashboard" aria-hidden="true">
          <div class="energy-ring">
            <span>37%</span>
            <small>energy</small>
          </div>
          <div class="energy-lines">
            <span style="--value: 82%"><b>脑内循环</b><i></i></span>
            <span style="--value: 64%"><b>身体低电</b><i></i></span>
            <span style="--value: 48%"><b>恢复入口</b><i></i></span>
          </div>
        </div>
        <div class="journal-page" aria-hidden="true">
          <span class="journal-date">today</span>
          <strong>我不是太敏感</strong>
          <p>只是太久没有停下来听自己。</p>
          <i></i>
        </div>
        <div class="signal-layer" aria-hidden="true">
          <span>反复脑补</span>
          <span>硬撑低电</span>
          <span>边界过载</span>
        </div>
        <div class="recovery-steps" aria-hidden="true">
          <span>事实</span><i></i><span>感受</span><i></i><span>下一步</span>
        </div>
        <span class="xhs-sticker sticker-journal" aria-hidden="true">soft reset</span>
        <span class="doodle-star star-one" aria-hidden="true">+</span>
      `,
    };
  }

  if (testConfig.layoutVariant === "family-archive") {
    return {
      className: "family-archive-preview",
      title: "你的成长关系脚本",
      note: "family archive",
      html: `
        <div class="archive-collage" aria-hidden="true">
          <div class="archive-stack">
            <span class="archive-photo photo-one"></span>
            <span class="archive-photo photo-two"></span>
            <span class="archive-label">old rule</span>
          </div>
          <div class="archive-patterns">
            <span class="archive-pattern pattern-home"></span>
            <span class="archive-pattern pattern-note"></span>
            <span class="archive-pattern pattern-branch"></span>
          </div>
          <div class="insight-card family-note">
            <small>家庭脚本</small>
            <strong>旧规则如何影响选择</strong>
            <span>边界 / 证明 / 安全感</span>
          </div>
          <div class="script-lines">
            <span style="--value: 68%"><b class="script-line-label">旧规则</b><i></i></span>
            <span style="--value: 82%"><b class="script-line-label">自动反应</b><i></i></span>
            <span style="--value: 54%"><b class="script-line-label">新选择</b><i></i></span>
          </div>
          <div class="archive-summary-strip">
            <span>旧规则</span>
            <i></i>
            <span>自动反应</span>
            <i></i>
            <span>新选择</span>
          </div>
        </div>
        <div class="memory-map" aria-hidden="true">
          <span class="memory-node self">现在的我</span>
          <span class="memory-node rule">旧规则</span>
          <span class="memory-node choice">新选择</span>
          <i class="memory-line line-one"></i>
          <i class="memory-line line-two"></i>
        </div>
        <div class="score-strip family-score" aria-hidden="true">
          <span style="--value: 68%"><b>边界</b><i></i></span>
          <span style="--value: 61%"><b>回应</b><i></i></span>
          <span style="--value: 74%"><b>选择</b><i></i></span>
        </div>
        <span class="xhs-sticker sticker-archive" aria-hidden="true">memory map</span>
        <span class="doodle-star star-one" aria-hidden="true">✦</span>
      `,
    };
  }

  return {
    className: "relationship-map-preview",
    title: "你的亲密距离报告",
    note: "relationship map",
    html: `
      <div class="message-thread" aria-hidden="true">
        <span>靠近时我会...</span>
        <span>等待时我最怕...</span>
      </div>
      <div class="insight-card insight-primary" aria-hidden="true">
        <small>专属洞察</small>
        <strong>距离开关</strong>
        <span>靠近 / 等待 / 修复</span>
      </div>
      <div class="insight-card insight-secondary" aria-hidden="true">
        <small>触发场景</small>
        <strong>消息未回</strong>
        <span>自动脑补与撤回</span>
      </div>
      <div class="distance-map" aria-hidden="true">
        <span class="distance-node self">我</span>
        <span class="distance-node other">TA</span>
        <i class="orbit orbit-one"></i>
        <i class="orbit orbit-two"></i>
      </div>
      <div class="score-strip" aria-hidden="true">
        <span style="--value: 72%"><b>靠近</b><i></i></span>
        <span style="--value: 54%"><b>等待</b><i></i></span>
        <span style="--value: 66%"><b>修复</b><i></i></span>
      </div>
      <div class="repair-route" aria-hidden="true">
        <span>靠近</span><i></i><span>冲突</span><i></i><span>修复</span>
      </div>
      <span class="xhs-sticker sticker-love" aria-hidden="true">love map</span>
      <span class="doodle-star star-one" aria-hidden="true">✦</span>
      <span class="doodle-star star-two" aria-hidden="true">+</span>
    `,
  };
}

function getPreviewModules(testConfig) {
  const descriptionsById = {
    "attachment-pattern": [
      "拆出你在亲密关系里反复触发的距离开关",
      "看见靠近、等待、冲突、修复时的自动反应",
      "用关系地图理解循环，而不是只给自己贴标签",
      "给你一个能真实练习的修复起点",
    ],
    "family-origin-pattern": [
      "看清哪些旧规则仍在影响你的选择",
      "把讨好、证明、退让或警觉放回成长语境里理解",
      "区分你真正想要的关系和家里熟悉的关系",
      "从一个小动作开始重写你的边界与回应",
    ],
    "emotional-burnout-pattern": [
      "拆出你反复脑补、硬撑低电或完美自控的主循环",
      "看见哪些场景最容易偷走你的情绪电量",
      "用能量仪表理解身体提醒，而不是继续责备自己",
      "从一个可执行的小恢复动作开始降低内耗",
    ],
    "boundary-pattern": [
      "看见你最容易在请求、愧疚或冲突里松开的边界线",
      "分清善良、责任和过度承担之间的细微差别",
      "找到你是先退让、先忍住，还是最后筑起高墙",
      "给你一句能真实说出口的温和边界练习",
    ],
  };
  const descriptions = descriptionsById[testConfig.id] ?? [];
  const sourceModules = testConfig.reportModules?.length ? testConfig.reportModules : testConfig.previewModules;

  return sourceModules.slice(0, 4).map((moduleTitle, index) => ({
    title: moduleTitle,
    description: descriptions[index] ?? testConfig.previewModules[index % testConfig.previewModules.length] ?? testConfig.subtitle,
  }));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
