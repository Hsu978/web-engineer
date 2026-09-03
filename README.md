# AmberPDF（Next.js 15 App Router 版）

## 專案目標
以 **Next.js 15 App Router** 建置 PDF 工具網站，確保內容頁具備 SSR/SSG 能力與完整 SEO metadata，並維持「快速、免費、免註冊」的產品定位。

---

## 已完成（Currently completed features）

1. **Next.js 15 架構完成**
   - App Router 結構 (`app/`)
   - TypeScript 設定
   - 共用版型：左側工具導覽 + 右上方案/主題切換

2. **核心頁面路由完成（SSR/SSG）**
   - `/`
   - `/merge-pdf`
   - `/compress-pdf`
   - `/pdf-to-word`
   - `/compress-image`（開發中）
   - `/heic-to-jpg`（開發中）

3. **SEO 規範完成**
   - 每個頁面皆有 `generateMetadata()`
   - 各頁獨立：title、description、canonical、Open Graph、Twitter Card
   - `app/sitemap.ts` 自動產生 sitemap
   - `app/robots.ts` 自動產生 robots

4. **導覽實作完成**
   - 所有內部連結使用 Next.js `Link`
   - 皆為真實 `href` 路由
   - 側欄「預留擴充」已改為 **「開發中」**

5. **每頁 h1 規範完成**
   - 每一個路由頁面皆「有且僅有一個 h1」

6. **PDF 工具功能（MVP）**
   - 合併 PDF：多檔上傳、拖曳排序、移除、輸出下載
   - 壓縮 PDF：三段壓縮策略、預估大小、實際縮小百分比
   - PDF 轉 Word：第三方 API 串接層（含 OCR 偵測提示、兩種回應模式）

---

## 路由與功能入口（Summary of URIs）

- `GET /` 首頁
- `GET /merge-pdf` 合併工具
- `GET /compress-pdf` 壓縮工具
- `GET /pdf-to-word` 轉 Word 工具
- `GET /compress-image` 開發中
- `GET /heic-to-jpg` 開發中
- `GET /sitemap.xml`（由 `app/sitemap.ts` 產生）
- `GET /robots.txt`（由 `app/robots.ts` 產生）

---

## PDF-to-Word API 串接格式（MVP）
前端以 `multipart/form-data` POST：
- `file`（PDF）
- `source=pdf`
- `target=docx`
- `ocr=true|false`
- `page_count=number`

支援回應模式：
1. JSON 模式：`{ download_url: "..." }`
2. Blob 模式：直接回傳 `.docx`

> 注意：若第三方 API 需要私密金鑰，不能放在前端，必須改由後端代理。

---

## 尚未完成（Features not yet implemented）
1. 真實會員系統（Email / Google OAuth）
2. 真實訂閱金流（月付/年付）
3. 後端檔案 2 小時自動刪除排程與稽核
4. 優先處理佇列與批次後端工作流
5. 自建高保真 PDF-to-Word 引擎

---

## 技術選型
- Next.js 15（App Router）
- React 18 + TypeScript
- pdf-lib（合併）
- pdfjs-dist（解析、文字層偵測）
- jsPDF（壓縮輸出）

---

## 公開網址（Public URLs）
- Production：https://webengineer1989.com
- Canonical / Sitemap 網域來源：`NEXT_PUBLIC_SITE_URL`（未設定時預設為 https://webengineer1989.com）

> 部署前請先設定 `NEXT_PUBLIC_SITE_URL` 為正式網域，確保 canonical、OG、sitemap 指向正確網址。

---

## 建議下一步（Recommended next steps）
1. 串接正式第三方 PDF-to-Word 商用 API（含 SLA）
2. 加入 OAuth + 訂閱金流
3. 設置 Search Console 與 sitemap 提交
4. 補上圖片工具正式功能頁
