import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/components/app-context';
import { SiteShell } from '@/components/site-shell';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}｜快速免費 PDF 工具`,
    template: `%s｜${SITE_NAME}`
  },
  description: '快速、免費、免註冊即可使用的 PDF 線上工具。',
  applicationName: SITE_NAME
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className={inter.className}>
        <AppProvider>
          <SiteShell>{children}</SiteShell>
        </AppProvider>
      </body>
    </html>
  );
}
