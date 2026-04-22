# Firebase 設定步驟

SBD Lab 已內建 Google 登入 + Firebase Firestore 雲端同步。
完成以下步驟後，即可在不同手機 / 電腦用同一帳號存取訓練資料。

---

## 1. 建立 Firebase 專案

前往 Firebase Console：https://console.firebase.google.com/

點「新增專案」，命名後建立。

---

## 2. 新增 Web App

在專案首頁：
1. 點「新增應用程式」→ 選「Web」
2. 為 app 命名，不需勾選 Firebase Hosting
3. 複製出現的 `firebaseConfig` 物件

---

## 3. 填入設定

把取得的設定貼到 `firebase-config.js`，取代所有 `YOUR_...` 佔位符：

```js
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

---

## 4. 啟用 Google 登入

在 Firebase Console：
1. 左側選「Authentication」→「Sign-in method」
2. 啟用「Google」提供者
3. 填入支援 email（你的 Gmail）→「儲存」

---

## 5. 加入授權網域

同樣在 Authentication 設定：
1. 切換到「Authorized domains」
2. 確認已有 `ncusspm25.github.io`（GitHub Pages 網址）
3. 如有需要也可加 `localhost`

---

## 6. 建立 Firestore Database

1. 左側選「Firestore Database」→「建立資料庫」
2. 選「Production mode」
3. 選離你近的 region（例如 asia-east1 台灣/香港）

---

## 7. 設定 Security Rules

在 Firestore → Rules，貼上 `firestore.rules` 的內容：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/sbd-entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/sbd-profile/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 8. 推到 GitHub Pages

```bash
cd d:\AI_dev\SBD
git add .
git commit -m "Add Firebase auth and Firestore sync"
git push
```

幾分鐘後網站更新：https://ncusspm25.github.io/record_sbd/

---

## 9. 第一次使用

1. 打開網站 → 切到「總覽」→「訓練設定」面板
2. 按「使用 Google 登入」
3. 登入你的 Google 帳號
4. 登入後面板顯示「雲端模式」即表示成功
5. 如有舊的本機資料，會出現「把本機資料同步到雲端」按鈕

---

## 注意事項

- `firebase-config.js` 中的 apiKey 放在前端是正常做法，不代表資料公開
- 真正保護資料的是 Firebase Authentication + Firestore Security Rules
- 同一 Google 帳號在任何裝置都能同步訓練記錄
- 未登入時退回本機模式，資料仍在 localStorage 可正常使用
