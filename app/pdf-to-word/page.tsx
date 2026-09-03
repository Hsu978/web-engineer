import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { PdfToWordTool } from '@/components/tools/pdf-to-word-tool';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'PDF 轉 Word',
    description: '第三方 API 串接 MVP，支援掃描檔 OCR 流程提示與下載結果。',
    path: '/pdf-to-word'
  });
}

export default function PdfToWordPage() {
  return (
    <>
      <section className="page-card panel">
        <h1>PDF 轉 Word</h1>
        <p className="muted">MVP 先串第三方 API，穩定後再評估自建高保真引擎。</p>
        <PdfToWordTool />
      </section>

      <section className="page-card privacy-fixed">
        <h2>隱私聲明</h2>
        <p className="muted">所有上傳檔案於處理完成後 2 小時內自動從伺服器刪除，且不會轉售用戶資料。</p>
      </section>
    </>
  );
}
