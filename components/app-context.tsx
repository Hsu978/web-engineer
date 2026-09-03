'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PLAN_CONFIG, type PlanKey, getTodayKey } from '@/lib/plan';

type AppContextValue = {
  plan: PlanKey;
  setPlan: (plan: PlanKey) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  adsEnabled: boolean;
  planLabel: string;
  getDailyCounter: (name: string) => number;
  incrementDailyCounter: (name: string) => number;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlanState] = useState<PlanKey>('guest');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedPlan = localStorage.getItem('pdf_tool_plan') as PlanKey | null;
    if (savedPlan && PLAN_CONFIG[savedPlan]) setPlanState(savedPlan);

    const savedTheme = localStorage.getItem('pdf_tool_light_mode') === '1' ? 'light' : 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const setPlan = (next: PlanKey) => {
    setPlanState(next);
    localStorage.setItem('pdf_tool_plan', next);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('pdf_tool_light_mode', next === 'light' ? '1' : '0');
    document.documentElement.setAttribute('data-theme', next);
  };

  const getDailyCounter = (name: string) => {
    const raw = localStorage.getItem(`counter_${name}`);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { date: string; count: number };
    if (parsed.date !== getTodayKey()) return 0;
    return parsed.count;
  };

  const incrementDailyCounter = (name: string) => {
    const count = getDailyCounter(name) + 1;
    localStorage.setItem(`counter_${name}`, JSON.stringify({ date: getTodayKey(), count }));
    return count;
  };

  const value = useMemo<AppContextValue>(() => ({
    plan,
    setPlan,
    theme,
    toggleTheme,
    adsEnabled: PLAN_CONFIG[plan].ads,
    planLabel: PLAN_CONFIG[plan].label,
    getDailyCounter,
    incrementDailyCounter
  }), [plan, theme]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
