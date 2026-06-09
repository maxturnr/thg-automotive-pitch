'use client';

import { cn } from '@/lib/utils';

interface HeaderProps {
  activeTab: 'overview' | 'deals' | 'forecast';
  setActiveTab: (tab: 'overview' | 'deals' | 'forecast') => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const tabs = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'deals' as const, label: 'Deal History' },
    { key: 'forecast' as const, label: 'Forecast' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-900 flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-surface-900 leading-tight">THG Automotive</h1>
              <p className="text-[11px] text-surface-400 font-medium tracking-wide uppercase">Investor Dashboard</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  activeTab === tab.key
                    ? 'bg-surface-900 text-white shadow-sm'
                    : 'text-surface-500 hover:text-surface-700 hover:bg-surface-100'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
