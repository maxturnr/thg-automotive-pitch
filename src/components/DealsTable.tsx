'use client';

import { useState } from 'react';
import { soldDeals, Deal } from '@/lib/data';
import { formatCurrency, formatDate, formatPercent, cn } from '@/lib/utils';
import { ArrowUpDown, ChevronDown, ChevronUp, Filter } from 'lucide-react';

type SortKey = 'make' | 'purchasePrice' | 'salePrice' | 'netProfit' | 'roi' | 'holdDays' | 'purchaseDate';
type FilterType = 'all' | 'owned' | 'sor';

export default function DealsTable() {
  const [sortKey, setSortKey] = useState<SortKey>('purchaseDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = filter === 'all' ? soldDeals : soldDeals.filter(d => d.type === filter);
  
  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey] ?? -Infinity;
    const bv = b[sortKey] ?? -Infinity;
    if (typeof av === 'string' && typeof bv === 'string') {
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortHeader = ({ label, sortKeyName, className = '' }: { label: string; sortKeyName: SortKey; className?: string }) => (
    <th
      className={cn('px-4 py-3 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider cursor-pointer hover:text-surface-600 select-none', className)}
      onClick={() => handleSort(sortKeyName)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === sortKeyName && (
          sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  // Summary row
  const totalInvested = sorted.filter(d => d.type === 'owned').reduce((s, d) => s + d.purchasePrice, 0);
  const totalSold = sorted.reduce((s, d) => s + d.salePrice, 0);
  const totalProfit = sorted.reduce((s, d) => s + d.netProfit, 0);

  return (
    <div className="pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Deal History</h2>
          <p className="text-surface-500 text-sm mt-1">Every vehicle bought and sold with full financial breakdown</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-400" />
          {(['all', 'owned', 'sor'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                filter === f
                  ? 'bg-surface-900 text-white'
                  : 'text-surface-500 hover:bg-surface-100'
              )}
            >
              {f === 'all' ? 'All' : f === 'owned' ? 'Owned' : 'Sale or Return'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-surface-100">
              <tr>
                <SortHeader label="Vehicle" sortKeyName="make" />
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Type</th>
                <SortHeader label="Bought" sortKeyName="purchaseDate" />
                <SortHeader label="Buy Price" sortKeyName="purchasePrice" className="text-right" />
                <SortHeader label="Sale Price" sortKeyName="salePrice" className="text-right" />
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Prep Costs</th>
                <SortHeader label="Net Profit" sortKeyName="netProfit" className="text-right" />
                <SortHeader label="ROI" sortKeyName="roi" className="text-right" />
                <SortHeader label="Days" sortKeyName="holdDays" className="text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {sorted.map((deal) => (
                <tr
                  key={deal.id}
                  className="hover:bg-surface-50/50 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === deal.id ? null : deal.id)}
                >
                  <td className="px-4 py-3.5">
                    <div>
                      <div className="text-sm font-semibold text-surface-900">{deal.make} {deal.model}</div>
                      <div className="text-[11px] text-surface-400 font-mono">{deal.reg}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium',
                      deal.type === 'owned'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-violet-50 text-violet-700'
                    )}>
                      {deal.type === 'owned' ? 'Owned' : 'SOR'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-surface-600">
                    {formatDate(deal.purchaseDate)}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-surface-600 text-right font-mono">
                    {deal.type === 'owned' ? formatCurrency(deal.purchasePrice) : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-surface-900 text-right font-mono font-medium">
                    {formatCurrency(deal.salePrice)}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-surface-500 text-right font-mono">
                    {deal.prepCosts > 0 ? formatCurrency(deal.prepCosts) : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={cn(
                      'text-sm font-semibold font-mono',
                      deal.netProfit > 0 ? 'text-emerald-600' : deal.netProfit < 0 ? 'text-red-500' : 'text-surface-400'
                    )}>
                      {deal.netProfit > 0 ? '+' : ''}{formatCurrency(deal.netProfit)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={cn(
                      'text-sm font-mono',
                      deal.roi !== null && deal.roi > 0 ? 'text-emerald-600 font-medium' : 'text-surface-400'
                    )}>
                      {deal.type === 'sor' ? '∞' : formatPercent(deal.roi)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-surface-500 text-right font-mono">
                    {deal.holdDays !== null ? deal.holdDays : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-surface-200 bg-surface-50/50">
              <tr>
                <td className="px-4 py-3 text-sm font-bold text-surface-900" colSpan={2}>
                  Total ({sorted.length} deals)
                </td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-sm font-bold text-surface-700 text-right font-mono">
                  {formatCurrency(totalInvested)}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-surface-900 text-right font-mono">
                  {formatCurrency(totalSold)}
                </td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-bold font-mono text-emerald-600">
                    +{formatCurrency(totalProfit)}
                  </span>
                </td>
                <td className="px-4 py-3" colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
