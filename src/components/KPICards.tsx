'use client';

import { getStats } from '@/lib/data';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { TrendingUp, Car, Clock, PoundSterling, BarChart3, Layers } from 'lucide-react';

export default function KPICards() {
  const stats = getStats();

  const cards = [
    {
      label: 'Total Profit',
      value: formatCurrency(stats.totalProfit),
      sub: `${stats.totalDeals} vehicles sold`,
      icon: PoundSterling,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Avg ROI per Car',
      value: formatPercent(stats.avgRoi),
      sub: 'On owned vehicles',
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Capital Deployed',
      value: formatCurrency(stats.totalCapitalDeployed),
      sub: `${stats.ownedDeals} owned, ${stats.sorDeals} SOR`,
      icon: BarChart3,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'Avg Hold Time',
      value: `${stats.avgHoldDays} days`,
      sub: 'Purchase to sale',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Avg Profit / Car',
      value: formatCurrency(stats.avgProfitPerCar),
      sub: 'Net after all costs',
      icon: Car,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
    {
      label: 'Current Stock',
      value: `${stats.stockCount} cars`,
      sub: `${formatCurrency(stats.stockCapital)} invested`,
      icon: Layers,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ];

  return (
    <div className="pt-8">
      {/* Hero statement */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight">
          Performance at a Glance
        </h2>
        <p className="mt-2 text-surface-500 text-[15px] max-w-2xl">
          Real trading data from THG Automotive. Every vehicle bought, prepped, and sold — with full cost transparency.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className={`bg-white rounded-xl border border-surface-200/60 p-5 shadow-card hover:shadow-card-hover transition-all duration-200 opacity-0 animate-fade-in-up stagger-${i + 1}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-[18px] h-[18px] ${card.color}`} />
              </div>
              <span className="text-[13px] font-medium text-surface-500">{card.label}</span>
            </div>
            <div className="text-2xl font-bold text-surface-900 tracking-tight">{card.value}</div>
            <div className="text-[12px] text-surface-400 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
