'use client';

import { useState, useMemo } from 'react';
import { DealSummary, projectReturns } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface ForecastProjectionProps {
  deals: DealSummary[];
}

export default function ForecastProjection({ deals }: ForecastProjectionProps) {
  const [capital, setCapital] = useState(50000);
  const [months, setMonths] = useState(12);

  const ownedDeals = deals.filter(
    d => d.car.type === 'owned' && !d.car.is_sale_or_return && d.car.status === 'Sold' && d.netProfit > 0
  );

  const avgCostPerCar = ownedDeals.length > 0
    ? Math.round(ownedDeals.reduce((s, d) => s + d.totalCosts, 0) / ownedDeals.length)
    : 5000;
  const avgNetProfit = ownedDeals.length > 0
    ? Math.round(ownedDeals.reduce((s, d) => s + d.netProfit, 0) / ownedDeals.length)
    : 1400;
  const holdDaysArr = ownedDeals.filter(d => d.holdDays !== null && d.holdDays > 0).map(d => d.holdDays!);
  const avgTurnover = holdDaysArr.length > 0
    ? Math.round(holdDaysArr.reduce((a, b) => a + b, 0) / holdDaysArr.length)
    : 21;
  const simultaneousCars = Math.max(1, Math.floor(capital / avgCostPerCar));

  const projections = useMemo(() => projectReturns(capital, months, deals), [capital, months, deals]);
  const final = projections[projections.length - 1];

  const presets = [25000, 50000, 100000, 250000];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-[10px] border px-4 py-3 shadow-card" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
          <p className="text-[11px] text-[#958f82]">Month {label}</p>
          <p className="text-sm font-medium text-[#23a56b] mt-1">
            {formatCurrency(payload[0].value)} profit
          </p>
          <p className="text-[11px] text-[#958f82] mt-0.5">
            {Math.round(payload[0].payload.carsFlipped)} cars flipped
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[30px] font-normal text-[#14130f]" style={{ letterSpacing: '-0.04em', lineHeight: 1 }}>
          Investment Forecast
        </h1>
        <p className="text-xs text-[#7a7368] mt-2 uppercase tracking-wide">
          Projected returns based on {ownedDeals.length} real owned deals — avg {formatCurrency(avgNetProfit)} profit, {avgTurnover}-day turnover
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white border rounded-[8px] shadow-card p-6 mb-5" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[13px] text-[#5f5a54] mb-3">Capital Investment</label>
            <div className="flex gap-2 mb-3">
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => setCapital(p)}
                  className={`flex-1 h-[32px] rounded-[6px] text-[13px] font-normal border transition-all ${
                    capital === p
                      ? 'bg-[#14130f] text-white border-[#14130f]'
                      : 'bg-[#fcfcfc] text-[#5f5a54] border-[#e7e0e2] hover:border-[#c8c2b8]'
                  }`}
                  style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
                  {formatCurrency(p)}
                </button>
              ))}
            </div>
            <input
              type="range"
              min={10000}
              max={500000}
              step={5000}
              value={capital}
              onChange={e => setCapital(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: '#e7e0e2', accentColor: '#14130f' }}
            />
            <div className="flex justify-between text-[11px] text-[#a39c8f] mt-1.5">
              <span>£10k</span>
              <span className="text-[14px] font-medium text-[#14130f]">{formatCurrency(capital)}</span>
              <span>£500k</span>
            </div>
          </div>
          <div>
            <label className="block text-[13px] text-[#5f5a54] mb-3">Projection Period</label>
            <div className="flex gap-2">
              {[6, 12, 24, 36].map(m => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={`flex-1 h-[32px] rounded-[6px] text-[13px] font-normal border transition-all ${
                    months === m
                      ? 'bg-[#14130f] text-white border-[#14130f]'
                      : 'bg-[#fcfcfc] text-[#5f5a54] border-[#e7e0e2] hover:border-[#c8c2b8]'
                  }`}
                  style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
                  {m} months
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assumptions */}
      <div className="bg-white border rounded-[8px] shadow-card p-6 mb-5" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
        <h3 className="text-[15px] font-normal text-[#878787] mb-4">Model Assumptions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Avg cost per car', value: formatCurrency(avgCostPerCar), sub: 'Purchase + prep' },
            { label: 'Avg net profit', value: formatCurrency(avgNetProfit), sub: 'Per car, after costs', valueClass: 'text-[#23a56b]' },
            { label: 'Turnover', value: `${avgTurnover} days`, sub: 'Avg buy-to-sell' },
            { label: 'Simultaneous cars', value: String(simultaneousCars), sub: `With ${formatCurrency(capital)} capital` },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-[8px]" style={{ background: '#f5f5f5' }}>
              <div className="text-[11px] text-[#7a7368] uppercase tracking-wide">{item.label}</div>
              <div className={`text-[18px] font-medium mt-1 ${(item as any).valueClass || 'text-[#14130f]'}`}>{item.value}</div>
              <div className="text-[11px] text-[#a39c8f]">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      {final && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <ResultCard label="Projected Total Profit" value={formatCurrency(final.cumulativeProfit)} sub={`Over ${months} months`} color="#23a56b" />
          <ResultCard label="Projected ROI" value={`${final.roi}%`} sub={`Return on ${formatCurrency(capital)}`} color="#35a7f6" />
          <ResultCard label="Total Cars Flipped" value={String(final.carsFlipped)} sub={`~${Math.round(final.carsFlipped / months)}/month`} color="#8e8df7" />
        </div>
      )}

      {/* Chart */}
      <div className="bg-white border rounded-[8px] shadow-card p-6 mb-5" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
        <h3 className="text-[15px] font-normal text-[#878787] mb-4">Cumulative Profit Over Time</h3>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projections} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#23a56b" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#23a56b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,19,15,0.06)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#8d867b', fontFamily: 'Inter Tight' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(20,19,15,0.08)' }}
                tickFormatter={(m) => `M${m}`}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#8d867b', fontFamily: 'Inter Tight' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulativeProfit"
                stroke="#23a56b"
                strokeWidth={2}
                fill="url(#profitGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="bg-white border rounded-[8px] shadow-card overflow-hidden" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
        <div className="px-6 py-3 border-b" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
          <h3 className="text-[15px] font-normal text-[#878787]">Monthly Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="border-b" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
              <tr>
                <th className="px-7 py-3 text-left text-[12px] font-normal" style={{ color: '#8d867b' }}>Month</th>
                <th className="px-7 py-3 text-right text-[12px] font-normal" style={{ color: '#8d867b' }}>Monthly Profit</th>
                <th className="px-7 py-3 text-right text-[12px] font-normal" style={{ color: '#8d867b' }}>Cumulative</th>
                <th className="px-7 py-3 text-right text-[12px] font-normal" style={{ color: '#8d867b' }}>Cars Flipped</th>
                <th className="px-7 py-3 text-right text-[12px] font-normal" style={{ color: '#8d867b' }}>ROI</th>
              </tr>
            </thead>
            <tbody>
              {projections.map(p => (
                <tr key={p.month} className="border-b hover:bg-[#fbfaf8]" style={{ borderColor: 'rgba(20,19,15,0.06)' }}>
                  <td className="px-7 py-3 text-[13px] text-[#14130f]">Month {p.month}</td>
                  <td className="px-7 py-3 text-[13px] text-right text-[#23a56b] font-medium">+{formatCurrency(p.monthlyProfit)}</td>
                  <td className="px-7 py-3 text-[13px] text-right text-[#14130f] font-medium">{formatCurrency(p.cumulativeProfit)}</td>
                  <td className="px-7 py-3 text-[13px] text-right text-[#958f82]">{p.carsFlipped}</td>
                  <td className="px-7 py-3 text-[13px] text-right text-[#35a7f6] font-medium">{p.roi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-[#a39c8f] mt-5 max-w-2xl">
        These projections are based on {ownedDeals.length} actual completed vehicle deals. Past performance does not guarantee future results.
        Actual returns may vary based on market conditions, vehicle availability, and other factors.
      </p>
    </div>
  );
}

function ResultCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-[8px] p-5 border" style={{ background: `${color}08`, borderColor: `${color}20` }}>
      <div className="text-[13px] font-normal" style={{ color }}>{label}</div>
      <div className="text-[28px] font-normal mt-2" style={{ color, letterSpacing: '-0.04em' }}>{value}</div>
      <div className="text-[11px] mt-1" style={{ color: `${color}99` }}>{sub}</div>
    </div>
  );
}
