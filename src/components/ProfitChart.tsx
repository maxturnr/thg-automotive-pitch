'use client';

import { soldDeals } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function ProfitChart() {
  const chartData = useMemo(() => {
    return soldDeals
      .filter(d => d.netProfit > 0)
      .sort((a, b) => b.netProfit - a.netProfit)
      .map(d => ({
        name: `${d.make} ${d.model}`.length > 20 
          ? `${d.make} ${d.model}`.slice(0, 18) + '…' 
          : `${d.make} ${d.model}`,
        fullName: `${d.make} ${d.model}`,
        profit: d.netProfit,
        type: d.type,
        reg: d.reg,
      }));
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white rounded-lg shadow-elevated border border-surface-200 px-4 py-3">
          <p className="text-sm font-semibold text-surface-900">{data.fullName}</p>
          <p className="text-[11px] text-surface-400 font-mono">{data.reg}</p>
          <p className="text-sm font-bold text-emerald-600 mt-1">
            +{formatCurrency(data.profit)}
          </p>
          <p className="text-[11px] text-surface-400 mt-0.5">
            {data.type === 'owned' ? 'Owned stock' : 'Sale or return'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-surface-200/60 shadow-card p-6">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-surface-900">Profit by Vehicle</h3>
        <p className="text-sm text-surface-400 mt-0.5">Net profit earned on each completed deal</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              angle={-35}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `£${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="profit" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.type === 'owned' ? '#10b981' : '#8b5cf6'}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-5 mt-4 pt-4 border-t border-surface-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-xs text-surface-500">Owned stock</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-violet-500" />
          <span className="text-xs text-surface-500">Sale or return (commission)</span>
        </div>
      </div>
    </div>
  );
}
