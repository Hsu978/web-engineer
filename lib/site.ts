export const SITE_NAME = 'AmberPDF';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://webengineer1989.com';

export const NAV_LINKS = [
  { href: '/', label: '首頁', key: 'home' },
  { href: '/merge-pdf', label: '合併 PDF', key: 'merge' },
  { href: '/compress-pdf', label: '壓縮 PDF', key: 'compress' },
  { href: '/pdf-to-word', label: 'PDF 轉 Word', key: 'word' }
] as const;

export const DEV_LINKS = [
  { href: '/compress-image', label: '/compress-image' },
  { href: '/heic-to-jpg', label: '/heic-to-jpg' }
] as const;

export const ROUTES = ['/', '/merge-pdf', '/compress-pdf', '/pdf-to-word', '/compress-image', '/heic-to-jpg'] as const;
