# 陳品均｜個人數位名片

> **線上網址**：https://cpj0624.github.io/

輕量單頁式個人數位名片網頁，採用現代極簡專業風格（藍、灰、白、黑配色），純靜態 HTML / CSS / JavaScript 建置，部署於 GitHub Pages。

## 頁面架構

- **主視覺（Hero）**：姓名、就讀學校與科系、個人一句話定位、一鍵複製信箱與名片行動條碼
- **01 / 關於我**：簡潔個人簡介與關鍵資訊條
- **02 / 經歷與學歷**：學生自治與資訊工程科學會幹部經歷、學歷背景
- **03 / 聯絡與連結**：Instagram、電子郵件（防靜態爬蟲組裝與一鍵複製）、GitHub、臺中科大資訊工程科學會官網，以及名片 QR Code 與分享功能

## 檔案說明

- `index.html`：頁面內容、SEO 與社群分享中繼標籤、向量 QR Code 彈窗
- `styles.css`：現代極簡版面與響應式設計樣式系統
- `script.js`：信箱一鍵複製、名片碼彈窗、原生分享與捲動狀態互動
- `favicon.svg`：網站分頁幾何縮寫圖示
- `og-image.png`：社群連結預覽圖（1200×630）

## 日後自行修改指南

### 1. 修改個人文字或新增連結
直接編輯 `gh-pages` 分支中的 `index.html` 對應區塊文字，儲存提交後 GitHub Pages 會自動更新上線。

### 2. 日後更換為個人形象照
1. 將個人照片（建議正方形 `800×800 px` 以上）存成 `assets/avatar.jpg`。
2. 在 `index.html` 中找到 `<div class="monogram-frame" ...>`，將內部替換為：

```html
<div class="monogram-frame">
  <img class="avatar-photo" src="assets/avatar.jpg" alt="陳品均個人形象照">
</div>
```
