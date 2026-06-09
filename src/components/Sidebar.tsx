'use client';

import { cn } from '@/lib/utils';

type Tab = 'overview' | 'deals' | 'forecast';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '◫' },
  { id: 'deals', label: 'Deal History', icon: '☰' },
  { id: 'forecast', label: 'Forecast', icon: '↗' },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div
      className="fixed left-0 top-0 bottom-0 w-[248px] flex flex-col z-50"
      style={{ background: '#f5f5f5' }}
    >
      {/* Logo */}
      <div className="px-[14px] pt-[22px] pb-3">
        <div className="flex items-center gap-[10px] px-[10px]">
          <div className="w-[30px] h-[30px] rounded-[9px] bg-[#14130f] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-serif italic text-[17px] pb-[2px]">T</span>
          </div>
          <span className="font-serif text-[22px] font-normal text-[#14130f]" style={{ letterSpacing: '-0.02em' }}>
            THG Automotive
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-[14px] pt-3 flex flex-col gap-[2px]">
        <div className="text-[10px] tracking-[0.18em] uppercase text-[#a39c8f] font-medium px-[14px] pb-2">
          Investor Dashboard
        </div>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'flex items-center gap-3 w-full px-[14px] py-[9px] text-sm font-normal border-none cursor-pointer transition-all text-left rounded-[10px]',
              activeTab === item.id
                ? 'bg-white text-[#14130f] shadow-card'
                : 'bg-transparent text-[#3a3731] hover:bg-[#ebe7de]'
            )}
            style={{ fontFamily: "'Inter Tight', sans-serif" }}
          >
            <span className={cn(
              'w-[18px] h-[18px] flex items-center justify-center text-sm flex-shrink-0',
              activeTab === item.id ? 'text-[#1f3eb8]' : 'text-[#7a7368]'
            )}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-[14px] pb-[14px]">
        <div className="text-[11px] text-[#a39c8f] px-[14px]">
          Live data from Supabase
        </div>
      </div>
    </div>
  );
}
