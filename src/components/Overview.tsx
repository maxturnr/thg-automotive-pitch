'use client';

import { DealSummary, Stats, projectReturns } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { useMemo } from 'react';

interface OverviewProps {
  deals: DealSummary[];
  stats: Stats;
  onSelectDeal?: (deal: DealSummary) => void;
}

export default function Overview({ deals, stats, onSelectDeal }: OverviewProps) {
  const soldDeals = deals.filter(d => d.car.status === 'Sold');
  const inStock = deals.filter(d => d.car.status === 'In Stock' || d.car.status === 'On Site');

  // Chart data: profit per sold vehicle
  const chartData = useMemo(() => {
    return soldDeals
      .filter(d => d.netProfit !== 0)
      .sort((a, b) => b.netProfit - a.netProfit)
      .map(d => ({
        name: `${d.car.make} ${d.car.model}`.length > 16
          ? `${d.car.make} ${d.car.model}`.slice(0, 14) + '…'
          : `${d.car.make} ${d.car.model}`,
        fullName: `${d.car.make} ${d.car.model}`,
        profit: d.netProfit,
        type: d.car.type,
        reg: d.car.reg,
      }));
  }, [soldDeals]);

  // Quick forecast: 12 months at £50k
  const forecast = useMemo(() => projectReturns(50000, 12, deals), [deals]);
  const forecast12 = forecast.length > 0 ? forecast[forecast.length - 1] : null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white rounded-[10px] border px-4 py-3 shadow-card" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
          <p className="text-sm font-medium text-[#14130f]">{data.fullName}</p>
          <p className="text-[11px] text-[#7a7368]">{data.reg}</p>
          <p className={`text-sm font-semibold mt-1 ${data.profit > 0 ? 'text-[#23a56b]' : 'text-[#d96b61]'}`}>
            {data.profit > 0 ? '+' : ''}{formatCurrency(data.profit)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-up">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-[30px] font-normal text-[#14130f]" style={{ letterSpacing: '-0.04em', lineHeight: 1 }}>
          Overview
        </h1>
        <p className="text-xs text-[#7a7368] mt-2 uppercase tracking-wide">
          Live performance data • {stats.totalDeals} vehicles tracked
        </p>
      </div>

      {/* KPI summary bar — FleetOS style */}
      <div className="bg-white border rounded-[8px] shadow-card overflow-hidden mb-5" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
        <div className="flex items-center gap-0 px-6 py-4 flex-wrap">
          <SummaryItem label="Total Profit" value={formatCurrency(stats.totalProfit)} valueClass="text-[#23a56b]" />
          <SummaryDot />
          <SummaryItem label="Avg ROI" value={`${stats.avgRoi}%`} valueClass="text-[#35a7f6]" />
          <SummaryDot />
          <SummaryItem label="Capital Deployed" value={formatCurrency(stats.totalCapitalDeployed)} />
          <SummaryDot />
          <SummaryItem label="Avg Hold" value={`${stats.avgHoldDays} days`} />
          <SummaryDot />
          <SummaryItem label="Profit/Car" value={formatCurrency(stats.avgProfitPerCar)} valueClass="text-[#23a56b]" />
          <SummaryDot />
          <SummaryItem label="In Stock" value={String(stats.inStockCount)} />
        </div>
      </div>

      {/* Grid: Profit chart + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Profit chart */}
        <div className="lg:col-span-2 bg-white border rounded-[8px] shadow-card p-6" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
          <h3 className="text-[15px] font-normal text-[#878787] mb-4">Profit by Vehicle</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,19,15,0.06)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#8d867b', fontFamily: 'Inter Tight' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(20,19,15,0.08)' }}
                  angle={-35}
                  textAnchor="end"
                  height={70}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#8d867b', fontFamily: 'Inter Tight' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `£${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(20,19,15,0.02)' }} />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.profit > 0
                        ? (entry.type === 'owned' ? '#23a56b' : '#8e8df7')
                        : '#d96b61'
                      }
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(20,19,15,0.06)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#23a56b' }} />
              <span className="text-[11px] text-[#7a7368]">Owned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#8e8df7' }} />
              <span className="text-[11px] text-[#7a7368]">Sale or Return</span>
            </div>
          </div>
        </div>

        {/* Stock Pipeline */}
        <div className="bg-white border rounded-[8px] shadow-card p-6 flex flex-col" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-normal text-[#878787]">Current Pipeline</h3>
            <span className="text-xs font-medium text-[#14130f] bg-[#f5f5f5] px-2.5 py-1 rounded-md">
              {inStock.length} cars
            </span>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto max-h-[260px]">
            {inStock.map(d => (
              <div key={d.car.id} onClick={() => onSelectDeal?.(d)} className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-[#fbfaf8] transition-colors cursor-pointer">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-[#14130f] truncate">
                    {d.car.make} {d.car.model}
                  </div>
                  <div className="text-[11px] text-[#958f82]">{d.car.reg}</div>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <div className="text-[13px] font-medium text-[#14130f]">
                    {formatCurrency(d.purchasePrice)}
                  </div>
                  {d.car.advertised && (
                    <div className="text-[11px] text-[#23a56b]">
                      adv. {formatCurrency(d.car.advertised)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t space-y-1" style={{ borderColor: 'rgba(20,19,15,0.06)' }}>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#958f82]">Capital tied up</span>
              <span className="font-medium text-[#14130f]">{formatCurrency(stats.stockCapital)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#958f82]">Potential revenue</span>
              <span className="font-medium text-[#23a56b]">{formatCurrency(stats.stockPotentialRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Forecast */}
      {forecast12 && (
        <div className="bg-white border rounded-[8px] shadow-card p-6" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
          <h3 className="text-[15px] font-normal text-[#878787] mb-4">12-Month Forecast @ £50k Capital</h3>
          <div className="flex items-center gap-0 flex-wrap">
            <SummaryItem label="Projected Profit" value={formatCurrency(forecast12.cumulativeProfit)} valueClass="text-[#23a56b]" />
            <SummaryDot />
            <SummaryItem label="Annual ROI" value={`${forecast12.roi}%`} valueClass="text-[#35a7f6]" />
            <SummaryDot />
            <SummaryItem label="Cars Flipped" value={String(forecast12.carsFlipped)} />
            <SummaryDot />
            <SummaryItem label="Monthly Profit" value={formatCurrency(forecast12.monthlyProfit)} valueClass="text-[#23a56b]" />
          </div>
          <p className="text-[11px] text-[#a39c8f] mt-3">
            Based on {deals.filter(d => d.car.type === 'owned' && d.car.status === 'Sold' && d.netProfit > 0).length} real owned deals. Past performance does not guarantee future results.
          </p>
        </div>
      )}
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
