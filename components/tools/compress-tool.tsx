'use client';

import { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { formatBytes, PLAN_CONFIG } from '@/lib/plan';
import { useApp } from '@/components/app-context';

const LEVELS = {
  low: { ratio: 0.85, scale: 1.9, quality: 0.9 },
  recommended: { ratio: 0.62, scale: 1.45, quality: 0.72 },
  high: { ratio: 0.38, scale: 1.2, quality: 0.55 }
} as const;

type LevelKey = keyof typeof LEVELS;

export function CompressTool() {
  const { plan, adsEnabled } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<LevelKey>('recommended');
  const [message, setMessage] = useState('尚未選擇檔案');
  const [upgradeTip, setUpgradeTip] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('準備中...');
  const [resultUrl, setResultUrl] = useState('');
  const [resultText, setResultText] = useState('已縮小 0%');
  const [isRunning, setIsRunning] = useState(false);

  const estimate = useMemo(() => {
    if (!file) return '-';
    return formatBytes(Math.round(file.size * LEVELS[level].ratio));
  }, [file, level]);

  const validate = () => {
    const cfg = PLAN_CONFIG[plan];
    setUpgradeTip('');

    if (!file) {
      setMessage('尚未選擇檔案');
      return false;
    }

    if (level === 'high' && !cfg.allowHighCompression) {
      setMessage('目前方案未解鎖高壓縮。');
      setUpgradeTip('升級 Pro 可解鎖高壓縮，壓出更小檔案。');
      return false;
    }

    if (file.size > cfg.compressMaxBytes) {
      setMessage('檔案大小超過目前方案上限。');
      setUpgradeTip(`目前上限 ${formatBytes(cfg.compressMaxBytes)}，升級可提高限制。`);
      return false;
    }

    if (file.size > cfg.compressMaxBytes * 0.85 && cfg.ads) {
      setUpgradeTip('你快碰到免費容量上限，升級 Pro 可到 200MB。');
    }

    setMessage('檔案已就緒，可開始壓縮。');
    return true;
  };

  const setSelectedFile = (next: File | null) => {
    if (!next) return;
    if (!(next.type === 'application/pdf' || next.name.toLowerCase().endsWith('.pdf'))) {
      setMessage('僅支援 PDF。');
      return;
    }
    setFile(next);
    setResultUrl('');
    setProgress(0);
    setMessage('檔案已載入。');
    setTimeout(validate, 0);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    setSelectedFile(e.dataTransfer.files?.[0] || null);
  };

  const runCompression = async () => {
    if (!validate() || !file) return;

    setIsRunning(true);
    setProgress(5);
    setProgressText('初始化壓縮流程...');
    setResultUrl('');

    try {
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      (pdfjs as any).GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/legacy/build/pdf.worker.min.mjs';


      const cfg = LEVELS[level];
      const sourcePdf = await (pdfjs as any).getDocument({ data: await file.arrayBuffer() }).promise;
      let output: jsPDF | null = null;

      for (let p = 1; p <= sourcePdf.numPages; p += 1) {
        const page = await sourcePdf.getPage(p);
        const viewport = page.getViewport({ scale: cfg.scale });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        const image = canvas.toDataURL('image/jpeg', cfg.quality);
        const w = (viewport.width * 72) / 96;
        const h = (viewport.height * 72) / 96;

        if (!output) {
          output = new jsPDF({ unit: 'pt', format: [w, h], compress: true });
        } else {
          output.addPage([w, h], w > h ? 'landscape' : 'portrait');
          output.setPage(p);
        }
        output.addImage(image, 'JPEG', 0, 0, w, h, undefined, 'FAST');

        setProgress(Math.round((p / sourcePdf.numPages) * 88));
        setProgressText(`壓縮頁面 ${p}/${sourcePdf.numPages}`);
      }

      setProgress(95);
      setProgressText('輸出壓縮檔案...');

      const blob = output!.output('blob');
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      const reduced = Math.max(0, Math.round((1 - blob.size / file.size) * 100));
      setResultText(`已縮小 ${reduced}%｜${formatBytes(file.size)} → ${formatBytes(blob.size)}`);
      setProgress(100);
      setProgressText('完成');
      setMessage('壓縮完成，可下載。');
    } catch {
      setMessage('壓縮失敗：檔案可能損毀、受密碼保護或過於複雜。');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="stack">
      <div
        className="upload-zone"
        onDragEnter={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('dragover'); }}
        onDrop={onDrop}
      >
        <div>
          <p>拖曳 PDF 到這裡，或點擊上傳單一檔案</p>
          <label className="btn" htmlFor="compress-input">選擇 PDF</label>
          <input id="compress-input" type="file" accept="application/pdf" hidden onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
        </div>
      </div>

      <div className="panel stack">
        <label htmlFor="level"><strong>壓縮等級</strong></label>
        <select id="level" className="control-input" value={level} onChange={(e) => { setLevel(e.target.value as LevelKey); setTimeout(validate, 0); }}>
          <option value="low">低壓縮（畫質優先）</option>
          <option value="recommended">建議壓縮（平衡）</option>
          <option value="high">高壓縮（檔案最小，Pro）</option>
        </select>

        <div className="row">
          <div className="feature-card" style={{ flex: 1 }}>
            <div className="small muted">壓縮前大小</div>
            <div>{file ? formatBytes(file.size) : '-'}</div>
          </div>
          <div className="feature-card" style={{ flex: 1 }}>
            <div className="small muted">預估壓縮後大小</div>
            <div>{estimate}</div>
          </div>
        </div>

        {upgradeTip && <div className="upgrade-tip show">{upgradeTip}</div>}

        <div className="row">
          <button className="btn primary" type="button" onClick={runCompression} disabled={!file || isRunning}>開始壓縮</button>
          <span className="small muted">{message}</span>
        </div>
      </div>

      <div className={`progress-wrap ${isRunning || progress > 0 ? 'show' : ''}`}>
        <p className="small muted">{progressText}</p>
        <div className="progress-bar"><div className="progress-value" style={{ width: `${progress}%` }} /></div>
        {adsEnabled && <div className="ad-banner">等待中廣告位（橫幅）</div>}
      </div>

      <div className={`result-box panel ${resultUrl ? 'show' : ''}`}>
        <h2>壓縮完成</h2>
        <p className="muted">{resultText}</p>
        <a className="btn primary" href={resultUrl} download="compressed.pdf">下載壓縮 PDF</a>
        {adsEnabled && <div className="ad-banner">下載完成頁廣告位</div>}
      </div>
    </div>
  );
}
