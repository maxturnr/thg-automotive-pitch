'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAllData, computeDeals, computeStats, DealSummary, Stats } from '@/lib/data';
import Sidebar from '@/components/Sidebar';
import Overview from '@/components/Overview';
import DealsTable from '@/components/DealsTable';
import ForecastProjection from '@/components/ForecastProjection';
import CarDrawer from '@/components/CarDrawer';

type Tab = 'overview' | 'deals' | 'forecast';

export default function Home() {
  const [tab, setTab] = useState<Tab>('overview');
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Drawer state
  const [selectedDeal, setSelectedDeal] = useState<DealSummary | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isNewCar, setIsNewCar] = useState(false);

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSelectDeal = (deal: DealSummary) => {
    setSelectedDeal(deal);
    setIsNewCar(false);
    setDrawerOpen(true);
  };

  const handleAddNew = () => {
    setSelectedDeal(null);
    setIsNewCar(true);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedDeal(null);
    setIsNewCar(false);
  };

  const handleSaved = () => {
    // Reload data after save
    loadData();
    if (isNewCar) {
      handleDrawerClose();
    }
  };

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
          {tab === 'overview' && stats && (
            <Overview deals={deals} stats={stats} onSelectDeal={handleSelectDeal} />
          )}
          {tab === 'deals' && (
            <DealsTable deals={deals} onSelectDeal={handleSelectDeal} onAddNew={handleAddNew} />
          )}
          {tab === 'forecast' && <ForecastProjection deals={deals} />}
        </div>
      </main>

      {/* Car Detail Drawer */}
      {drawerOpen && (
        <CarDrawer
          deal={selectedDeal}
          isNew={isNewCar}
          onClose={handleDrawerClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
