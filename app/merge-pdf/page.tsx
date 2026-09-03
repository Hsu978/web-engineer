import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { MergeTool } from '@/components/tools/merge-tool';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: '合併 PDF',
    description: '線上合併 PDF：拖曳上傳、縮圖排序、單一檔案下載。',
    path: '/merge-pdf'
  });
}

export default function MergePdfPage() {
  return (
    <>
      <section className="page-card panel">
        <h1>合併 PDF</h1>
        <p className="muted">免費版每次最多 5 檔、總 20MB。Pro 可提升到 500MB。</p>
        <MergeTool />
      </section>

      <section className="page-card privacy-fixed">
        <h2>隱私聲明</h2>
        <p className="muted">所有上傳檔案於處理完成後 2 小時內自動從伺服器刪除，且不會轉售用戶資料。</p>
      </section>
    </>
  );
}
