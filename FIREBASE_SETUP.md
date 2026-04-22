# Firebase 設定說明

SBD Lab 可以像你的記帳專案一樣，使用 Google 登入加上 Firebase Firestore 做雲端同步。

## 1. 建立 Firebase 專案

到 Firebase Console 建立一個新專案：

```text
https://console.firebase.google.com/
```

## 2. 建立 Web App

在專案內新增 Web App，拿到 `firebaseConfig`。

## 3. 填入 `firebase-config.js`

把 [firebase-config.js](./firebase-config.js) 裡的 `YOUR_...` 改成你自己的設定：

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

## 4. 啟用 Google 登入

在 Firebase Console：

1. 打開 `Authentication`
2. 進入 `Sign-in method`
3. 啟用 `Google`

## 5. 加入授權網域

在 Authentication 的授權網域中加入：

```text
ncusspm25.github.io
```

如果你要本機測試，也請保留：

```text
localhost
```

## 6. 建立 Firestore Database

在 Firebase Console：

1. 打開 `Firestore Database`
2. 建立資料庫
3. 建議選擇離台灣較近的區域

## 7. 設定 Firestore Rules

把 [firestore.rules](./firestore.rules) 的內容貼到 Firestore Rules 並發布。

規則會限制成：

- 只有登入使用者能讀寫自己的訓練資料
- 其他路徑全部拒絕

## 8. 推到 GitHub Pages

```powershell
cd d:\AI_dev\SBD
git add .
git commit -m "Configure Firebase sync"
git push
```

網站網址：

```text
https://ncusspm25.github.io/record_sbd/
```

## 9. 同步邏輯

未登入時：

- 資料存在瀏覽器本機

登入後：

- 資料同步到 `users/{uid}/sbd-entries`
- 個人設定同步到 `users/{uid}/sbd-profile/data`
