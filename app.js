const STORAGE_KEY = "sbd-lab-storage-v1";
const RPE_VALUES = Array.from({ length: 9 }, (_, index) => 6 + index * 0.5);
const LIFT_META = {
  squat: {
    label: "深蹲",
    longLabel: "Back Squat",
    color: "var(--squat)",
  },
  bench: {
    label: "臥推",
    longLabel: "Bench Press",
    color: "var(--bench)",
  },
  deadlift: {
    label: "硬舉",
    longLabel: "Deadlift",
    color: "var(--deadlift)",
  },
};

const RESEARCH_SOURCES = [
  {
    title: "Autoregulated resistance training for maximal strength enhancement: A systematic review and network meta-analysis",
    date: "2025-10",
    journal: "Journal of Exercise Science & Fitness",
    summary:
      "2025 年的網絡統合分析比較了 APRE、RPE 與 VBRT 對最大肌力的效果；摘要顯示在背蹲與臥推 1RM 的排序中，APRE 第一，其次是 VBRT，再來才是 RPE。",
    impact:
      "因此本 app 把 RPE 定位成日常自動調整工具，而不是唯一的進度引擎；你可以用 RPE 管理當天狀態，再用 PR 與 e1RM 看中長期結果。",
    url: "https://pubmed.ncbi.nlm.nih.gov/40791980/",
  },
  {
    title: "Validity of Rating of Perceived Exertion Scales in Relation to Movement Velocity and Exercise Intensity During Resistance-Exercise: A Systematic Review",
    date: "2024-07",
    journal: "Journal of Strength and Conditioning Research / PubMed record",
    summary:
      "2024 系統性回顧指出，阻力訓練中的 RPE 與移動速度、訓練強度之間多呈中度正相關，代表 RPE 是有用訊號，但不是高精度儀器。",
    impact:
      "所以介面會同時顯示 RPE、e1RM、容量與 PR，而不是只顯示一個『最佳重量』。",
    url: "https://pubmed.ncbi.nlm.nih.gov/38910451/",
  },
  {
    title: "The Predictive Validity of Individualised Load-Velocity Relationships for Predicting 1RM: A Systematic Review and Individual Participant Data Meta-analysis",
    date: "2023-09",
    journal: "Sports Medicine",
    summary:
      "2023 的個體資料統合分析顯示，利用 load-velocity relationship 預估 1RM 的效度只有中等，而且傾向高估實際 1RM。",
    impact:
      "本 app 沒有把速度推估當成唯一核心，而是用更容易落地的『完成組 + RPE/RIR』去追蹤 e1RM，並在 UI 中強調它是趨勢工具，不是比賽判定。",
    url: "https://pubmed.ncbi.nlm.nih.gov/37493929/",
  },
  {
    title: "The efficacy of repetitions-in-reserve vs. traditional percentage-based resistance training",
    date: "2021-10",
    journal: "Sport Sciences for Health",
    summary:
      "此研究指出 RIR 整體上有可接受的準確度與中等到良好的可靠度，但在硬舉 6 次與 9 次等較高次數時，準確度較不理想。",
    impact:
      "因此表單與計算機都會對硬舉高次數給出提醒，避免把高 reps deadlift 的 RPE 當成過度精準的調整工具。",
    url: "https://link.springer.com/article/10.1007/s11332-021-00837-5",
  },
  {
    title: "Self-Rated Accuracy of Rating of Perceived Exertion-Based Load Prescription in Powerlifters",
    date: "2017-10",
    journal: "Journal of Strength and Conditioning Research",
    summary:
      "這篇針對 powerlifters 的研究直接檢驗了用 RIR-based RPE 在深蹲、臥推、硬舉選重的能力，支持其在力量訓練中的實務應用。",
    impact:
      "因此 app 預設提供 0.5 級距的 RPE 輸入與以主項分類的歷史追蹤，貼近 powerlifting 實務。",
    url: "https://pubmed.ncbi.nlm.nih.gov/28933716/",
  },
  {
    title: "Novel Resistance Training-Specific Rating of Perceived Exertion Scale Measuring Repetitions in Reserve",
    date: "2016-01",
    journal: "Journal of Strength and Conditioning Research",
    summary:
      "2016 年的研究建立並檢驗了以 RIR 為錨點的阻力訓練專用 RPE 架構，成為目前力量訓練中最常見的 RPE ↔ RIR 實務基礎。",
    impact:
      "本 app 的換算採用 RPE 10 = 0 RIR、RPE 9 = 1 RIR、0.5 RPE = 0.5 RIR 的邏輯，方便直接安排單組與工作組。",
    url: "https://pubmed.ncbi.nlm.nih.gov/26595188/",
  },
];

const DEMO_ENTRIES = [
  {
    id: "demo-1",
    date: "2026-04-03",
    lift: "squat",
    variant: "Comp",
    block: "Strength 1",
    weight: 180,
    reps: 3,
    sets: 3,
    rpe: 8,
    bodyweight: 84.2,
    notes: "腰帶，狀態穩定",
  },
  {
    id: "demo-2",
    date: "2026-04-05",
    lift: "bench",
    variant: "Paused",
    block: "Strength 1",
    weight: 122.5,
    reps: 4,
    sets: 4,
    rpe: 8.5,
    bodyweight: 84.1,
    notes: "停頓清楚，最後一組略慢",
  },
  {
    id: "demo-3",
    date: "2026-04-07",
    lift: "deadlift",
    variant: "Comp",
    block: "Strength 1",
    weight: 215,
    reps: 3,
    sets: 3,
    rpe: 8,
    bodyweight: 84.5,
    notes: "握力正常",
  },
  {
    id: "demo-4",
    date: "2026-04-10",
    lift: "squat",
    variant: "Comp",
    block: "Strength 2",
    weight: 190,
    reps: 2,
    sets: 4,
    rpe: 8.5,
    bodyweight: 84.4,
    notes: "前兩組速度很好",
  },
  {
    id: "demo-5",
    date: "2026-04-13",
    lift: "bench",
    variant: "Comp",
    block: "Strength 2",
    weight: 130,
    reps: 3,
    sets: 3,
    rpe: 9,
    bodyweight: 84.3,
    notes: "接胸位置穩定",
  },
  {
    id: "demo-6",
    date: "2026-04-16",
    lift: "deadlift",
    variant: "Comp",
    block: "Strength 2",
    weight: 225,
    reps: 2,
    sets: 3,
    rpe: 8.5,
    bodyweight: 84.6,
    notes: "站起速度比上週好",
  },
  {
    id: "demo-7",
    date: "2026-04-18",
    lift: "squat",
    variant: "Comp",
    block: "Peak",
    weight: 205,
    reps: 1,
    sets: 1,
    rpe: 9,
    bodyweight: 84.2,
    notes: "近期重量 PR",
  },
  {
    id: "demo-8",
    date: "2026-04-20",
    lift: "bench",
    variant: "Comp",
    block: "Peak",
    weight: 137.5,
    reps: 1,
    sets: 1,
    rpe: 9,
    bodyweight: 84.0,
    notes: "近期單次 PR",
  },
  {
    id: "demo-9",
    date: "2026-04-21",
    lift: "deadlift",
    variant: "Comp",
    block: "Peak",
    weight: 240,
    reps: 1,
    sets: 1,
    rpe: 9.5,
    bodyweight: 84.1,
    notes: "接近近期上限",
  },
];

const DEFAULT_STATE = {
  profile: {
    athleteName: "",
    formula: "epley",
    rounding: 2.5,
    barbellWeight: 20,
  },
  entries: [],
};

const state = loadState();

const elements = {
  profileForm: document.querySelector("#profile-form"),
  athleteName: document.querySelector("#athlete-name"),
  formula: document.querySelector("#formula"),
  rounding: document.querySelector("#rounding"),
  barbellWeight: document.querySelector("#barbell-weight"),
  headlineStats: document.querySelector("#headline-stats"),
  entryForm: document.querySelector("#entry-form"),
  entryDate: document.querySelector("#entry-date"),
  entryLift: document.querySelector("#entry-lift"),
  entryVariant: document.querySelector("#entry-variant"),
  entryBlock: document.querySelector("#entry-block"),
  entryWeight: document.querySelector("#entry-weight"),
  entryReps: document.querySelector("#entry-reps"),
  entrySets: document.querySelector("#entry-sets"),
  entryRpe: document.querySelector("#entry-rpe"),
  entryBodyweight: document.querySelector("#entry-bodyweight"),
  entryNotes: document.querySelector("#entry-notes"),
  entryHint: document.querySelector("#entry-hint"),
  loadDemo: document.querySelector("#load-demo"),
  estimateLift: document.querySelector("#estimate-lift"),
  estimateWeight: document.querySelector("#estimate-weight"),
  estimateReps: document.querySelector("#estimate-reps"),
  estimateRpe: document.querySelector("#estimate-rpe"),
  estimateOutput: document.querySelector("#estimate-output"),
  targetLift: document.querySelector("#target-lift"),
  targetOrm: document.querySelector("#target-orm"),
  targetReps: document.querySelector("#target-reps"),
  targetRpe: document.querySelector("#target-rpe"),
  targetOutput: document.querySelector("#target-output"),
  plateOutput: document.querySelector("#plate-output"),
  liftCards: document.querySelector("#lift-cards"),
  recentPrFeed: document.querySelector("#recent-pr-feed"),
  tableBody: document.querySelector("#log-table-body"),
  researchList: document.querySelector("#research-list"),
  exportJson: document.querySelector("#export-json"),
  exportCsv: document.querySelector("#export-csv"),
  importButton: document.querySelector("#import-button"),
  importFile: document.querySelector("#import-file"),
  clearData: document.querySelector("#clear-data"),
  emptyTemplate: document.querySelector("#empty-state-template"),
};

fillRpeSelect(elements.entryRpe, 8);
fillRpeSelect(elements.estimateRpe, 8);
fillRpeSelect(elements.targetRpe, 8);

hydrateProfileInputs();
setDefaultDate();
renderApp();
bindEvents();
registerServiceWorker();

function bindEvents() {
  elements.profileForm.addEventListener("input", handleProfileChange);
  elements.entryForm.addEventListener("submit", handleEntrySubmit);
  elements.loadDemo.addEventListener("click", handleLoadDemo);

  [elements.entryLift, elements.entryReps, elements.entryRpe].forEach((element) => {
    element.addEventListener("input", renderEntryHint);
  });

  [elements.estimateLift, elements.estimateWeight, elements.estimateReps, elements.estimateRpe].forEach((element) => {
    element.addEventListener("input", renderCalculators);
  });

  elements.targetLift.addEventListener("input", () => {
    syncTargetOrm(true);
    renderCalculators();
  });

  [elements.targetReps, elements.targetRpe].forEach((element) => {
    element.addEventListener("input", renderCalculators);
  });

  elements.targetOrm.addEventListener("input", () => {
    elements.targetOrm.dataset.mode = "manual";
    renderCalculators();
  });

  elements.exportJson.addEventListener("click", exportJson);
  elements.exportCsv.addEventListener("click", exportCsv);
  elements.importButton.addEventListener("click", () => elements.importFile.click());
  elements.importFile.addEventListener("change", importJson);
  elements.clearData.addEventListener("click", clearAllData);
}

function handleProfileChange() {
  state.profile.athleteName = elements.athleteName.value.trim();
  state.profile.formula = elements.formula.value;
  state.profile.rounding = toNumber(elements.rounding.value, 2.5);
  state.profile.barbellWeight = toNumber(elements.barbellWeight.value, 20);
  persistState();
  renderApp();
}

function handleEntrySubmit(event) {
  event.preventDefault();

  const entry = {
    id: crypto.randomUUID(),
    date: elements.entryDate.value,
    lift: elements.entryLift.value,
    variant: elements.entryVariant.value.trim(),
    block: elements.entryBlock.value.trim(),
    weight: toNumber(elements.entryWeight.value),
    reps: toNumber(elements.entryReps.value),
    sets: toNumber(elements.entrySets.value),
    rpe: toNumber(elements.entryRpe.value),
    bodyweight: elements.entryBodyweight.value ? toNumber(elements.entryBodyweight.value) : null,
    notes: elements.entryNotes.value.trim(),
  };

  state.entries.push(entry);
  sortEntries();
  persistState();
  elements.entryForm.reset();
  setDefaultDate();
  elements.entrySets.value = 1;
  elements.entryLift.value = "squat";
  elements.entryRpe.value = "8";
  renderApp();
}

function handleLoadDemo() {
  if (state.entries.length > 0) {
    const shouldContinue = window.confirm("目前已有訓練資料，載入示範資料會追加在現有資料後面，是否繼續？");
    if (!shouldContinue) {
      return;
    }
  }

  state.entries.push(
    ...DEMO_ENTRIES.map((entry) => ({
      ...entry,
      id: `${entry.id}-${crypto.randomUUID()}`,
    })),
  );

  sortEntries();
  persistState();
  renderApp();
}

function renderApp() {
  renderEntryHint();
  renderHeadlineStats();
  renderCalculators();
  renderLiftCards();
  renderRecentPrs();
  renderTable();
  renderResearch();
}

function renderHeadlineStats() {
  const metrics = getHeadlineMetrics();
  elements.headlineStats.innerHTML = metrics
    .map(
      (metric) => `
        <article class="stat-card ${metric.className}">
          <div class="stat-label">${metric.label}</div>
          <div class="stat-value">${metric.value}</div>
          <div class="stat-helper">${metric.helper}</div>
        </article>
      `,
    )
    .join("");
}

function renderEntryHint() {
  const lift = elements.entryLift.value;
  const reps = toNumber(elements.entryReps.value);
  const rpe = toNumber(elements.entryRpe.value);
  const rir = formatNumber(rirFromRpe(rpe), 1);

  let message = `${LIFT_META[lift].label} 目前設定約為 ${rir} RIR。`;

  if (lift === "deadlift" && reps >= 6) {
    message += " 研究顯示硬舉在較高次數下的 RIR/RPE 準確度較不穩，建議搭配影片、速度或保守加重。";
  } else if (rpe >= 9.5) {
    message += " 這已非常接近極限，若當週主軸不是測單，建議留一點緩衝。";
  } else {
    message += " 這適合作為日常自動調整的工作組紀錄。";
  }

  elements.entryHint.textContent = message;
}

function renderCalculators() {
  syncTargetOrm();

  const estimateWeight = toNumber(elements.estimateWeight.value);
  const estimateReps = toNumber(elements.estimateReps.value);
  const estimateRpe = toNumber(elements.estimateRpe.value);
  const estimateLift = elements.estimateLift.value;
  const estimateRir = rirFromRpe(estimateRpe);
  const estimateOneRm = estimate1RM(estimateWeight, estimateReps, estimateRpe, state.profile.formula);
  const estimatePercent = estimateOneRm ? (estimateWeight / estimateOneRm) * 100 : 0;
  const targetRir = rirFromRpe(toNumber(elements.targetRpe.value));
  const targetReps = toNumber(elements.targetReps.value);
  const targetLift = elements.targetLift.value;
  const targetOrm = toNumber(elements.targetOrm.value);
  const suggestedWeight = targetOrm
    ? prescribeLoad(targetOrm, targetReps, toNumber(elements.targetRpe.value), state.profile.formula, state.profile.rounding)
    : 0;
  const suggestedPercent = targetOrm ? (suggestedWeight / targetOrm) * 100 : 0;

  elements.estimateOutput.innerHTML = [
    {
      label: "估算 e1RM",
      value: `${formatKg(estimateOneRm)}`,
      copy: `以 ${estimateWeight} kg x ${estimateReps} @ RPE ${estimateRpe} 估算；約等於 ${estimateReps + estimateRir} 次到力竭。`,
    },
    {
      label: "相對強度",
      value: `${formatNumber(estimatePercent, 1)}%`,
      copy: `${LIFT_META[estimateLift].label} 這一組大約落在 ${formatNumber(estimatePercent, 1)}% e1RM。`,
    },
  ]
    .map(renderResultCard)
    .join("");

  elements.targetOutput.innerHTML = [
    {
      label: "建議重量",
      value: targetOrm ? formatKg(suggestedWeight) : "請先輸入",
      copy: targetOrm
        ? `${LIFT_META[targetLift].label} 目標 ${targetReps} reps @ RPE ${elements.targetRpe.value}，約為 ${formatNumber(suggestedPercent, 1)}% 1RM。`
        : "你可以手動輸入 1RM，或先記錄訓練讓系統自動帶入該主項最佳 e1RM。",
    },
    {
      label: "保留次數",
      value: `${formatNumber(targetRir, 1)} RIR`,
      copy: targetLift === "deadlift" && targetReps >= 6
        ? "硬舉高次數的 RPE 可靠度相對差，建議保守看待。"
        : "RPE 換算使用 RPE 10 = 0 RIR 的標準邏輯。",
    },
  ]
    .map(renderResultCard)
    .join("");

  renderPlateBreakdown(suggestedWeight);
}

function renderLiftCards() {
  const cards = Object.keys(LIFT_META).map((lift) => renderLiftCard(lift));
  elements.liftCards.innerHTML = cards.join("");
}

function renderLiftCard(lift) {
  const stats = getLiftStats(lift);
  const accentClass = lift;

  return `
    <article class="lift-card ${accentClass}">
      <div class="lift-card-header">
        <div>
          <div class="lift-name">${LIFT_META[lift].label}</div>
          <div class="muted">${LIFT_META[lift].longLabel}</div>
        </div>
        <div class="micro-tag">${stats.entries.length} 筆</div>
      </div>
      <div class="lift-accent"></div>
      <div class="metrics-grid">
        <div class="metric-chip">
          <span class="chip-number">${formatKg(stats.bestWeight)}</span>
          <span class="chip-text">最高重量</span>
        </div>
        <div class="metric-chip">
          <span class="chip-number">${formatKg(stats.bestE1RM)}</span>
          <span class="chip-text">最佳 e1RM</span>
        </div>
        <div class="metric-chip">
          <span class="chip-number">${formatKg(stats.bestSingle)}</span>
          <span class="chip-text">最佳單次</span>
        </div>
      </div>
      <div class="trend-chart">
        ${renderTrendChart(stats.timeline, lift)}
      </div>
      <div class="trend-label">${stats.timeline.length > 1 ? `最近一次 ${formatDate(stats.latestDate)} e1RM ${formatKg(stats.latestE1RM)}` : "新增更多訓練後會顯示走勢。"}</div>
    </article>
  `;
}

function renderRecentPrs() {
  const recentPrs = getRecentPrs();

  if (recentPrs.length === 0) {
    elements.recentPrFeed.innerHTML = elements.emptyTemplate.innerHTML;
    return;
  }

  elements.recentPrFeed.innerHTML = recentPrs
    .map(
      (item) => `
        <article class="feed-item">
          <div class="feed-title">${formatDate(item.date)} · ${LIFT_META[item.lift].label} · ${item.kind}</div>
          <div class="feed-meta">${item.detail}</div>
        </article>
      `,
    )
    .join("");
}

function renderTable() {
  const enrichedEntries = getEnrichedEntries();

  if (enrichedEntries.length === 0) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="8">${elements.emptyTemplate.innerHTML}</td>
      </tr>
    `;
    return;
  }

  elements.tableBody.innerHTML = enrichedEntries
    .slice()
    .reverse()
    .map(
      (entry) => `
        <tr>
          <td>${formatDate(entry.date)}</td>
          <td>
            <span class="log-lift">${LIFT_META[entry.lift].label}</span>
            ${entry.variant ? `<span class="log-variant">${escapeHtml(entry.variant)}</span>` : ""}
          </td>
          <td>
            ${formatKg(entry.weight)} x ${entry.reps} x ${entry.sets}
            ${entry.block ? `<span class="log-meta">${escapeHtml(entry.block)}</span>` : ""}
          </td>
          <td>RPE ${entry.rpe}<span class="log-meta">${formatNumber(entry.rir, 1)} RIR</span></td>
          <td>${formatKg(entry.e1rm)}<span class="log-meta">${formatNumber(entry.intensity, 1)}% e1RM</span></td>
          <td>${formatKg(entry.volume)}</td>
          <td>
            ${entry.bodyweight ? `<span class="log-meta">BW ${formatKg(entry.bodyweight)}</span>` : ""}
            ${entry.notes ? `<span class="log-notes">${escapeHtml(entry.notes)}</span>` : `<span class="log-notes">-</span>`}
          </td>
          <td>
            <div class="action-inline">
              <button class="icon-button" type="button" data-action="duplicate" data-id="${entry.id}">複製</button>
              <button class="icon-button" type="button" data-action="delete" data-id="${entry.id}">刪除</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");

  elements.tableBody.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", handleTableAction);
  });
}

function renderResearch() {
  elements.researchList.innerHTML = RESEARCH_SOURCES.map(
    (source) => `
      <article class="research-card">
        <div class="research-topline">
          <div class="research-title">${source.title}</div>
          <div class="research-date">${source.journal} · ${source.date}</div>
        </div>
        <p class="research-summary">${source.summary}</p>
        <p class="research-impact"><strong>怎麼影響這個 app：</strong>${source.impact}</p>
        <a class="research-link" href="${source.url}" target="_blank" rel="noreferrer">查看來源</a>
      </article>
    `,
  ).join("");
}

function renderPlateBreakdown(targetWeight) {
  if (!targetWeight) {
    elements.plateOutput.innerHTML = `
      <div class="empty-state">
        <p>先在左側輸入基準 1RM、目標次數與 RPE，系統就會算出建議重量與槓片配置。</p>
      </div>
    `;
    return;
  }

  const breakdown = buildPlateBreakdown(targetWeight, state.profile.barbellWeight);

  const chips = breakdown.plates.length
    ? breakdown.plates
        .map(
          (plate) => `
            <div class="plate-chip">
              <span class="chip-number">${plate.size} kg x ${plate.count}</span>
              <span class="chip-text">每邊</span>
            </div>
          `,
        )
        .join("")
    : `<div class="plate-chip"><span class="chip-number">僅空槓</span><span class="chip-text">${formatKg(state.profile.barbellWeight)}</span></div>`;

  elements.plateOutput.innerHTML = `
    <div class="result-card">
      <div class="result-label">總重量</div>
      <div class="result-value">${formatKg(targetWeight)}</div>
      <div class="result-copy">以 ${formatKg(state.profile.barbellWeight)} 槓鈴計算，每邊需加重 ${formatKg(breakdown.perSide)}。</div>
    </div>
    <div class="plate-row" style="margin-top: 12px;">${chips}</div>
    ${
      breakdown.remaining > 0
        ? `<p class="form-hint">仍有 ${formatKg(breakdown.remaining * 2)} 無法用常見公斤槓片精準拆分，建議調整進位設定或可用槓片。</p>`
        : ""
    }
  `;
}

function renderResultCard(result) {
  return `
    <div class="result-card">
      <div class="result-label">${result.label}</div>
      <div class="result-value">${result.value}</div>
      <div class="result-copy">${result.copy}</div>
    </div>
  `;
}

function renderTrendChart(points, lift) {
  if (points.length === 0) {
    return `
      <svg class="trend-svg" viewBox="0 0 320 120" preserveAspectRatio="none" aria-hidden="true">
        <rect x="0" y="0" width="320" height="120" rx="12" fill="rgba(255,255,255,0.45)" />
        <text x="20" y="66" fill="#5f6b7d" font-size="14">尚無資料</text>
      </svg>
    `;
  }

  if (points.length === 1) {
    return `
      <svg class="trend-svg" viewBox="0 0 320 120" preserveAspectRatio="none" aria-hidden="true">
        <rect x="0" y="0" width="320" height="120" rx="12" fill="rgba(255,255,255,0.45)" />
        <circle cx="160" cy="58" r="6" fill="${LIFT_META[lift].color}" />
      </svg>
    `;
  }

  const width = 320;
  const height = 120;
  const padding = 12;
  const values = points.map((point) => point.e1rm);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coords = points.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / (points.length - 1);
    const y = height - padding - ((point.e1rm - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  return `
    <svg class="trend-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="fill-${lift}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${resolveCssColor(lift)}" stop-opacity="0.28"></stop>
          <stop offset="100%" stop-color="${resolveCssColor(lift)}" stop-opacity="0"></stop>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" rx="14" fill="rgba(255,255,255,0.5)" />
      <polyline fill="none" stroke="${resolveCssColor(lift)}" stroke-width="4" points="${coords.join(" ")}" />
      ${coords
        .map((coordinate) => {
          const [x, y] = coordinate.split(",");
          return `<circle cx="${x}" cy="${y}" r="4" fill="${resolveCssColor(lift)}"></circle>`;
        })
        .join("")}
    </svg>
  `;
}

function handleTableAction(event) {
  const { action, id } = event.currentTarget.dataset;
  const index = state.entries.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return;
  }

  if (action === "delete") {
    state.entries.splice(index, 1);
  }

  if (action === "duplicate") {
    const source = state.entries[index];
    state.entries.push({
      ...source,
      id: crypto.randomUUID(),
      date: dateInputValue(new Date()),
    });
  }

  sortEntries();
  persistState();
  renderApp();
}

function exportJson() {
  downloadFile(
    "sbd-lab-data.json",
    JSON.stringify(state, null, 2),
    "application/json",
  );
}

function exportCsv() {
  const entries = getEnrichedEntries();
  const header = [
    "date",
    "lift",
    "variant",
    "block",
    "weight_kg",
    "reps",
    "sets",
    "rpe",
    "rir",
    "e1rm_kg",
    "intensity_percent",
    "volume_kg",
    "bodyweight_kg",
    "notes",
  ];

  const rows = entries.map((entry) => [
    entry.date,
    entry.lift,
    entry.variant || "",
    entry.block || "",
    entry.weight,
    entry.reps,
    entry.sets,
    entry.rpe,
    formatNumber(entry.rir, 1),
    formatNumber(entry.e1rm, 1),
    formatNumber(entry.intensity, 1),
    formatNumber(entry.volume, 1),
    entry.bodyweight ?? "",
    `"${(entry.notes || "").replaceAll('"', '""')}"`,
  ]);

  const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
  downloadFile("sbd-lab-data.csv", csv, "text/csv;charset=utf-8");
}

function importJson(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const nextState = normalizeImportedState(parsed);
      state.profile = nextState.profile;
      state.entries = nextState.entries;
      sortEntries();
      persistState();
      hydrateProfileInputs();
      renderApp();
    } catch (error) {
      window.alert("匯入失敗，請確認 JSON 格式正確。");
    } finally {
      elements.importFile.value = "";
    }
  };

  reader.readAsText(file);
}

function clearAllData() {
  const shouldClear = window.confirm("這會刪除所有本機訓練資料，是否繼續？");
  if (!shouldClear) {
    return;
  }

  state.profile = structuredClone(DEFAULT_STATE.profile);
  state.entries = [];
  persistState();
  hydrateProfileInputs();
  setDefaultDate();
  renderApp();
}

function fillRpeSelect(select, defaultValue) {
  select.innerHTML = RPE_VALUES.map(
    (value) => `<option value="${value}" ${value === defaultValue ? "selected" : ""}>${value}</option>`,
  ).join("");
}

function getHeadlineMetrics() {
  const enrichedEntries = getEnrichedEntries();
  const sessions = new Set(enrichedEntries.map((entry) => entry.date)).size;
  const totalVolume = enrichedEntries.reduce((sum, entry) => sum + entry.volume, 0);
  const bestLiftE1RMs = Object.keys(LIFT_META).map((lift) => getLiftStats(lift).bestE1RM || 0);
  const totalE1RM = bestLiftE1RMs.reduce((sum, value) => sum + value, 0);
  const prCount = getRecentPrs().length;
  const athlete = state.profile.athleteName ? `${state.profile.athleteName} 的資料庫` : "你的資料庫";

  return [
    {
      label: "SBD e1RM Total",
      value: totalE1RM ? formatKg(totalE1RM) : "尚無資料",
      helper: totalE1RM ? `以各主項最佳 e1RM 加總，方便看整體實力面。` : `${athlete} 還沒有訓練紀錄。`,
      className: "total",
    },
    {
      label: "總訓練容量",
      value: totalVolume ? formatKg(totalVolume) : "0 kg",
      helper: "所有已紀錄工作組的重量 x 次數 x 組數總和。",
      className: "volume",
    },
    {
      label: "訓練天數",
      value: `${sessions}`,
      helper: "依日期去重後計算，可快速看週期密度。",
      className: "sessions",
    },
    {
      label: "最近 PR 數",
      value: `${prCount}`,
      helper: "自動檢出的近期重量 PR、e1RM PR 與容量 PR。",
      className: "prs",
    },
  ];
}

function getLiftStats(lift) {
  const entries = getEnrichedEntries()
    .filter((entry) => entry.lift === lift)
    .sort((a, b) => a.date.localeCompare(b.date));

  const bestWeight = entries.reduce((max, entry) => Math.max(max, entry.weight), 0);
  const bestE1RM = entries.reduce((max, entry) => Math.max(max, entry.e1rm), 0);
  const bestSingle = entries
    .filter((entry) => entry.reps === 1)
    .reduce((max, entry) => Math.max(max, entry.weight), 0);

  const timelineMap = new Map();
  entries.forEach((entry) => {
    const current = timelineMap.get(entry.date) ?? 0;
    timelineMap.set(entry.date, Math.max(current, entry.e1rm));
  });

  const timeline = Array.from(timelineMap.entries()).map(([date, e1rm]) => ({ date, e1rm }));
  const latest = timeline.at(-1);

  return {
    entries,
    bestWeight,
    bestE1RM,
    bestSingle,
    timeline,
    latestDate: latest?.date ?? "",
    latestE1RM: latest?.e1rm ?? 0,
  };
}

function getRecentPrs() {
  const enrichedEntries = getEnrichedEntries().sort((a, b) => a.date.localeCompare(b.date));
  const records = {
    squat: { weight: 0, e1rm: 0, volume: 0 },
    bench: { weight: 0, e1rm: 0, volume: 0 },
    deadlift: { weight: 0, e1rm: 0, volume: 0 },
  };
  const feed = [];

  enrichedEntries.forEach((entry) => {
    const current = records[entry.lift];

    if (entry.weight > current.weight) {
      current.weight = entry.weight;
      feed.push({
        date: entry.date,
        lift: entry.lift,
        kind: "重量 PR",
        detail: `${formatKg(entry.weight)} x ${entry.reps} @ RPE ${entry.rpe}`,
      });
    }

    if (entry.e1rm > current.e1rm) {
      current.e1rm = entry.e1rm;
      feed.push({
        date: entry.date,
        lift: entry.lift,
        kind: "e1RM PR",
        detail: `e1RM 更新到 ${formatKg(entry.e1rm)}，由 ${formatKg(entry.weight)} x ${entry.reps} @ ${entry.rpe} 推估`,
      });
    }

    if (entry.volume > current.volume) {
      current.volume = entry.volume;
      feed.push({
        date: entry.date,
        lift: entry.lift,
        kind: "容量 PR",
        detail: `單筆容量達 ${formatKg(entry.volume)}，設定為 ${formatKg(entry.weight)} x ${entry.reps} x ${entry.sets}`,
      });
    }
  });

  return feed.slice(-8).reverse();
}

function getEnrichedEntries() {
  return state.entries.map((entry) => {
    const rir = rirFromRpe(entry.rpe);
    const e1rm = estimate1RM(entry.weight, entry.reps, entry.rpe, state.profile.formula);
    const volume = entry.weight * entry.reps * entry.sets;
    const intensity = e1rm ? (entry.weight / e1rm) * 100 : 0;

    return {
      ...entry,
      rir,
      e1rm,
      intensity,
      volume,
    };
  });
}

function estimate1RM(weight, reps, rpe, formula) {
  const normalizedWeight = toNumber(weight);
  const normalizedReps = Math.max(1, toNumber(reps));
  const repsToFailure = normalizedReps + rirFromRpe(rpe);

  if (!normalizedWeight) {
    return 0;
  }

  if (formula === "brzycki") {
    const denominator = 37 - Math.min(repsToFailure, 36);
    return denominator > 0 ? normalizedWeight * (36 / denominator) : normalizedWeight;
  }

  return normalizedWeight * (1 + repsToFailure / 30);
}

function prescribeLoad(oneRm, reps, rpe, formula, increment) {
  const orm = toNumber(oneRm);
  const repsToFailure = Math.max(1, toNumber(reps)) + rirFromRpe(rpe);

  if (!orm) {
    return 0;
  }

  let rawWeight = 0;
  if (formula === "brzycki") {
    rawWeight = orm / (36 / (37 - Math.min(repsToFailure, 36)));
  } else {
    rawWeight = orm / (1 + repsToFailure / 30);
  }

  return roundToIncrement(rawWeight, increment || 2.5);
}

function rirFromRpe(rpe) {
  return clamp(10 - toNumber(rpe), 0, 4);
}

function syncTargetOrm(forceAutoFill = false) {
  const selectedLift = elements.targetLift.value;
  const fallback = getLiftStats(selectedLift).bestE1RM;
  const hasManualValue = elements.targetOrm.dataset.mode === "manual";
  const existingValue = elements.targetOrm.value.trim();

  if (!existingValue || !hasManualValue || forceAutoFill) {
    elements.targetOrm.value = fallback ? formatNumber(fallback, 1) : "";
    elements.targetOrm.dataset.mode = "auto";
  }
}

function buildPlateBreakdown(targetWeight, barbellWeight) {
  const standardPlates = [25, 20, 15, 10, 5, 2.5, 1.25];
  const totalTarget = Math.max(0, roundToIncrement(targetWeight, 0.5));
  const perSide = Math.max(0, (totalTarget - barbellWeight) / 2);
  let remainder = perSide;
  const plates = [];

  standardPlates.forEach((plateSize) => {
    const count = Math.floor((remainder + 1e-9) / plateSize);
    if (count > 0) {
      plates.push({ size: plateSize, count });
      remainder = roundToIncrement(remainder - count * plateSize, 0.25);
    }
  });

  return {
    perSide,
    plates,
    remaining: remainder,
  };
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(DEFAULT_STATE);
    }

    return normalizeImportedState(JSON.parse(raw));
  } catch (error) {
    return structuredClone(DEFAULT_STATE);
  }
}

function normalizeImportedState(data) {
  const profile = {
    athleteName: data?.profile?.athleteName ?? "",
    formula: data?.profile?.formula === "brzycki" ? "brzycki" : "epley",
    rounding: toNumber(data?.profile?.rounding, 2.5),
    barbellWeight: toNumber(data?.profile?.barbellWeight, 20),
  };

  const entriesSource = Array.isArray(data?.entries) ? data.entries : [];
  const entries = entriesSource
    .map((entry) => ({
      id: entry.id || crypto.randomUUID(),
      date: entry.date || dateInputValue(new Date()),
      lift: Object.keys(LIFT_META).includes(entry.lift) ? entry.lift : "squat",
      variant: entry.variant || "",
      block: entry.block || "",
      weight: toNumber(entry.weight),
      reps: Math.max(1, toNumber(entry.reps, 1)),
      sets: Math.max(1, toNumber(entry.sets, 1)),
      rpe: clamp(toNumber(entry.rpe, 8), 6, 10),
      bodyweight: entry.bodyweight === null || entry.bodyweight === undefined ? null : toNumber(entry.bodyweight),
      notes: entry.notes || "",
    }))
    .filter((entry) => entry.weight > 0);

  return { profile, entries };
}

function persistState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrateProfileInputs() {
  elements.athleteName.value = state.profile.athleteName;
  elements.formula.value = state.profile.formula;
  elements.rounding.value = String(state.profile.rounding);
  elements.barbellWeight.value = String(state.profile.barbellWeight);
}

function setDefaultDate() {
  elements.entryDate.value = dateInputValue(new Date());
}

function sortEntries() {
  state.entries.sort((a, b) => a.date.localeCompare(b.date));
}

function dateInputValue(date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

function formatDate(dateString) {
  try {
    return new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(`${dateString}T00:00:00`));
  } catch (error) {
    return dateString;
  }
}

function formatKg(value) {
  if (!value && value !== 0) {
    return "-";
  }
  return `${formatNumber(value, 1)} kg`;
}

function formatNumber(value, digits = 0) {
  return Number(value).toLocaleString("zh-TW", {
    minimumFractionDigits: value % 1 === 0 && digits > 0 ? 0 : 0,
    maximumFractionDigits: digits,
  });
}

function roundToIncrement(value, increment) {
  if (!increment) {
    return value;
  }
  return Math.round(value / increment) * increment;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resolveCssColor(lift) {
  const color = {
    squat: "#0e7490",
    bench: "#b45309",
    deadlift: "#9333ea",
  };
  return color[lift] || "#0f5f8c";
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // Ignore offline cache registration errors.
    });
  }
}
