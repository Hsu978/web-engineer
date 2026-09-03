import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'HEIC 轉 JPG（開發中）',
    description: 'AmberPDF HEIC 轉 JPG 工具開發中，將提供快速相容轉檔。',
    path: '/heic-to-jpg'
  });
}

export default function HeicToJpgPage() {
  return (
    <section className="page-card panel">
      <h1>HEIC 轉 JPG（開發中）</h1>
      <p className="muted">此路由已預留，後續將支援 iPhone HEIC 相片快速轉 JPG。</p>
    </section>
  );
}
