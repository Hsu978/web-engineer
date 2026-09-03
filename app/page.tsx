import Link from 'next/link';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'AmberPDF｜快速免費 PDF 工具',
    description: '免安裝、免註冊，快速完成 PDF 合併與壓縮，並支援 PDF 轉 Word 串接流程。',
    path: '/'
  });
}

export default function HomePage() {
  return (
    <>
      <section className="page-card hero-card">
        <h1>快速、免費、免註冊的 PDF 處理工具</h1>
        <p>沉著如石墨，精準如金。上傳即用，節省每一次等待。</p>
      </section>

      <section className="page-card grid-3">
        <Link className="feature-card" href="/merge-pdf">
          <h2>合併 PDF</h2>
          <p>支援多檔上傳、拖曳排序、單次輸出。</p>
        </Link>
        <Link className="feature-card" href="/compress-pdf">
          <h2>壓縮 PDF</h2>
          <p>三段壓縮等級，平衡畫質與體積。</p>
        </Link>
        <Link className="feature-card" href="/pdf-to-word">
          <h2>PDF 轉 Word</h2>
          <p>已接上第三方 API MVP 與 OCR 提示流程。</p>
        </Link>
      </section>

      <section className="page-card panel">
        <h2>產品優勢</h2>
        <ul>
          <li>免安裝：瀏覽器即開即用</li>
          <li>免註冊：訪客可直接完成一次基本操作</li>
          <li>隱私安全：檔案處理完成後 2 小時內自動刪除（後端版）</li>
        </ul>
      </section>

      <section className="page-card privacy-fixed">
        <h2>檔案安全與隱私承諾</h2>
        <p className="muted">我們承諾：檔案會在處理後自動刪除，且不會轉售用戶資料。MVP 目前以前端流程為主，完整刪除排程需後端部署後啟用。</p>
      </section>
    </>
  );
}
