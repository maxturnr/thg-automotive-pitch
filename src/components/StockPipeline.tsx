'use client';

import { inStockVehicles, getStats } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Package } from 'lucide-react';

export default function StockPipeline() {
  const stats = getStats();

  return (
    <div className="bg-white rounded-xl border border-surface-200/60 shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-surface-900">Current Pipeline</h3>
          <p className="text-sm text-surface-400 mt-0.5">Vehicles in stock awaiting sale</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg">
          <Package className="w-4 h-4" />
          <span className="text-sm font-semibold">{stats.stockCount} cars</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {inStockVehicles.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-surface-900 truncate">
                {v.make} {v.model}
              </div>
              <div className="text-[11px] text-surface-400 font-mono">{v.reg}</div>
            </div>
            <div className="text-right ml-4">
              <div className="text-sm font-medium text-surface-700 font-mono">
                {formatCurrency(v.purchasePrice)}
              </div>
              {v.potentialProfit && (
                <div className="text-[11px] text-emerald-600 font-medium">
                  +{formatCurrency(v.potentialProfit)} potential
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-surface-100 flex items-center justify-between">
        <span className="text-sm text-surface-500">Total capital tied up</span>
        <span className="text-sm font-bold text-surface-900 font-mono">{formatCurrency(stats.stockCapital)}</span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm text-surface-500">Potential revenue</span>
        <span className="text-sm font-bold text-emerald-600 font-mono">{formatCurrency(stats.stockPotentialRevenue)}</span>
      </div>
    </div>
  );
}
