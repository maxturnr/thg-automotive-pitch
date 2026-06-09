'use client';

import { useState, useEffect } from 'react';
import { fetchAllData, computeDeals, computeStats, DealSummary, Stats } from '@/lib/data';
import Sidebar from '@/components/Sidebar';
import Overview from '@/components/Overview';
import DealsTable from '@/components/DealsTable';
import ForecastProjection from '@/components/ForecastProjection';

type Tab = 'overview' | 'deals' | 'forecast';

export default function Home() {
  const [tab, setTab] = useState<Tab>('overview');
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { cars, expenses, income } = await fetchAllData();
        const allDeals = computeDeals(cars, expenses, income);
        const allStats = computeStats(allDeals);
        setDeals(allDeals);
        setStats(allStats);
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f5f5' }}>
        <div className="text-center">
          <div className="w-8 h-8 rounded-[9px] bg-[#14130f] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-serif italic text-sm">T</span>
          </div>
          <p className="text-[#7a7368] text-sm">Loading data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#f5f5f5' }}>
      <Sidebar activeTab={tab} onTabChange={setTab} />
      <main className="flex-1 ml-[248px] min-h-screen">
        <div className="px-7 py-2 pb-10">
          {tab === 'overview' && stats && <Overview deals={deals} stats={stats} />}
          {tab === 'deals' && <DealsTable deals={deals} />}
          {tab === 'forecast' && <ForecastProjection deals={deals} />}
        </div>
      </main>
    </div>
  );
}
