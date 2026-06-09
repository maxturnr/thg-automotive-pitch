'use client';

import { useState, useMemo } from 'react';
import { projectReturns, getStats, soldDeals } from '@/lib/data';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Calculator, TrendingUp, Zap, Calendar } from 'lucide-react';

interface ForecastProjectionProps {
  compact?: boolean;
}

export default function ForecastProjection({ compact = false }: ForecastProjectionProps) {
  const [capital, setCapital] = useState(50000);
  const [months, setMonths] = useState(12);
  const stats = getStats();

  const projections = useMemo(() => projectReturns(capital, months), [capital, months]);

  const ownedDeals = soldDeals.filter(d => d.type === 'owned' && d.netProfit > 0);
  const avgCapitalPerCar = ownedDeals.length > 0
    ? ownedDeals.reduce((sum, d) => sum + d.purchasePrice + d.prepCosts, 0) / ownedDeals.length
    : 5000;
  const avgNetProfit = ownedDeals.length > 0
    ? ownedDeals.reduce((sum, d) => sum + d.netProfit, 0) / ownedDeals.length
    : 1400;
  const avgTurnover = stats.avgHoldDays || 21;
  const simultaneousCars = Math.floor(capital / avgCapitalPerCar);
  const cyclesPerMonth = 30 / avgTurnover;

  const finalProjection = projections[projections.length - 1];

  const presets = [25000, 50000, 100000, 250000];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-lg shadow-elevated border border-surface-200 px-4 py-3">
          <p className="text-xs text-surface-400">Month {label}</p>
          <p className="text-sm font-bold text-emerald-600 mt-1">
            {formatCurrency(payload[0].value)} profit
          </p>
          <p className="text-xs text-surface-500 mt-0.5">
            {Math.round(payload[0].payload.carsFlipped)} cars flipped
          </p>
        </div>
      );
    }
    return null;
  };

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-surface-200/60 shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-surface-900">Quick Forecast</h3>
            <p className="text-sm text-surface-400 mt-0.5">Projected returns on investment</p>
          </div>
          <Calculator className="w-5 h-5 text-surface-300" />
        </div>

        {/* Quick capital selector */}
        <div className="flex gap-2 mb-5">
          {presets.map(p => (
            <button
              key={p}
              onClick={() => setCapital(p)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                capital === p
                  ? 'bg-surface-900 text-white'
                  : 'bg-surface-50 text-surface-500 hover:bg-surface-100'
              }`}
            >
              {formatCurrency(p)}
            </button>
          ))}
        </div>

        {/* Key projections */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2.5 px-3 bg-emerald-50/50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-surface-600">12-month profit</span>
            </div>
            <span className="text-sm font-bold text-emerald-600 font-mono">
              {finalProjection ? formatCurrency(finalProjection.cumulativeProfit) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5 px-3 bg-blue-50/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-surface-600">Annual ROI</span>
            </div>
            <span className="text-sm font-bold text-blue-600 font-mono">
              {finalProjection ? `${finalProjection.roi}%` : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5 px-3 bg-violet-50/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-600" />
              <span className="text-sm text-surface-600">Cars per year</span>
            </div>
            <span className="text-sm font-bold text-violet-600 font-mono">
              {finalProjection ? finalProjection.carsFlipped : '—'}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-surface-400 mt-4">
          Based on {ownedDeals.length} actual owned vehicle deals. Past performance does not guarantee future results.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Investment Forecast</h2>
        <p className="text-surface-500 text-sm mt-1">
          Projected returns based on {ownedDeals.length} real completed deals — avg {formatCurrency(avgNetProfit)} profit per car, {avgTurnover}-day turnover
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-surface-200/60 shadow-card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Capital Investment</label>
            <div className="flex gap-2 mb-3">
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => setCapital(p)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    capital === p
                      ? 'bg-surface-900 text-white shadow-sm'
                      : 'bg-surface-50 text-surface-600 hover:bg-surface-100 border border-surface-200'
                  }`}
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
              className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-surface-900"
            />
            <div className="flex justify-between text-[11px] text-surface-400 mt-1">
              <span>£10k</span>
              <span className="font-semibold text-surface-900 text-sm">{formatCurrency(capital)}</span>
              <span>£500k</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Projection Period</label>
            <div className="flex gap-2">
              {[6, 12, 24, 36].map(m => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    months === m
                      ? 'bg-surface-900 text-white shadow-sm'
                      : 'bg-surface-50 text-surface-600 hover:bg-surface-100 border border-surface-200'
                  }`}
                >
                  {m} months
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assumptions */}
      <div className="bg-white rounded-xl border border-surface-200/60 shadow-card p-6 mb-6">
        <h3 className="text-sm font-semibold text-surface-700 mb-4">Model Assumptions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-50 rounded-lg p-3">
            <div className="text-[11px] text-surface-400 uppercase tracking-wide">Avg cost per car</div>
            <div className="text-lg font-bold text-surface-900 mt-1 font-mono">{formatCurrency(Math.round(avgCapitalPerCar))}</div>
            <div className="text-[11px] text-surface-400">Purchase + prep</div>
          </div>
          <div className="bg-surface-50 rounded-lg p-3">
            <div className="text-[11px] text-surface-400 uppercase tracking-wide">Avg net profit</div>
            <div className="text-lg font-bold text-emerald-600 mt-1 font-mono">{formatCurrency(Math.round(avgNetProfit))}</div>
            <div className="text-[11px] text-surface-400">Per car, after costs</div>
          </div>
          <div className="bg-surface-50 rounded-lg p-3">
            <div className="text-[11px] text-surface-400 uppercase tracking-wide">Turnover</div>
            <div className="text-lg font-bold text-surface-900 mt-1">{avgTurnover} days</div>
            <div className="text-[11px] text-surface-400">Avg buy-to-sell</div>
          </div>
          <div className="bg-surface-50 rounded-lg p-3">
            <div className="text-[11px] text-surface-400 uppercase tracking-wide">Simultaneous cars</div>
            <div className="text-lg font-bold text-surface-900 mt-1">{simultaneousCars}</div>
            <div className="text-[11px] text-surface-400">With {formatCurrency(capital)} capital</div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5">
          <div className="text-sm text-emerald-700 font-medium">Projected Total Profit</div>
          <div className="text-3xl font-bold text-emerald-700 mt-2 font-mono">
            {finalProjection ? formatCurrency(finalProjection.cumulativeProfit) : '—'}
          </div>
          <div className="text-xs text-emerald-600/70 mt-1">Over {months} months</div>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
          <div className="text-sm text-blue-700 font-medium">Projected ROI</div>
          <div className="text-3xl font-bold text-blue-700 mt-2 font-mono">
            {finalProjection ? `${finalProjection.roi}%` : '—'}
          </div>
          <div className="text-xs text-blue-600/70 mt-1">Return on {formatCurrency(capital)}</div>
        </div>
        <div className="bg-violet-50 rounded-xl border border-violet-100 p-5">
          <div className="text-sm text-violet-700 font-medium">Total Cars Flipped</div>
          <div className="text-3xl font-bold text-violet-700 mt-2 font-mono">
            {finalProjection ? finalProjection.carsFlipped : '—'}
          </div>
          <div className="text-xs text-violet-600/70 mt-1">
            ~{finalProjection ? Math.round(finalProjection.carsFlipped / months) : 0}/month
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-surface-200/60 shadow-card p-6">
        <h3 className="text-sm font-semibold text-surface-700 mb-4">Cumulative Profit Over Time</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projections} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(m) => `M${m}`}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulativeProfit"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#profitGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="bg-white rounded-xl border border-surface-200/60 shadow-card p-6 mt-6">
        <h3 className="text-sm font-semibold text-surface-700 mb-4">Monthly Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-surface-100">
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-surface-400 uppercase">Month</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-surface-400 uppercase">Monthly Profit</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-surface-400 uppercase">Cumulative</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-surface-400 uppercase">Cars Flipped</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-surface-400 uppercase">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {projections.map(p => (
                <tr key={p.month} className="hover:bg-surface-50/50">
                  <td className="px-4 py-2.5 text-sm text-surface-600">Month {p.month}</td>
                  <td className="px-4 py-2.5 text-sm text-right font-mono text-emerald-600 font-medium">
                    +{formatCurrency(p.monthlyProfit)}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-right font-mono text-surface-900 font-semibold">
                    {formatCurrency(p.cumulativeProfit)}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-right font-mono text-surface-600">{p.carsFlipped}</td>
                  <td className="px-4 py-2.5 text-sm text-right font-mono text-blue-600 font-medium">{p.roi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-surface-400 mt-6 max-w-2xl">
        <strong>Disclaimer:</strong> These projections are based on {ownedDeals.length} actual completed vehicle deals by THG Automotive. 
        Past performance does not guarantee future results. Actual returns may vary based on market conditions, 
        vehicle availability, and other factors. This is not financial advice.
      </p>
    </div>
  );
}
