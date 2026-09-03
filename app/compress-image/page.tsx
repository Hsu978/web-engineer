import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: '壓縮圖片（開發中）',
    description: 'AmberPDF 圖片壓縮工具開發中，將支援批量與格式優化。',
    path: '/compress-image'
  });
}

export default function CompressImagePage() {
  return (
    <section className="page-card panel">
      <h1>壓縮圖片（開發中）</h1>
      <p className="muted">此路由已預留，後續將支援 JPG/PNG/WebP 壓縮與批量下載。</p>
    </section>
  );
}
