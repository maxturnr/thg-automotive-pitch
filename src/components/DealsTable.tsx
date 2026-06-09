'use client';

import { useState, useMemo } from 'react';
import { DealSummary } from '@/lib/data';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

type SortKey = 'vehicle' | 'purchasePrice' | 'salePrice' | 'prepCosts' | 'netProfit' | 'roi' | 'holdDays' | 'purchase_date';
type FilterType = 'all' | 'sold' | 'in_stock' | 'owned' | 'sor';

interface DealsTableProps {
  deals: DealSummary[];
}

export default function DealsTable({ deals }: DealsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('purchase_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    switch (filter) {
      case 'sold': return deals.filter(d => d.car.status === 'Sold');
      case 'in_stock': return deals.filter(d => d.car.status !== 'Sold');
      case 'owned': return deals.filter(d => d.car.type === 'owned' && !d.car.is_sale_or_return);
      case 'sor': return deals.filter(d => d.car.type === 'sor' || d.car.is_sale_or_return);
      default: return deals;
    }
  }, [deals, filter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: any, bv: any;
      switch (sortKey) {
        case 'vehicle': av = `${a.car.make} ${a.car.model}`; bv = `${b.car.make} ${b.car.model}`; break;
        case 'purchasePrice': av = a.purchasePrice; bv = b.purchasePrice; break;
        case 'salePrice': av = a.salePrice; bv = b.salePrice; break;
        case 'prepCosts': av = a.prepCosts; bv = b.prepCosts; break;
        case 'netProfit': av = a.netProfit; bv = b.netProfit; break;
        case 'roi': av = a.roi ?? -999; bv = b.roi ?? -999; break;
        case 'holdDays': av = a.holdDays ?? 999; bv = b.holdDays ?? 999; break;
        case 'purchase_date': av = a.car.purchase_date || ''; bv = b.car.purchase_date || ''; break;
      }
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  // Summary
  const totalInvested = sorted.filter(d => d.car.type === 'owned').reduce((s, d) => s + d.purchasePrice, 0);
  const totalProfit = sorted.filter(d => d.car.status === 'Sold').reduce((s, d) => s + d.netProfit, 0);

  const SortTh = ({ label, sk, align = 'left' }: { label: string; sk: SortKey; align?: string }) => (
    <th
      onClick={() => handleSort(sk)}
      className={cn(
        'px-7 py-3 text-[12px] font-normal cursor-pointer select-none hover:text-[#14130f] transition-colors whitespace-nowrap',
        align === 'right' ? 'text-right' : 'text-left'
      )}
      style={{ color: sortKey === sk ? '#14130f' : '#8d867b' }}
    >
      {label}
      {sortKey === sk && (sortDir === 'asc' ? ' ↑' : ' ↓')}
    </th>
  );

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'sold', label: 'Sold' },
    { id: 'in_stock', label: 'In Stock' },
    { id: 'owned', label: 'Owned' },
    { id: 'sor', label: 'SOR' },
  ];

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[30px] font-normal text-[#14130f]" style={{ letterSpacing: '-0.04em', lineHeight: 1 }}>
            Deal History
          </h1>
          <p className="text-xs text-[#7a7368] mt-2 uppercase tracking-wide">
            Every vehicle with full financial breakdown
          </p>
        </div>
      </div>

      {/* Table surface */}
      <div className="bg-white border rounded-[8px] shadow-card overflow-hidden" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
        {/* Summary bar */}
        <div className="flex items-center gap-0 px-6 py-3 flex-wrap border-b" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
          <SummaryItem label="Showing" value={`${sorted.length} vehicles`} />
          <SummaryDot />
          <SummaryItem label="Capital" value={formatCurrency(totalInvested)} />
          <SummaryDot />
          <SummaryItem label="Total Profit" value={formatCurrency(totalProfit)} valueClass="text-[#23a56b]" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-6 py-3 border-b" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'h-[25px] px-[10px] rounded-[6px] text-[13px] font-normal border transition-all',
                filter === f.id
                  ? 'bg-[#14130f] text-white border-[#14130f]'
                  : 'bg-[#fcfcfc] text-[#5f5a54] border-[#e7e0e2] hover:border-[#c8c2b8]'
              )}
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: '1000px' }}>
            <thead className="border-b" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
              <tr className="bg-white">
                <SortTh label="Vehicle" sk="vehicle" />
                <th className="px-7 py-3 text-[12px] font-normal text-left whitespace-nowrap" style={{ color: '#8d867b' }}>Type</th>
                <th className="px-7 py-3 text-[12px] font-normal text-left whitespace-nowrap" style={{ color: '#8d867b' }}>Status</th>
                <SortTh label="Bought" sk="purchase_date" />
                <SortTh label="Buy Price" sk="purchasePrice" align="right" />
                <SortTh label="Sale Price" sk="salePrice" align="right" />
                <SortTh label="Prep Costs" sk="prepCosts" align="right" />
                <SortTh label="Net Profit" sk="netProfit" align="right" />
                <SortTh label="ROI" sk="roi" align="right" />
                <SortTh label="Days" sk="holdDays" align="right" />
              </tr>
            </thead>
            <tbody>
              {sorted.map(deal => (
                <tr
                  key={deal.car.id}
                  className="border-b hover:bg-[#fbfaf8] transition-colors"
                  style={{ borderColor: 'rgba(20,19,15,0.06)' }}
                >
                  <td className="px-7 py-3">
                    <div className="text-[13px] font-medium text-[#14130f]">{deal.car.make} {deal.car.model}</div>
                    <div className="text-[11px] text-[#958f82]">{deal.car.reg}</div>
                  </td>
                  <td className="px-7 py-3">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-[5px] text-[11px] font-medium',
                      deal.car.type === 'owned' && !deal.car.is_sale_or_return
                        ? 'text-[#35a7f6]'
                        : 'text-[#8e8df7]'
                    )} style={{
                      background: deal.car.type === 'owned' && !deal.car.is_sale_or_return
                        ? 'rgba(53,167,246,0.12)' : 'rgba(142,141,247,0.12)'
                    }}>
                      {deal.car.type === 'owned' && !deal.car.is_sale_or_return ? 'Owned' : 'SOR'}
                    </span>
                  </td>
                  <td className="px-7 py-3">
                    <span className={cn(
                      'text-[12px]',
                      deal.car.status === 'Sold' ? 'text-[#23a56b]' : 'text-[#958f82]'
                    )}>
                      {deal.car.status}
                    </span>
                  </td>
                  <td className="px-7 py-3 text-[13px] text-[#14130f]">
                    {formatDate(deal.car.purchase_date)}
                  </td>
                  <td className="px-7 py-3 text-[13px] text-[#14130f] text-right">
                    {deal.purchasePrice > 0 ? formatCurrency(deal.purchasePrice) : '—'}
                  </td>
                  <td className="px-7 py-3 text-[13px] text-[#14130f] text-right font-medium">
                    {deal.salePrice > 0 ? formatCurrency(deal.salePrice) : '—'}
                  </td>
                  <td className="px-7 py-3 text-[13px] text-[#958f82] text-right">
                    {deal.prepCosts > 0 ? formatCurrency(deal.prepCosts) : '—'}
                  </td>
                  <td className="px-7 py-3 text-right">
                    {deal.car.status === 'Sold' ? (
                      <span className={cn(
                        'text-[13px] font-medium',
                        deal.netProfit > 0 ? 'text-[#23a56b]' : deal.netProfit < 0 ? 'text-[#d96b61]' : 'text-[#958f82]'
                      )}>
                        {deal.netProfit > 0 ? '+' : ''}{formatCurrency(deal.netProfit)}
                      </span>
                    ) : (
                      <span className="text-[13px] text-[#958f82]">—</span>
                    )}
                  </td>
                  <td className="px-7 py-3 text-[13px] text-right">
                    {deal.car.status === 'Sold' && deal.roi !== null ? (
                      <span className={deal.roi > 0 ? 'text-[#35a7f6] font-medium' : 'text-[#958f82]'}>
                        {deal.roi}%
                      </span>
                    ) : deal.car.type === 'sor' && deal.car.status === 'Sold' ? (
                      <span className="text-[#8e8df7]">∞</span>
                    ) : (
                      <span className="text-[#958f82]">—</span>
                    )}
                  </td>
                  <td className="px-7 py-3 text-[13px] text-[#958f82] text-right">
                    {deal.holdDays !== null && deal.holdDays > 0 ? deal.holdDays : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[14px] text-[#958f82]">{label}</span>
      <span className={`text-[14px] font-medium text-[#14130f] ${valueClass}`} style={{ letterSpacing: '-0.01em' }}>
        {value}
      </span>
    </div>
  );
}

function SummaryDot() {
  return <span className="text-[#958f82] mx-1.5 font-medium">·</span>;
}
