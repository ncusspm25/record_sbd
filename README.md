# SBD Lab

SBD Lab 是一個以公斤制為主的 SBD 訓練記錄與 RPE 推算工具，支援：

- 深蹲、臥推、硬舉訓練記錄
- 已完成組推算目標組重量
- RPE 5.0 到 10.0，0.5 一格
- e1RM 與 PR 追蹤
- 槓片配置與彩色槓片示意
- JSON / CSV 匯出匯入
- 本機儲存
- Google 登入 + Firebase Firestore 雲端同步

## 網站

```text
https://ncusspm25.github.io/record_sbd/
```

## 本機啟動

```powershell
cd d:\AI_dev\SBD
python -m http.server 8080
```

然後開啟：

```text
http://127.0.0.1:8080
```

## 資料儲存方式

未登入時：

- 資料存在目前裝置的瀏覽器 `localStorage`
- 換手機、換瀏覽器、清除網站資料後，不會自動帶過去

登入 Google 並完成 Firebase 設定後：

- 資料會同步到你的 Firestore
- 用同一個 Google 帳號登入不同裝置時，可以看到同一份訓練記錄

## Firebase 設定

請參考：

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- [firestore.rules](./firestore.rules)
- [firebase-config.js](./firebase-config.js)

## 研究依據

截至 2026-04-22，影響此 app 設計的代表性研究包含：

1. Autoregulated resistance training for maximal strength enhancement  
   https://pubmed.ncbi.nlm.nih.gov/40791980/

2. Validity of Rating of Perceived Exertion Scales During Resistance Exercise  
   https://pubmed.ncbi.nlm.nih.gov/38910451/

3. Predictive Validity of Individualised Load-Velocity Relationships for 1RM  
   https://pubmed.ncbi.nlm.nih.gov/37493929/

4. The efficacy of repetitions-in-reserve vs. traditional percentage-based training  
   https://link.springer.com/article/10.1007/s11332-021-00837-5

5. Self-Rated Accuracy of RPE-Based Load Prescription in Powerlifters  
   https://pubmed.ncbi.nlm.nih.gov/28933716/
