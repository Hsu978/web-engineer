'use client';

import { useMemo, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { formatBytes, PLAN_CONFIG } from '@/lib/plan';
import { useApp } from '@/components/app-context';

type MergeItem = {
  id: string;
  file: File;
  thumb: string;
};

export function MergeTool() {
  const { plan, adsEnabled } = useApp();
  const [items, setItems] = useState<MergeItem[]>([]);
  const [message, setMessage] = useState('尚未加入檔案');
  const [upgradeTip, setUpgradeTip] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('準備中...');
  const [resultUrl, setResultUrl] = useState('');
  const [isMerging, setIsMerging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const totalBytes = useMemo(() => items.reduce((sum, x) => sum + x.file.size, 0), [items]);

  const validateLimit = (next: MergeItem[]) => {
    const cfg = PLAN_CONFIG[plan];

    if (next.length > cfg.mergeMaxFiles) {
      setUpgradeTip(`目前方案最多 ${cfg.mergeMaxFiles} 檔，升級 Pro 可解鎖大量合併。`);
      setMessage('已超過檔案數量限制。');
      return false;
    }
    const bytes = next.reduce((sum, x) => sum + x.file.size, 0);
    if (bytes > cfg.mergeMaxTotalBytes) {
      setUpgradeTip(`總容量超過 ${formatBytes(cfg.mergeMaxTotalBytes)}，升級 Pro 可到 500MB。`);
      setMessage('已超過總檔案大小限制。');
      return false;
    }
    if (Number.isFinite(cfg.mergeMaxFiles) && next.length >= Math.max(1, Math.floor(cfg.mergeMaxFiles * 0.8))) {
      setUpgradeTip('你即將達到免費額度上限，升級 Pro 可解除限制。');
    } else {
      setUpgradeTip('');
    }
    return true;
  };

  const createThumb = async (file: File): Promise<string> => {
    try {
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      (pdfjs as any).GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/legacy/build/pdf.worker.min.mjs';


      const pdf = await (pdfjs as any).getDocument({ data: await file.arrayBuffer() }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.25 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      await page.render({ canvasContext: ctx, viewport }).promise;
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch {
      return '';
    }
  };

  const processFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const onlyPdf = Array.from(files).filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    const mapped: MergeItem[] = [];
    for (const file of onlyPdf) {
      mapped.push({ id: crypto.randomUUID(), file, thumb: await createThumb(file) });
    }

    const next = [...items, ...mapped];
    if (!validateLimit(next)) return;

    setItems(next);
    setMessage(next.length ? '準備完成，可開始合併。' : '尚未加入檔案');
    setResultUrl('');
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    processFiles(e.dataTransfer.files);
  };

  const runMerge = async () => {
    if (!items.length) return;
    setIsMerging(true);
    setProgress(5);
    setProgressText('初始化合併...');
    setResultUrl('');

    try {
      const output = await PDFDocument.create();
      for (let i = 0; i < items.length; i += 1) {
        const src = await PDFDocument.load(await items[i].file.arrayBuffer());
        const pages = await output.copyPages(src, src.getPageIndices());
        pages.forEach((p) => output.addPage(p));
        setProgress(Math.round(((i + 1) / items.length) * 85));
        setProgressText(`正在處理 ${i + 1}/${items.length}`);
      }
      const bytes = await output.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      setResultUrl(URL.createObjectURL(blob));
      setProgress(100);
      setProgressText('完成');
      setMessage(`合併成功：${items.length} 檔 → ${formatBytes(blob.size)}`);
    } catch {
      setMessage('合併失敗：可能包含損毀或受保護 PDF。');
    } finally {
      setIsMerging(false);
    }
  };

  const moveItem = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
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
          <p>拖曳 PDF 到這裡，或點擊上傳（可多選）</p>
          <label className="btn" htmlFor="merge-input">選擇 PDF</label>
          <input id="merge-input" type="file" accept="application/pdf" multiple hidden onChange={(e) => processFiles(e.target.files)} />
        </div>
      </div>

      {upgradeTip && <div className="upgrade-tip show">{upgradeTip}</div>}

      <div className="panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <strong>檔案清單（可拖曳排序）</strong>
          <span className="small muted">{items.length} 檔案｜{formatBytes(totalBytes)}</span>
        </div>
        <ul className="file-list">
          {items.map((item, idx) => (
            <li
              key={item.id}
              className="file-item"
              draggable
              onDragStart={() => setDragIndex(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragIndex !== null) moveItem(dragIndex, idx); setDragIndex(null); }}
            >
              <img className="thumb" src={item.thumb || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='} alt={`${item.file.name} 縮圖`} />
              <div>
                <div>{idx + 1}. {item.file.name}</div>
                <div className="small muted">{formatBytes(item.file.size)}</div>
              </div>
              <button className="btn" type="button" onClick={() => setItems(items.filter((x) => x.id !== item.id))}>移除</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="row">
        <button className="btn primary" type="button" disabled={!items.length || isMerging} onClick={runMerge}>開始合併</button>
        <span className="small muted">{message}</span>
      </div>

      <div className={`progress-wrap ${isMerging || progress > 0 ? 'show' : ''}`}>
        <p className="small muted">{progressText}</p>
        <div className="progress-bar"><div className="progress-value" style={{ width: `${progress}%` }} /></div>
        {adsEnabled && <div className="ad-banner">等待中廣告位（橫幅）</div>}
      </div>

      <div className={`result-box panel ${resultUrl ? 'show' : ''}`}>
        <h2>合併完成</h2>
        <p className="muted">已產生單一 PDF，可立即下載。</p>
        <a className="btn primary" href={resultUrl} download="merged.pdf">下載合併 PDF</a>
        {adsEnabled && <div className="ad-banner">下載完成頁廣告位</div>}
      </div>
    </div>
  );
}
