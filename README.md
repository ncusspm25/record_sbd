# SBD Lab

SBD Lab 是一個以公斤制為主的靜態前端 app，提供：

- 深蹲、臥推、硬舉訓練記錄
- RPE / RIR 換算
- e1RM 估算
- PR 追蹤
- CSV / JSON 匯出匯入
- 本機離線快取

## 使用方式

直接開啟 [index.html](./index.html) 即可使用。

如果你想用本機伺服器啟動，也可以在這個資料夾執行：

```powershell
python -m http.server 8080
```

然後開啟 `http://localhost:8080`。

## GitHub Pages

這個專案可以直接用 GitHub Pages 以靜態網站方式發布：

1. 到 repository 的 `Settings`
2. 打開 `Pages`
3. `Source` 選 `Deploy from a branch`
4. `Branch` 選 `main`，資料夾選 `/ (root)`
5. 儲存後等待 GitHub 建置完成

預設網站網址會是：

```text
https://ncusspm25.github.io/record_sbd/
```

## 設計依據

這個 app 的核心邏輯是：

- 用 `RPE -> RIR` 映射做單組與工作組強度描述
- 用 `完成重量 + reps + RPE` 估算 e1RM
- 用 PR 分成重量 PR、e1RM PR、容量 PR
- 對硬舉高次數保守解讀 RPE

截至 2026-04-22，影響此 app 設計的代表性研究包含：

1. `Autoregulated resistance training for maximal strength enhancement: A systematic review and network meta-analysis`  
   2025 年期刊摘要顯示，APRE 在背蹲與臥推 1RM 排名最高，其次為 VBRT，再來是 RPE。  
   來源：https://pubmed.ncbi.nlm.nih.gov/40791980/

2. `Validity of Rating of Perceived Exertion Scales in Relation to Movement Velocity and Exercise Intensity During Resistance-Exercise: A Systematic Review`  
   2024 系統性回顧指出，RPE 與速度、強度有中度正相關，適合用來監控，但不等於高精度儀器。  
   來源：https://pubmed.ncbi.nlm.nih.gov/38910451/

3. `The Predictive Validity of Individualised Load-Velocity Relationships for Predicting 1RM: A Systematic Review and Individual Participant Data Meta-analysis`  
   2023 統合分析指出，利用速度關係預估 1RM 的效度只有中等，並常有高估傾向。  
   來源：https://pubmed.ncbi.nlm.nih.gov/37493929/

4. `The efficacy of repetitions-in-reserve vs. traditional percentage-based resistance training`  
   2021 研究指出，RIR 整體準確度可接受，但硬舉在較高次數時較不穩。  
   來源：https://link.springer.com/article/10.1007/s11332-021-00837-5

5. `Self-Rated Accuracy of Rating of Perceived Exertion-Based Load Prescription in Powerlifters`  
   2017 研究直接支持 powerlifters 使用 RIR-based RPE 選重的實務可行性。  
   來源：https://pubmed.ncbi.nlm.nih.gov/28933716/

6. `Novel Resistance Training-Specific Rating of Perceived Exertion Scale Measuring Repetitions in Reserve`  
   2016 研究建立了力量訓練常用的 RPE ↔ RIR 實務架構。  
   來源：https://pubmed.ncbi.nlm.nih.gov/26595188/

## 計算說明

預設使用 `Epley + RIR`：

```text
e1RM = 重量 * (1 + (reps + RIR) / 30)
```

其中：

```text
RIR = 10 - RPE
```

例如：

```text
150 kg x 5 @ RPE 8
RIR = 2
reps to failure = 7
e1RM ≈ 150 * (1 + 7 / 30) = 185.0 kg
```

你也可以在 app 內切換成 `Brzycki + RIR`。
