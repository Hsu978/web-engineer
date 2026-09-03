'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from './app-context';
import { DEV_LINKS, NAV_LINKS } from '@/lib/site';
import type { PlanKey } from '@/lib/plan';

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { plan, setPlan, theme, toggleTheme, planLabel, adsEnabled } = useApp();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo"><span className="badge">PDF</span>AmberPDF</div>
        <div className="nav-title">PDF 工具</div>
        <nav className="nav-list">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nav-title">開發中</div>
        <div className="nav-list">
          {DEV_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link coming-soon">
              {item.label}
            </Link>
          ))}
        </div>

        {adsEnabled && (
          <div className="sidebar-ad" data-ad>
            <div><strong>側欄廣告（免費版）</strong></div>
            <div className="small">你正使用免費方案，Pro 可移除全站廣告。</div>
          </div>
        )}
      </aside>

      <main className="main">
        <div className="topbar">
          <span className="control-btn">{planLabel}</span>
          <select
            className="control-btn"
            value={plan}
            onChange={(e) => setPlan(e.target.value as PlanKey)}
            aria-label="會員方案切換"
          >
            <option value="guest">訪客（免費）</option>
            <option value="member">註冊會員（免費）</option>
            <option value="pro">付費會員（Pro）</option>
          </select>
          <button className="control-btn" onClick={toggleTheme} type="button">
            {theme === 'dark' ? '切換淺色' : '切換深色'}
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
