export type PlanKey = 'guest' | 'member' | 'pro';

export type PlanConfig = {
  label: string;
  mergeMaxFiles: number;
  mergeMaxTotalBytes: number;
  compressMaxBytes: number;
  allowHighCompression: boolean;
  pdfToWordDailyLimit: number;
  pdfToWordMaxPages: number;
  ads: boolean;
};

export const PLAN_CONFIG: Record<PlanKey, PlanConfig> = {
  guest: {
    label: '訪客（免費）',
    mergeMaxFiles: 5,
    mergeMaxTotalBytes: 20 * 1024 * 1024,
    compressMaxBytes: 20 * 1024 * 1024,
    allowHighCompression: false,
    pdfToWordDailyLimit: 3,
    pdfToWordMaxPages: 10,
    ads: true
  },
  member: {
    label: '註冊會員（免費）',
    mergeMaxFiles: 10,
    mergeMaxTotalBytes: 50 * 1024 * 1024,
    compressMaxBytes: 50 * 1024 * 1024,
    allowHighCompression: false,
    pdfToWordDailyLimit: 10,
    pdfToWordMaxPages: 30,
    ads: true
  },
  pro: {
    label: '付費會員（Pro）',
    mergeMaxFiles: Number.POSITIVE_INFINITY,
    mergeMaxTotalBytes: 500 * 1024 * 1024,
    compressMaxBytes: 200 * 1024 * 1024,
    allowHighCompression: true,
    pdfToWordDailyLimit: Number.POSITIVE_INFINITY,
    pdfToWordMaxPages: Number.POSITIVE_INFINITY,
    ads: false
  }
};

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return '∞';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** i)).toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

export function getTodayKey() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
