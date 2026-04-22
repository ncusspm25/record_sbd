import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const STORAGE_KEY = "sbd-lab-storage-v2";
const VALID_VIEWS = ["calculator", "overview", "log", "research"];
const RPE_VALUES = Array.from({ length: 11 }, (_, index) => 5 + index * 0.5);
const TARGET_REPS = Array.from({ length: 12 }, (_, index) => index + 1);

const LIFT_META = {
  squat: { label: "深蹲", longLabel: "Back Squat", color: "#0e7490" },
  bench: { label: "臥推", longLabel: "Bench Press", color: "#b9882b" },
  deadlift: { label: "硬舉", longLabel: "Deadlift", color: "#a9472d" },
};

const PLATE_META = {
  25: { color: "#bf3b38", label: "紅", className: "is-red", height: 112, width: 34 },
  20: { color: "#2e66b8", label: "藍", className: "is-blue", height: 104, width: 30 },
  15: { color: "#d9a02c", label: "黃", className: "is-yellow", height: 96, width: 28 },
  10: { color: "#1d7a4b", label: "綠", className: "is-green", height: 86, width: 24 },
  5: { color: "#ebe9e3", label: "白", className: "is-white", height: 72, width: 20 },
  2.5: { color: "#252525", label: "黑", className: "is-black", height: 60, width: 16 },
  1.25: { color: "#bdc3c8", label: "銀", className: "is-silver", height: 50, width: 12 },
};

const RESEARCH_SOURCES = [
  {
    title: "Autoregulated resistance training for maximal strength enhancement",
    date: "2025-10",
    journal: "Journal of Exercise Science & Fitness",
    summary: "2025 年網絡統合分析比較 APRE、RPE 與 VBRT 對最大肌力的效果，提醒我們 RPE 很有用，但不應被當成唯一依據。",
    impact: "因此這個 app 把 RPE 放在即時調整，而把 PR 與 e1RM 放在長期進步追蹤。",
    url: "https://pubmed.ncbi.nlm.nih.gov/40791980/",
  },
  {
    title: "Validity of Rating of Perceived Exertion Scales During Resistance Exercise",
    date: "2024-07",
    journal: "JSCR / PubMed",
    summary: "2024 系統性回顧指出，阻力訓練中的 RPE 與訓練強度、動作速度普遍呈中度相關，適合作為實務監控工具。",
    impact: "所以我們同時顯示重量、RPE、e1RM 與快速參考表，而不是只給單一答案。",
    url: "https://pubmed.ncbi.nlm.nih.gov/38910451/",
  },
  {
    title: "Predictive Validity of Individualised Load-Velocity Relationships for 1RM",
    date: "2023-09",
    journal: "Sports Medicine",
    summary: "2023 個體資料統合分析指出，利用速度關係估算 1RM 的效度只有中等，且常有高估傾向。",
    impact: "因此本工具以完成組加 RPE 估算 e1RM，並明確標示它是推算，不是實測。",
    url: "https://pubmed.ncbi.nlm.nih.gov/37493929/",
  },
  {
    title: "The efficacy of repetitions-in-reserve vs. traditional percentage-based training",
    date: "2021-10",
    journal: "Sport Sciences for Health",
    summary: "研究顯示 RIR 整體準確度可接受，但硬舉高次數時準確度較不穩定。",
    impact: "所以當主項是硬舉且次數偏高時，介面會主動提醒保守看待 RPE。",
    url: "https://link.springer.com/article/10.1007/s11332-021-00837-5",
  },
  {
    title: "Self-Rated Accuracy of RPE-Based Load Prescription in Powerlifters",
    date: "2017-10",
    journal: "Journal of Strength and Conditioning Research",
    summary: "針對 powerlifters 的研究支持用 RIR-based RPE 進行實務選重。",
    impact: "這也是本 app 以深蹲、臥推、硬舉為核心並採用半級距 RPE 的原因。",
    url: "https://pubmed.ncbi.nlm.nih.gov/28933716/",
  },
];

const DEMO_ENTRIES = [
  { id: "demo-1", date: "2026-04-03", lift: "squat", variant: "Comp", block: "Strength", weight: 180, reps: 3, sets: 3, rpe: 8, bodyweight: 84.2, notes: "腰帶，節奏穩定" },
  { id: "demo-2", date: "2026-04-05", lift: "bench", variant: "Paused", block: "Strength", weight: 122.5, reps: 4, sets: 4, rpe: 8.5, bodyweight: 84.1, notes: "停頓清楚" },
  { id: "demo-3", date: "2026-04-07", lift: "deadlift", variant: "Comp", block: "Strength", weight: 215, reps: 3, sets: 3, rpe: 8, bodyweight: 84.5, notes: "握力正常" },
  { id: "demo-4", date: "2026-04-18", lift: "squat", variant: "Comp", block: "Peak", weight: 205, reps: 1, sets: 1, rpe: 9, bodyweight: 84.2, notes: "近期重量 PR" },
  { id: "demo-5", date: "2026-04-20", lift: "bench", variant: "Comp", block: "Peak", weight: 137.5, reps: 1, sets: 1, rpe: 9, bodyweight: 84.0, notes: "近期單次 PR" },
  { id: "demo-6", date: "2026-04-21", lift: "deadlift", variant: "Comp", block: "Peak", weight: 240, reps: 1, sets: 1, rpe: 9.5, bodyweight: 84.1, notes: "接近高峰狀態" },
];

const DEFAULT_STATE = {
  profile: {
    athleteName: "",
    formula: "epley",
    rounding: 2.5,
    barbellWeight: 20,
  },
  ui: {
    activeView: "calculator",
  },
  entries: [],
};

const syncState = {
  ready: false,
  app: null,
  auth: null,
  db: null,
  provider: null,
  user: null,
  mode: "initializing",
  error: "",
  unsubscribeEntries: null,
};

const state = loadState();

const elements = {
  profileForm: document.querySelector("#profile-form"),
  athleteName: document.querySelector("#athlete-name"),
  formula: document.querySelector("#formula"),
  rounding: document.querySelector("#rounding"),
  barbellWeight: document.querySelector("#barbell-weight"),
  storageNote: document.querySelector("#storage-note"),
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
  targetReps: document.querySelector("#target-reps"),
  targetRpe: document.querySelector("#target-rpe"),
  estimateOutput: document.querySelector("#estimate-output"),
  targetOutput: document.querySelector("#target-output"),
  calcProjectedNumber: document.querySelector("#calc-projected-number"),
  calcHeroMeta: document.querySelector("#calc-hero-meta"),
  plateOutput: document.querySelector("#plate-output"),
  projectionGrid: document.querySelector("#projection-grid"),
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
  viewButtons: document.querySelectorAll("[data-view-target]"),
  sectionViews: document.querySelectorAll(".section-view"),
};

fillRpeSelect(elements.entryRpe, 8);
fillRpeSelect(elements.estimateRpe, 6);
fillRpeSelect(elements.targetRpe, 8);
fillRepSelect(elements.targetReps, 12, 5);
hydrateProfileInputs();
setDefaultDate();
applyActiveView();
renderApp();
bindEvents();
registerServiceWorker();
initFirebase();

function bindEvents() {
  elements.profileForm.addEventListener("input", handleProfileChange);
  elements.entryForm.addEventListener("submit", handleEntrySubmit);
  elements.loadDemo.addEventListener("click", handleLoadDemo);

  [elements.entryLift, elements.entryReps, elements.entryRpe].forEach((element) => {
    element.addEventListener("input", renderEntryHint);
  });

  [
    elements.estimateLift,
    elements.estimateWeight,
    elements.estimateReps,
    elements.estimateRpe,
    elements.targetReps,
    elements.targetRpe,
  ].forEach((element) => {
    element.addEventListener("input", renderCalculators);
  });

  elements.exportJson.addEventListener("click", exportJson);
  elements.exportCsv.addEventListener("click", exportCsv);
  elements.importButton.addEventListener("click", () => elements.importFile.click());
  elements.importFile.addEventListener("change", importJson);
  elements.clearData.addEventListener("click", clearAllData);

  elements.viewButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveView(button.dataset.viewTarget));
  });
}

function renderApp() {
  applyActiveView();
  renderStorageNote();
  renderEntryHint();
  renderHeadlineStats();
  renderCalculators();
  renderLiftCards();
  renderRecentPrs();
  renderTable();
  renderResearch();
}

function handleProfileChange() {
  state.profile.athleteName = elements.athleteName.value.trim();
  state.profile.formula = elements.formula.value;
  state.profile.rounding = toNumber(elements.rounding.value, 2.5);
  state.profile.barbellWeight = toNumber(elements.barbellWeight.value, 20);
  persistStateLocal();
  if (isCloudMode()) {
    saveProfileToCloud().catch(console.error);
  }
  renderApp();
}

async function handleEntrySubmit(event) {
  event.preventDefault();
  const entry = normalizeEntry({
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
  });

  if (!entry) {
    window.alert("請確認重量、次數與 RPE 都有正確填寫。");
    return;
  }

  if (isCloudMode()) {
    await saveEntryToCloud(entry);
  } else {
    state.entries.push(entry);
    sortEntries();
    persistStateLocal();
  }

  resetEntryForm();
  renderApp();
}

async function handleLoadDemo() {
  if (state.entries.length > 0) {
    const ok = window.confirm("目前已有資料，載入示範資料會追加進去，確定繼續嗎？");
    if (!ok) {
      return;
    }
  }

  const demoEntries = DEMO_ENTRIES.map((entry) => ({
    ...entry,
    id: `${entry.id}-${crypto.randomUUID()}`,
  }));

  if (isCloudMode()) {
    const batch = writeBatch(syncState.db);
    demoEntries.forEach((entry) => {
      batch.set(doc(syncState.db, "users", syncState.user.uid, "sbd-entries", entry.id), entry);
    });
    await batch.commit();
  } else {
    state.entries.push(...demoEntries);
    sortEntries();
    persistStateLocal();
    renderApp();
  }
}

function resetEntryForm() {
  elements.entryForm.reset();
  setDefaultDate();
  elements.entrySets.value = 1;
  elements.entryLift.value = "squat";
  elements.entryRpe.value = "8";
}

function renderStorageNote() {
  const localCount = loadLocalEntries().length;
  let html = "";

  if (syncState.mode === "initializing") {
    html = `
      <div class="storage-card">
        <span class="storage-status local">同步初始化中</span>
        <div class="storage-copy">目前先用本機模式載入，Firebase 初始化完成後會提供 Google 登入與雲端同步。</div>
      </div>
    `;
  } else if (syncState.mode === "config-missing") {
    html = `
      <div class="storage-card">
        <span class="storage-status local">本機模式</span>
        <div class="storage-copy">目前資料存在這台裝置的瀏覽器 <code>localStorage</code>。換手機、換瀏覽器或清除網站資料後不會自動跟著走。</div>
        <div class="storage-copy">如果你要跨手機同步，請把 <code>firebase-config.js</code> 填上自己的 Firebase 設定，再登入 Google 啟用 Firestore 同步。</div>
      </div>
    `;
  } else if (syncState.mode === "signed-out") {
    html = `
      <div class="storage-card">
        <span class="storage-status local">本機模式</span>
        <div class="storage-copy">目前資料存在瀏覽器本機。登入 Google 後，可以把訓練記錄同步到你的 Firestore，在不同手機或電腦共用。</div>
        <div class="storage-actions">
          <button class="button primary" type="button" id="auth-sign-in-btn">登入 Google 啟用雲端</button>
        </div>
      </div>
    `;
  } else if (syncState.mode === "signing-in" || syncState.mode === "syncing") {
    html = `
      <div class="storage-card">
        <span class="storage-status cloud">雲端連線中</span>
        <div class="storage-copy">${syncState.mode === "signing-in" ? "正在開啟 Google 登入視窗。" : "正在讀取你的 Firestore 訓練資料。"}</div>
      </div>
    `;
  } else if (syncState.mode === "cloud") {
    html = `
      <div class="storage-card">
        <span class="storage-status cloud">雲端同步中</span>
        <div class="storage-copy">你已登入 <strong>${escapeHtml((syncState.user && (syncState.user.displayName || syncState.user.email)) || "Google 帳號")}</strong>，資料會同步到你自己的 Firestore。</div>
        <div class="storage-copy">之後只要用同一個 Google 帳號登入，換手機或換電腦都能看到同一份訓練記錄。</div>
        <div class="storage-actions">
          ${localCount > 0 ? `<button class="button subtle" type="button" id="auth-migrate-btn">把這台裝置的本機資料同步上雲端</button>` : ""}
          <button class="button subtle" type="button" id="auth-sign-out-btn">登出 Google</button>
        </div>
      </div>
    `;
  } else {
    html = `
      <div class="storage-card">
        <span class="storage-status error">同步錯誤</span>
        <div class="storage-copy">雲端同步目前有問題，請先以本機模式使用。${syncState.error ? `<br><small>${escapeHtml(syncState.error)}</small>` : ""}</div>
        <div class="storage-actions">
          <button class="button subtle" type="button" id="auth-sign-out-btn">回到本機模式</button>
        </div>
      </div>
    `;
  }

  elements.storageNote.innerHTML = html;
  const signInButton = elements.storageNote.querySelector("#auth-sign-in-btn");
  const signOutButton = elements.storageNote.querySelector("#auth-sign-out-btn");
  const migrateButton = elements.storageNote.querySelector("#auth-migrate-btn");

  if (signInButton) {
    signInButton.addEventListener("click", handleSignIn);
  }
  if (signOutButton) {
    signOutButton.addEventListener("click", handleSignOut);
  }
  if (migrateButton) {
    migrateButton.addEventListener("click", migrateLocalToCloud);
  }
}

function renderHeadlineStats() {
  const metrics = getHeadlineMetrics();
  elements.headlineStats.innerHTML = metrics
    .map(
      (metric) => `
        <article class="stat-card">
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
  const reps = toNumber(elements.entryReps.value, 1);
  const rpe = toNumber(elements.entryRpe.value, 8);
  const rir = rirFromRpe(rpe);
  let text = `${LIFT_META[lift].label} 目前設定約為 ${formatNumber(rir, 1)} RIR。`;

  if (lift === "deadlift" && reps >= 6) {
    text += " 硬舉高次數的 RPE 準確度較不穩，建議保守調整。";
  } else if (rpe >= 9.5) {
    text += " 這已很接近極限，若不是測單日，建議保留一點緩衝。";
  } else {
    text += " 這樣的設定很適合作為日常訓練工作組。";
  }

  elements.entryHint.textContent = text;
}

function renderCalculators() {
  const lift = elements.estimateLift.value;
  const weight = toNumber(elements.estimateWeight.value);
  const reps = Math.max(1, toNumber(elements.estimateReps.value, 1));
  const rpe = toNumber(elements.estimateRpe.value, 6);
  const targetReps = Math.max(1, toNumber(elements.targetReps.value, 1));
  const targetRpe = toNumber(elements.targetRpe.value, 8);
  const e1rm = estimate1RM(weight, reps, rpe, state.profile.formula);
  const intensity = e1rm ? (weight / e1rm) * 100 : 0;
  const suggestedWeight = e1rm
    ? prescribeLoad(e1rm, targetReps, targetRpe, state.profile.formula, state.profile.rounding)
    : 0;
  const targetIntensity = e1rm ? (suggestedWeight / e1rm) * 100 : 0;

  elements.calcProjectedNumber.textContent = e1rm ? formatNumber(suggestedWeight, 1) : "0";
  elements.calcHeroMeta.textContent = e1rm
    ? `${LIFT_META[lift].label} · e1RM ${formatKg(e1rm)} · 約 ${formatNumber(targetIntensity, 1)}% e1RM`
    : "先輸入已完成組以建立推算基準";

  elements.estimateOutput.innerHTML = [
    {
      label: "估算 e1RM",
      value: formatKg(e1rm),
      copy: `根據 ${formatKg(weight)} x ${reps} @ RPE ${rpe} 推算，約等於 ${reps + rirFromRpe(rpe)} 次到力竭。`,
    },
    {
      label: "完成組強度",
      value: `${formatNumber(intensity, 1)}%`,
      copy: `這一組大約落在 ${formatNumber(intensity, 1)}% e1RM。`,
    },
  ]
    .map(renderResultCard)
    .join("");

  elements.targetOutput.innerHTML = [
    {
      label: "建議重量",
      value: e1rm ? formatKg(suggestedWeight) : "請先輸入",
      copy: e1rm
        ? `${targetReps} 下 @ RPE ${targetRpe} 約為 ${formatNumber(targetIntensity, 1)}% e1RM。`
        : "先輸入已完成組，系統才會知道你當天的推算基準。",
    },
    {
      label: "目標保留次數",
      value: `${formatNumber(rirFromRpe(targetRpe), 1)} RIR`,
      copy:
        lift === "deadlift" && targetReps >= 6
          ? "硬舉高次數的 RPE 變異較大，建議搭配速度或影片判斷。"
          : "這個數值依 RPE 10 = 0 RIR 的標準邏輯換算。",
    },
  ]
    .map(renderResultCard)
    .join("");

  renderPlateBreakdown(suggestedWeight);
  renderProjectionGrid(lift, e1rm, targetReps, targetRpe);
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

function renderPlateBreakdown(targetWeight) {
  if (!targetWeight) {
    elements.plateOutput.innerHTML = `
      <div class="empty-state">
        <p>先輸入已完成組與目標組條件，這裡就會顯示總重量與彩色槓片配置。</p>
      </div>
    `;
    return;
  }

  const breakdown = buildPlateBreakdown(targetWeight, state.profile.barbellWeight);
  const leftStack = renderPlateStack(breakdown.plates, "left");
  const rightStack = renderPlateStack(breakdown.plates, "right");
  const legend = breakdown.plates.length
    ? breakdown.plates
        .map((plate) => {
          const meta = PLATE_META[plate.size];
          return `
            <div class="plate-legend-item">
              <div><span class="legend-dot" style="background:${meta.color};"></span>${plate.size} kg ${meta.label}槓片</div>
              <div class="muted">每邊 x ${plate.count}</div>
            </div>
          `;
        })
        .join("")
    : `
      <div class="plate-legend-item">
        <div>目前僅空槓</div>
        <div class="muted">${formatKg(state.profile.barbellWeight)}</div>
      </div>
    `;

  elements.plateOutput.innerHTML = `
    <div class="plate-stage">
      <div class="plate-header">
        <div>
          <div class="result-label">總重量</div>
          <div class="plate-total">${formatKg(targetWeight)}</div>
          <div class="plate-subcopy">以 ${formatKg(state.profile.barbellWeight)} 槓鈴計算，每邊加重 ${formatKg(breakdown.perSide)}。</div>
        </div>
        <div class="plate-subcopy">${breakdown.remaining > 0 ? `仍有 ${formatKg(breakdown.remaining * 2)} 無法完整拆分，建議調整進位。` : "使用常見公斤槓片可完整拆分。"}</div>
      </div>
      <div class="barbell-wrap">
        <div class="barbell">
          <div class="barbell-shaft"></div>
          <div class="sleeve left"></div>
          <div class="sleeve right"></div>
          <div class="plate-stack left">${leftStack}</div>
          <div class="barbell-center"></div>
          <div class="plate-stack right">${rightStack}</div>
        </div>
      </div>
      <div class="plate-legend">${legend}</div>
    </div>
  `;
}

function renderPlateStack(plates, side) {
  const rendered = [];
  plates.forEach((plate) => {
    const meta = PLATE_META[plate.size];
    for (let index = 0; index < plate.count; index += 1) {
      rendered.push(`
        <div
          class="plate ${meta.className}"
          style="width:${meta.width}px;height:${meta.height}px;background:${meta.color};"
          aria-label="${side} ${plate.size} 公斤槓片"
        >
          <span>${plate.size}</span>
        </div>
      `);
    }
  });
  return rendered.join("");
}

function renderProjectionGrid(lift, oneRm, targetReps, targetRpe) {
  if (!oneRm) {
    elements.projectionGrid.innerHTML = `
      <div class="empty-state">
        <p>先輸入已完成組，快速參考表就會列出 1 到 12 下、RPE 5.0 到 10.0 的估計重量。</p>
      </div>
    `;
    return;
  }

  elements.projectionGrid.innerHTML = `
    <div class="projection-scroll">
      <table class="projection-table">
        <thead>
          <tr>
            <th>${LIFT_META[lift].label}</th>
            ${RPE_VALUES.map((rpe) => `<th class="${rpe >= 9 ? "col-high-rpe" : rpe >= 8 ? "col-mid-rpe" : ""}">RPE ${formatNumber(rpe, 1)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${TARGET_REPS.map((reps) => {
            return `
              <tr>
                <td>${reps} 下</td>
                ${RPE_VALUES.map((rpe) => {
                  const weight = prescribeLoad(oneRm, reps, rpe, state.profile.formula, state.profile.rounding);
                  const className = `${rpe >= 9 ? "col-high-rpe" : rpe >= 8 ? "col-mid-rpe" : ""}${reps === targetReps && rpe === targetRpe ? " target-cell" : ""}`;
                  return `<td class="${className.trim()}">${formatKg(weight)}</td>`;
                }).join("")}
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
    <p class="form-hint">這張表以你目前輸入的已完成組 e1RM 作為基準。標亮格是你現在選定的目標組。</p>
  `;
}

function renderLiftCards() {
  elements.liftCards.innerHTML = Object.keys(LIFT_META)
    .map((lift) => renderLiftCard(lift))
    .join("");
}

function renderLiftCard(lift) {
  const stats = getLiftStats(lift);
  return `
    <article class="lift-card ${lift}">
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
      <div class="trend-chart">${renderTrendChart(stats.timeline, lift)}</div>
      <div class="trend-label">${stats.latestDate ? `${formatDate(stats.latestDate)} · e1RM ${formatKg(stats.latestE1RM)}` : "新增訓練後會顯示走勢。"}</div>
    </article>
  `;
}

function renderRecentPrs() {
  const items = getRecentPrs();
  if (items.length === 0) {
    elements.recentPrFeed.innerHTML = elements.emptyTemplate.innerHTML;
    return;
  }
  elements.recentPrFeed.innerHTML = items
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
  const entries = getEnrichedEntries();
  if (entries.length === 0) {
    elements.tableBody.innerHTML = `<tr><td colspan="8">${elements.emptyTemplate.innerHTML}</td></tr>`;
    return;
  }

  elements.tableBody.innerHTML = entries
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
          <td>RPE ${formatNumber(entry.rpe, 1)}<span class="log-meta">${formatNumber(entry.rir, 1)} RIR</span></td>
          <td>${formatKg(entry.e1rm)}<span class="log-meta">${formatNumber(entry.intensity, 1)}% e1RM</span></td>
          <td>${formatKg(entry.volume)}</td>
          <td>${entry.notes ? `<span class="log-notes">${escapeHtml(entry.notes)}</span>` : `<span class="log-notes">-</span>`}</td>
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

async function handleTableAction(event) {
  const { action, id } = event.currentTarget.dataset;
  if (action === "duplicate") {
    const source = state.entries.find((entry) => entry.id === id);
    if (!source) {
      return;
    }
    const duplicated = { ...source, id: crypto.randomUUID(), date: dateInputValue(new Date()) };
    if (isCloudMode()) {
      await saveEntryToCloud(duplicated);
    } else {
      state.entries.push(duplicated);
      sortEntries();
      persistStateLocal();
      renderApp();
    }
    return;
  }

  if (action === "delete") {
    if (isCloudMode()) {
      await deleteEntryFromCloud(id);
    } else {
      state.entries = state.entries.filter((entry) => entry.id !== id);
      persistStateLocal();
      renderApp();
    }
  }
}

function exportJson() {
  downloadFile("sbd-lab-data.json", JSON.stringify(state, null, 2), "application/json");
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
    entry.bodyweight !== null && entry.bodyweight !== undefined ? entry.bodyweight : "",
    `"${(entry.notes || "").replaceAll('"', '""')}"`,
  ]);

  const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
  downloadFile("sbd-lab-data.csv", csv, "text/csv;charset=utf-8");
}

async function importJson(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      const nextState = normalizeImportedState(parsed);

      if (isCloudMode()) {
        const batch = writeBatch(syncState.db);
        nextState.entries.forEach((entry) => {
          batch.set(doc(syncState.db, "users", syncState.user.uid, "sbd-entries", entry.id), entry);
        });
        await batch.commit();
        state.profile = nextState.profile;
        await saveProfileToCloud();
        hydrateProfileInputs();
        renderApp();
      } else {
        state.profile = nextState.profile;
        state.ui = nextState.ui;
        state.entries = nextState.entries;
        sortEntries();
        persistStateLocal();
        hydrateProfileInputs();
        renderApp();
      }
    } catch (error) {
      window.alert("匯入失敗，請確認 JSON 格式正確。");
    } finally {
      elements.importFile.value = "";
    }
  };
  reader.readAsText(file);
}

async function clearAllData() {
  const ok = window.confirm("這會清空目前的訓練資料，確定繼續嗎？");
  if (!ok) {
    return;
  }

  if (isCloudMode()) {
    const entries = [...state.entries];
    const batch = writeBatch(syncState.db);
    entries.forEach((entry) => {
      batch.delete(doc(syncState.db, "users", syncState.user.uid, "sbd-entries", entry.id));
    });
    await batch.commit();
    state.profile = structuredClone(DEFAULT_STATE.profile);
    await saveProfileToCloud();
    hydrateProfileInputs();
    renderApp();
  } else {
    state.profile = structuredClone(DEFAULT_STATE.profile);
    state.ui = structuredClone(DEFAULT_STATE.ui);
    state.entries = [];
    persistStateLocal();
    hydrateProfileInputs();
    setDefaultDate();
    renderApp();
  }
}

async function initFirebase() {
  if (!isFirebaseConfigured(firebaseConfig)) {
    syncState.mode = "config-missing";
    renderStorageNote();
    return;
  }

  try {
    syncState.app = initializeApp(firebaseConfig);
    syncState.auth = getAuth(syncState.app);
    syncState.db = getFirestore(syncState.app);
    syncState.provider = new GoogleAuthProvider();
    syncState.provider.setCustomParameters({ prompt: "select_account" });

    await setPersistence(syncState.auth, browserLocalPersistence);

    syncState.ready = true;
    syncState.mode = "signed-out";
    renderStorageNote();

    onAuthStateChanged(syncState.auth, (user) => {
      if (syncState.unsubscribeEntries) {
        syncState.unsubscribeEntries();
        syncState.unsubscribeEntries = null;
      }

      syncState.user = user;

      if (!user) {
        const local = loadState();
        state.entries = local.entries;
        state.profile = local.profile;
        state.ui = local.ui;
        hydrateProfileInputs();
        syncState.mode = "signed-out";
        renderApp();
        return;
      }

      syncState.mode = "syncing";
      renderStorageNote();
      subscribeToCloudData(user.uid);
    });
  } catch (error) {
    syncState.mode = "error";
    syncState.error = stringifyError(error);
    renderStorageNote();
  }
}

function subscribeToCloudData(uid) {
  getDoc(doc(syncState.db, "users", uid, "sbd-profile", "data"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        state.profile = { ...DEFAULT_STATE.profile, ...snapshot.data() };
      } else {
        setDoc(doc(syncState.db, "users", uid, "sbd-profile", "data"), state.profile).catch(console.error);
      }
      hydrateProfileInputs();
    })
    .catch(console.error);

  syncState.unsubscribeEntries = onSnapshot(
    collection(syncState.db, "users", uid, "sbd-entries"),
    (snapshot) => {
      state.entries = snapshot.docs.map((item) => normalizeEntry(item.data())).filter(Boolean);
      sortEntries();
      syncState.mode = "cloud";
      persistStateLocal();
      renderApp();
    },
    (error) => {
      syncState.mode = "error";
      syncState.error = stringifyError(error);
      renderStorageNote();
    },
  );
}

async function handleSignIn() {
  if (!syncState.ready) {
    return;
  }
  try {
    syncState.mode = "signing-in";
    renderStorageNote();
    await signInWithPopup(syncState.auth, syncState.provider);
  } catch (error) {
    syncState.mode = "signed-out";
    syncState.error = stringifyError(error);
    renderStorageNote();
  }
}

async function handleSignOut() {
  if (!syncState.auth) {
    return;
  }
  try {
    await signOut(syncState.auth);
  } catch (error) {
    syncState.mode = "error";
    syncState.error = stringifyError(error);
    renderStorageNote();
  }
}

async function migrateLocalToCloud() {
  if (!isCloudMode()) {
    return;
  }
  const localEntries = loadLocalEntries();
  if (localEntries.length === 0) {
    window.alert("這台裝置目前沒有可同步的本機資料。");
    return;
  }
  const batch = writeBatch(syncState.db);
  localEntries.forEach((entry) => {
    batch.set(doc(syncState.db, "users", syncState.user.uid, "sbd-entries", entry.id), entry);
  });
  await batch.commit();
}

async function saveEntryToCloud(entry) {
  await setDoc(doc(syncState.db, "users", syncState.user.uid, "sbd-entries", entry.id), entry);
}

async function deleteEntryFromCloud(id) {
  await deleteDoc(doc(syncState.db, "users", syncState.user.uid, "sbd-entries", id));
}

async function saveProfileToCloud() {
  if (!isCloudMode()) {
    return;
  }
  await setDoc(doc(syncState.db, "users", syncState.user.uid, "sbd-profile", "data"), state.profile);
}

function getHeadlineMetrics() {
  const entries = getEnrichedEntries();
  const sessions = new Set(entries.map((entry) => entry.date)).size;
  const volume = entries.reduce((sum, entry) => sum + entry.volume, 0);
  const totalE1RM = Object.keys(LIFT_META)
    .map((lift) => getLiftStats(lift).bestE1RM || 0)
    .reduce((sum, value) => sum + value, 0);

  return [
    {
      label: "SBD e1RM Total",
      value: totalE1RM ? formatKg(totalE1RM) : "尚無資料",
      helper: "把深蹲、臥推、硬舉最佳 e1RM 相加，看整體力量面。",
    },
    {
      label: "總訓練容量",
      value: volume ? formatKg(volume) : "0 kg",
      helper: "所有已記錄工作組的重量 x 次數 x 組數總和。",
    },
    {
      label: "訓練天數",
      value: String(sessions),
      helper: "依日期去重後計算，可快速看週期密度。",
    },
    {
      label: "最近 PR",
      value: String(getRecentPrs().length),
      helper: "自動追蹤重量 PR、e1RM PR 與容量 PR。",
    },
  ];
}

function getLiftStats(lift) {
  const entries = getEnrichedEntries()
    .filter((entry) => entry.lift === lift)
    .sort((a, b) => a.date.localeCompare(b.date));
  const bestWeight = entries.reduce((max, entry) => Math.max(max, entry.weight), 0);
  const bestE1RM = entries.reduce((max, entry) => Math.max(max, entry.e1rm), 0);
  const bestSingle = entries.filter((entry) => entry.reps === 1).reduce((max, entry) => Math.max(max, entry.weight), 0);

  const timelineMap = new Map();
  entries.forEach((entry) => {
    timelineMap.set(entry.date, Math.max(timelineMap.get(entry.date) || 0, entry.e1rm));
  });

  const timeline = Array.from(timelineMap.entries()).map(([date, e1rm]) => ({ date, e1rm }));
  const latest = timeline.length > 0 ? timeline[timeline.length - 1] : null;

  return {
    entries,
    bestWeight,
    bestE1RM,
    bestSingle,
    timeline,
    latestDate: latest ? latest.date : "",
    latestE1RM: latest ? latest.e1rm : 0,
  };
}

function getRecentPrs() {
  const records = {
    squat: { weight: 0, e1rm: 0, volume: 0 },
    bench: { weight: 0, e1rm: 0, volume: 0 },
    deadlift: { weight: 0, e1rm: 0, volume: 0 },
  };
  const feed = [];

  getEnrichedEntries()
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((entry) => {
      const current = records[entry.lift];
      if (entry.weight > current.weight) {
        current.weight = entry.weight;
        feed.push({ date: entry.date, lift: entry.lift, kind: "重量 PR", detail: `${formatKg(entry.weight)} x ${entry.reps} @ RPE ${formatNumber(entry.rpe, 1)}` });
      }
      if (entry.e1rm > current.e1rm) {
        current.e1rm = entry.e1rm;
        feed.push({ date: entry.date, lift: entry.lift, kind: "e1RM PR", detail: `e1RM 更新到 ${formatKg(entry.e1rm)}` });
      }
      if (entry.volume > current.volume) {
        current.volume = entry.volume;
        feed.push({ date: entry.date, lift: entry.lift, kind: "容量 PR", detail: `${formatKg(entry.weight)} x ${entry.reps} x ${entry.sets}` });
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
    return { ...entry, rir, e1rm, intensity, volume };
  });
}

function renderTrendChart(points, lift) {
  if (points.length === 0) {
    return `
      <svg class="trend-svg" viewBox="0 0 320 120" preserveAspectRatio="none">
        <rect x="0" y="0" width="320" height="120" rx="12" fill="rgba(255,255,255,0.55)" />
        <text x="18" y="66" fill="#627081" font-size="14">尚無資料</text>
      </svg>
    `;
  }

  if (points.length === 1) {
    return `
      <svg class="trend-svg" viewBox="0 0 320 120" preserveAspectRatio="none">
        <rect x="0" y="0" width="320" height="120" rx="12" fill="rgba(255,255,255,0.55)" />
        <circle cx="160" cy="60" r="6" fill="${LIFT_META[lift].color}" />
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
    <svg class="trend-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <rect x="0" y="0" width="${width}" height="${height}" rx="14" fill="rgba(255,255,255,0.55)" />
      <polyline fill="none" stroke="${LIFT_META[lift].color}" stroke-width="4" points="${coords.join(" ")}" />
      ${coords.map((point) => {
        const [x, y] = point.split(",");
        return `<circle cx="${x}" cy="${y}" r="4" fill="${LIFT_META[lift].color}"></circle>`;
      }).join("")}
    </svg>
  `;
}

function estimate1RM(weight, reps, rpe, formula) {
  const normalizedWeight = toNumber(weight);
  const repsToFailure = Math.max(1, toNumber(reps, 1)) + rirFromRpe(rpe);
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
  const repsToFailure = Math.max(1, toNumber(reps, 1)) + rirFromRpe(rpe);
  if (!orm) {
    return 0;
  }

  const rawWeight =
    formula === "brzycki"
      ? orm / (36 / (37 - Math.min(repsToFailure, 36)))
      : orm / (1 + repsToFailure / 30);

  return roundToIncrement(rawWeight, increment || 2.5);
}

function rirFromRpe(rpe) {
  return clamp(10 - toNumber(rpe), 0, 5);
}

function buildPlateBreakdown(targetWeight, barbellWeight) {
  const plateSizes = [25, 20, 15, 10, 5, 2.5, 1.25];
  const totalTarget = Math.max(0, roundToIncrement(targetWeight, 0.5));
  const perSide = Math.max(0, (totalTarget - barbellWeight) / 2);
  let remainder = perSide;
  const plates = [];

  plateSizes.forEach((size) => {
    const count = Math.floor((remainder + 1e-9) / size);
    if (count > 0) {
      plates.push({ size, count });
      remainder = roundToIncrement(remainder - size * count, 0.25);
    }
  });

  return { perSide, plates, remaining: remainder };
}

function normalizeEntry(data) {
  if (!data) {
    return null;
  }
  const entry = {
    id: data.id || crypto.randomUUID(),
    date: data.date || dateInputValue(new Date()),
    lift: Object.prototype.hasOwnProperty.call(LIFT_META, data.lift) ? data.lift : "squat",
    variant: data.variant || "",
    block: data.block || "",
    weight: toNumber(data.weight),
    reps: Math.max(1, toNumber(data.reps, 1)),
    sets: Math.max(1, toNumber(data.sets, 1)),
    rpe: clamp(toNumber(data.rpe, 8), 5, 10),
    bodyweight: data.bodyweight === null || data.bodyweight === undefined ? null : toNumber(data.bodyweight),
    notes: data.notes || "",
  };
  return entry.weight > 0 ? entry : null;
}

function fillRpeSelect(select, defaultValue) {
  select.innerHTML = RPE_VALUES.map((value) => `<option value="${value}" ${value === defaultValue ? "selected" : ""}>${formatNumber(value, 1)}</option>`).join("");
}

function fillRepSelect(select, maxReps, defaultValue) {
  select.innerHTML = Array.from({ length: maxReps }, (_, index) => index + 1)
    .map((value) => `<option value="${value}" ${value === defaultValue ? "selected" : ""}>${value} 下</option>`)
    .join("");
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeImportedState(JSON.parse(raw)) : structuredClone(DEFAULT_STATE);
  } catch (error) {
    return structuredClone(DEFAULT_STATE);
  }
}

function loadLocalEntries() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && Array.isArray(parsed.entries) ? parsed.entries.map(normalizeEntry).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function normalizeImportedState(data) {
  const profile = {
    athleteName: data && data.profile && data.profile.athleteName ? data.profile.athleteName : "",
    formula: data && data.profile && data.profile.formula === "brzycki" ? "brzycki" : "epley",
    rounding: toNumber(data && data.profile ? data.profile.rounding : 2.5, 2.5),
    barbellWeight: toNumber(data && data.profile ? data.profile.barbellWeight : 20, 20),
  };
  const ui = {
    activeView: data && data.ui && VALID_VIEWS.includes(data.ui.activeView) ? data.ui.activeView : "calculator",
  };
  const entries = data && Array.isArray(data.entries) ? data.entries.map(normalizeEntry).filter(Boolean) : [];
  return { profile, ui, entries };
}

function persistStateLocal() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrateProfileInputs() {
  elements.athleteName.value = state.profile.athleteName;
  elements.formula.value = state.profile.formula;
  elements.rounding.value = String(state.profile.rounding);
  elements.barbellWeight.value = String(state.profile.barbellWeight);
}

function setActiveView(view) {
  if (!VALID_VIEWS.includes(view)) {
    return;
  }
  state.ui.activeView = view;
  persistStateLocal();
  applyActiveView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyActiveView() {
  const view = VALID_VIEWS.includes(state.ui.activeView) ? state.ui.activeView : "calculator";
  elements.sectionViews.forEach((section) => {
    section.hidden = section.dataset.view !== view;
  });
  elements.viewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.viewTarget === view);
  });
}

function sortEntries() {
  state.entries.sort((a, b) => a.date.localeCompare(b.date));
}

function setDefaultDate() {
  elements.entryDate.value = dateInputValue(new Date());
}

function dateInputValue(date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

function formatDate(dateString) {
  try {
    return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "short", day: "numeric" }).format(new Date(`${dateString}T00:00:00`));
  } catch (error) {
    return dateString;
  }
}

function formatKg(value) {
  return `${formatNumber(value, 1)} kg`;
}

function formatNumber(value, digits = 0) {
  return Number(value || 0).toLocaleString("zh-TW", {
    minimumFractionDigits: digits > 0 && value % 1 !== 0 ? Math.min(digits, 1) : 0,
    maximumFractionDigits: digits,
  });
}

function roundToIncrement(value, increment) {
  return increment ? Math.round(value / increment) * increment : value;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isCloudMode() {
  return syncState.mode === "cloud" || syncState.mode === "syncing";
}

function isFirebaseConfigured(config) {
  const keys = ["apiKey", "authDomain", "projectId", "appId"];
  return keys.every((key) => {
    const value = String(config && config[key] ? config[key] : "").trim();
    return value && !value.startsWith("YOUR_");
  });
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

function stringifyError(error) {
  if (!error) {
    return "";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error.code) {
    return `${error.code}: ${error.message || ""}`.trim();
  }
  return error.message || String(error);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
}
