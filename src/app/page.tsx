'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import KPICards from '@/components/KPICards';
import DealsTable from '@/components/DealsTable';
import ForecastProjection from '@/components/ForecastProjection';
import StockPipeline from '@/components/StockPipeline';
import ProfitChart from '@/components/ProfitChart';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'forecast'>('overview');

  return (
    <div className="min-h-screen">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <KPICards />
            <ProfitChart />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <StockPipeline />
              <ForecastProjection compact />
            </div>
          </div>
        )}
        
        {activeTab === 'deals' && (
          <DealsTable />
        )}
        
        {activeTab === 'forecast' && (
          <ForecastProjection />
        )}
      </main>
    </div>
  );
}
