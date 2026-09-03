'use client';

import { useEffect, useState } from 'react';
import { formatBytes, PLAN_CONFIG } from '@/lib/plan';
import { useApp } from '@/components/app-context';

type PdfMeta = { pages: number | null; hasTextLayer: boolean | null; broken?: boolean };

export function PdfToWordTool() {
  const { plan, adsEnabled, getDailyCounter, incrementDailyCounter } = useApp();
  const [endpoint, setEndpoint] = useState('');
  const [responseMode, setResponseMode] = useState<'json_url' | 'blob_docx'>('json_url');
  const [downloadKey, setDownloadKey] = useState('download_url');
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<PdfMeta>({ pages: null, hasTextLayer: null });
  const [message, setMessage] = useState('請先填入 API Endpoint 並上傳 PDF。');
  const [upgradeTip, setUpgradeTip] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('準備中...');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setEndpoint(localStorage.getItem('word_api_endpoint') || '');
    setResponseMode((localStorage.getItem('word_api_mode') as 'json_url' | 'blob_docx') || 'json_url');
    setDownloadKey(localStorage.getItem('word_api_download_key') || 'download_url');
  }, []);

  const persistApi = () => {
    localStorage.setItem('word_api_endpoint', endpoint.trim());
    localStorage.setItem('word_api_mode', responseMode);
    localStorage.setItem('word_api_download_key', downloadKey.trim() || 'download_url');
  };

  const detectPdfMeta = async (nextFile: File): Promise<PdfMeta> => {
    try {
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const worker = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
      (pdfjs as any).GlobalWorkerOptions.workerSrc = (worker as any).default;

      const pdf = await (pdfjs as any).getDocument({ data: await nextFile.arrayBuffer() }).promise;
      const page = await pdf.getPage(1);
      const text = await page.getTextContent();
      return { pages: pdf.numPages, hasTextLayer: text.items?.length > 0 };
    } catch {
      return { pages: null, hasTextLayer: null, broken: true };
    }
  };

  const validate = () => {
    const cfg = PLAN_CONFIG[plan];
    setUpgradeTip('');

    if (!endpoint.trim()) {
      setMessage('請先填入第三方 API Endpoint。');
      return false;
    }
    if (!file) {
      setMessage('等待上傳 PDF。');
      return false;
    }
    if (meta.broken) {
      setMessage('PDF 讀取失敗，可能檔案損毀或受保護。');
      return false;
    }
    if (Number.isFinite(cfg.pdfToWordMaxPages) && Number.isFinite(meta.pages) && (meta.pages as number) > cfg.pdfToWordMaxPages) {
      setMessage(`此檔 ${meta.pages} 頁，超過目前方案 ${cfg.pdfToWordMaxPages} 頁上限。`);
      setUpgradeTip('升級 Pro 可支援 100+ 頁大型文件。');
      return false;
    }
    const count = getDailyCounter('pdf_to_word');
    if (Number.isFinite(cfg.pdfToWordDailyLimit) && count >= cfg.pdfToWordDailyLimit) {
      setMessage('今日免費轉換次數已用完。');
      setUpgradeTip('升級 Pro 可解鎖無限轉換。');
      return false;
    }

    if (cfg.ads && Number.isFinite(cfg.pdfToWordDailyLimit) && count >= Math.max(1, cfg.pdfToWordDailyLimit - 1)) {
      setUpgradeTip('你即將達到免費額度，升級 Pro 可無限轉換。');
    }

    setMessage('檢查通過，可開始轉換。');
    return true;
  };

  const setSelectedFile = async (nextFile: File | null) => {
    if (!nextFile) return;
    if (!(nextFile.type === 'application/pdf' || nextFile.name.toLowerCase().endsWith('.pdf'))) {
      setMessage('僅支援 PDF。');
      return;
    }
    setFile(nextFile);
    setResultUrl('');
    setMeta({ pages: null, hasTextLayer: null });
    setMessage('正在偵測文字層與頁數...');
    const data = await detectPdfMeta(nextFile);
    setMeta(data);
    if (data.broken) {
      setMessage('PDF 無法解析。');
    } else if (data.hasTextLayer) {
      setMessage(`共 ${data.pages} 頁，偵測到文字層，可直接轉換。`);
    } else {
      setMessage(`共 ${data.pages} 頁，偵測到掃描檔，將自動進行文字辨識。`);
    }
    setTimeout(validate, 0);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    setSelectedFile(e.dataTransfer.files?.[0] || null);
  };

  const callApi = async () => {
    const fd = new FormData();
    fd.append('file', file as File);
    fd.append('source', 'pdf');
    fd.append('target', 'docx');
    fd.append('ocr', String(!meta.hasTextLayer));
    fd.append('page_count', String(meta.pages ?? ''));

    const resp = await fetch(endpoint.trim(), { method: 'POST', body: fd });
    if (!resp.ok) throw new Error(`API 回應失敗：${resp.status}`);

    if (responseMode === 'blob_docx') {
      const blob = await resp.blob();
      if (!blob.size) throw new Error('API 未回傳有效 docx。');
      return blob;
    }

    const json = await resp.json();
    const url = json?.[downloadKey.trim() || 'download_url'];
    if (!url || typeof url !== 'string') throw new Error('JSON 找不到下載連結欄位。');

    const fileResp = await fetch(url);
    if (!fileResp.ok) throw new Error(`下載結果失敗：${fileResp.status}`);
    return await fileResp.blob();
  };

  const run = async () => {
    persistApi();
    if (!validate()) return;

    setIsRunning(true);
    setProgress(8);
    setProgressText('提交文件至第三方轉換引擎...');
    setResultUrl('');

    try {
      if (!meta.hasTextLayer) {
        setMessage('偵測到掃描檔，將自動進行文字辨識。');
      }
      setProgress(40);
      setProgressText('文件分析與版面還原中...');

      const blob = await callApi();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      incrementDailyCounter('pdf_to_word');

      setProgress(100);
      setProgressText('完成');
      setMessage('轉換完成，可下載 Word。');
    } catch (e) {
      const err = e as Error;
      setMessage(`轉換失敗：${err.message}（請確認 CORS 與 API 格式）。`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="stack">
      <div className="callout small">
        限制提醒：若第三方 API 需私密金鑰，不能放在前端，必須改由後端代理。
      </div>

      <div className="panel stack">
        <label htmlFor="word-api-endpoint"><strong>API Endpoint</strong></label>
        <input id="word-api-endpoint" className="control-input" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://api.example.com/pdf-to-word" />

        <div className="row">
          <div className="stack" style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="word-mode"><strong>回應模式</strong></label>
            <select id="word-mode" className="control-input" value={responseMode} onChange={(e) => setResponseMode(e.target.value as 'json_url' | 'blob_docx')}>
              <option value="json_url">JSON（含下載連結）</option>
              <option value="blob_docx">直接回傳 .docx（二進位）</option>
            </select>
          </div>
          <div className="stack" style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="word-key"><strong>JSON 下載欄位</strong></label>
            <input id="word-key" className="control-input" value={downloadKey} onChange={(e) => setDownloadKey(e.target.value)} />
          </div>
        </div>
      </div>

      <div
        className="upload-zone"
        onDragEnter={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('dragover'); }}
        onDrop={onDrop}
      >
        <div>
          <p>拖曳 PDF 到這裡，或點擊上傳</p>
          <label className="btn" htmlFor="word-input">選擇 PDF</label>
          <input id="word-input" type="file" hidden accept="application/pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
        </div>
      </div>

      <div className="row">
        <div className="feature-card" style={{ flex: 1 }}>
          <div className="small muted">檔案資訊</div>
          <div>{file ? `${file.name}｜${formatBytes(file.size)}` : '尚未選擇檔案'}</div>
        </div>
        <div className="feature-card" style={{ flex: 1 }}>
          <div className="small muted">偵測結果</div>
          <div>
            {meta.broken ? '無法解析 PDF' : meta.pages ? `${meta.pages} 頁｜${meta.hasTextLayer ? '有文字層' : '掃描檔（OCR）'}` : '尚未偵測'}
          </div>
        </div>
      </div>

      {upgradeTip && <div className="upgrade-tip show">{upgradeTip}</div>}

      <div className="row">
        <button className="btn primary" type="button" onClick={run} disabled={isRunning}>開始轉換為 Word</button>
        <span className="small muted">{message}</span>
      </div>

      <div className={`progress-wrap ${isRunning || progress > 0 ? 'show' : ''}`}>
        <p className="small muted">{progressText}</p>
        <div className="progress-bar"><div className="progress-value" style={{ width: `${progress}%` }} /></div>
        {adsEnabled && <div className="ad-banner">等待中廣告位（橫幅）</div>}
      </div>

      <div className={`result-box panel ${resultUrl ? 'show' : ''}`}>
        <h2>轉換完成</h2>
        <p className="muted">若版面不符，建議改用更高保真 API 方案。</p>
        <a className="btn primary" href={resultUrl} download="converted.docx">下載 Word</a>
        {adsEnabled && <div className="ad-banner">下載完成頁廣告位</div>}
      </div>
    </div>
  );
}
