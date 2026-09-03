import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { CompressTool } from '@/components/tools/compress-tool';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: '壓縮 PDF',
    description: '線上壓縮 PDF，提供低壓縮、建議壓縮與高壓縮（Pro）。',
    path: '/compress-pdf'
  });
}

export default function CompressPdfPage() {
  return (
    <>
      <section className="page-card panel">
        <h1>壓縮 PDF</h1>
        <p className="muted">低壓縮／建議壓縮／高壓縮（Pro）。免費版單檔上限 20MB。</p>
        <CompressTool />
      </section>

      <section className="page-card privacy-fixed">
        <h2>隱私聲明</h2>
        <p className="muted">所有上傳檔案於處理完成後 2 小時內自動從伺服器刪除，且不會轉售用戶資料。</p>
      </section>
    </>
  );
}
