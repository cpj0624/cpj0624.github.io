# 陳品均｜個人數位名片

> **線上網址**：https://cpj0624.github.io/

輕量單頁式個人數位名片網頁，採用深炭黑 × 鋼藍現代極簡深色風格，並採「資料與畫面分離」之純原生 HTML / CSS / ES Module JavaScript ＋ JSON 架構建置，部署於 GitHub Pages。

## 頁面架構

- **頂部即時捲動進度條**：隨頁面捲動於 `0%`–`100%` 平滑連動
- **置中主視覺（Hero）**：個人攝影頭像、頂部柔和鋼藍光暈、姓名打字機動畫、「每天都想躺」定位、一鍵複製電子郵件與名片行動條碼
- **關於我**：獨立深色圓角卡片 ＋ 個人關鍵字標籤（國立臺中科技大學、資訊工程科、學生會、資工科學會、羽球、攝影、咖啡廳）
- **經歷與學歷**：由 `data/experiences.json` 動態渲染之垂直軌道圓點時間軸（學生自治與科會經歷、競賽與活動經驗、學歷背景與交流結尾列）
- **聯絡與連結**：圓形社群與工具列（Instagram、電子郵件、臺中科大資訊工程科學會官網、名片碼、分享連結）＋ 信箱快速複製條

## 目錄結構

- `index.html`：語意骨架、SEO 與 GEO 結構化資料（`Person` / `WebSite` / `ProfilePage` / `FAQPage` / `BreadcrumbList`）、資源預載與向量 QR Code 彈窗
- `styles.css`：深炭黑 × 鋼藍樣式系統與平板／手機響應式設計
- `data/experiences.json`：幹部經歷、競賽活動與學歷純資料檔（新增經歷只需編輯此檔）
- `js/main.js`、`js/timeline.js`、`js/ui.js`、`js/utils.js`：ES Module 互動與時間軸渲染模組（含 HTML 跳脫防 XSS）
- `assets/avatar.jpg`：個人頭像照片（1024×1024）
- `favicon.ico`、`favicon.png`、`assets/favicon-32x32.png`、`assets/apple-touch-icon.png`、`assets/logo-cpj.png`：網站分頁小圖（Favicon）、手機桌面圖示與導覽列品牌標誌
- `og-image.png`：社群連結預覽圖（1200×630）

## 日後自行修改指南

### 1. 新增或調整經歷與活動
直接編輯 `gh-pages` 分支中的 `data/experiences.json`，在對應的 `groups` 內新增物件（`term`、`title`、`subtitle`、`role`；若未來需要點擊跳轉可選填 `link`），提交後 GitHub Pages 會自動更新。

### 2. 日後更換其他個人頭像照
直接將新的正方形照片命名為 `avatar.jpg` 並覆蓋 `assets/avatar.jpg`，推送後網頁頭像即會更新。
