// Vehicle deal data from THG Automotive Supabase
// Each deal represents a completed vehicle transaction

export interface Deal {
  id: number;
  reg: string;
  make: string;
  model: string;
  type: 'owned' | 'sor';
  status: string;
  purchasePrice: number;
  salePrice: number;
  advertisedPrice: number | null;
  fee: number; // SOR commission
  purchaseDate: string | null;
  saleDate: string | null;
  depositDate: string | null;
  holdDays: number | null;
  totalExpenses: number; // includes purchase price
  prepCosts: number; // expenses minus purchase price
  totalIncome: number;
  netProfit: number;
  roi: number | null; // % return on capital
  annualisedRoi: number | null;
}

export interface InStockVehicle {
  id: number;
  reg: string;
  make: string;
  model: string;
  type: string;
  purchasePrice: number;
  advertisedPrice: number | null;
  purchaseDate: string | null;
  potentialProfit: number | null;
}

// Sold deals - computed from Supabase data
export const soldDeals: Deal[] = [
  {
    id: 1, reg: 'MV12 HSO', make: 'Audi', model: 'Q3 S-Line Auto',
    type: 'sor', status: 'Sold', purchasePrice: 0, salePrice: 9900,
    advertisedPrice: null, fee: 87.30, purchaseDate: '2026-04-01',
    saleDate: '2026-03-23', depositDate: null, holdDays: null,
    totalExpenses: 87.30, prepCosts: 0, totalIncome: 0,
    netProfit: 87.30, roi: null, annualisedRoi: null,
  },
  {
    id: 3, reg: 'WP19 JYX', make: 'DS', model: 'DS3',
    type: 'sor', status: 'Sold', purchasePrice: 0, salePrice: 9300,
    advertisedPrice: 9750, fee: 362.01, purchaseDate: '2026-03-27',
    saleDate: '2026-04-20', depositDate: null, holdDays: 24,
    totalExpenses: 362.01, prepCosts: 0, totalIncome: 9300,
    netProfit: 362.01, roi: null, annualisedRoi: null,
  },
  {
    id: 4, reg: 'EGZ 9466', make: 'Mercedes', model: 'C-Class AMG Line Estate',
    type: 'sor', status: 'Sold', purchasePrice: 0, salePrice: 11029,
    advertisedPrice: 11495, fee: 1667, purchaseDate: '2026-03-20',
    saleDate: '2026-04-19', depositDate: null, holdDays: 30,
    totalExpenses: 1667, prepCosts: 0, totalIncome: 11029,
    netProfit: 1667, roi: null, annualisedRoi: null,
  },
  {
    id: 6, reg: 'VN13 SNF', make: 'Volkswagen', model: 'Golf 2.0 TDI GT',
    type: 'owned', status: 'Sold', purchasePrice: 5000, salePrice: 6995,
    advertisedPrice: 6995, fee: 0, purchaseDate: '2026-04-05',
    saleDate: '2026-04-16', depositDate: '2026-04-16', holdDays: 11,
    totalExpenses: 5462.75, prepCosts: 462.75, totalIncome: 6995,
    netProfit: 1532.25, roi: 30.65, annualisedRoi: 1017.12,
  },
  {
    id: 7, reg: 'FL12 XTP', make: 'Land Rover', model: 'Range Rover Evoque',
    type: 'owned', status: 'Sold', purchasePrice: 6501, salePrice: 8750,
    advertisedPrice: 8995, fee: 0, purchaseDate: '2026-04-13',
    saleDate: '2026-04-13', depositDate: '2026-04-13', holdDays: 0,
    totalExpenses: 7560.89, prepCosts: 1059.89, totalIncome: 8750,
    netProfit: 1189.11, roi: 18.29, annualisedRoi: null,
  },
  {
    id: 8, reg: 'J13 ECU', make: 'BMW', model: '430d xDrive M Sport',
    type: 'sor', status: 'Sold', purchasePrice: 0, salePrice: 12695,
    advertisedPrice: null, fee: 1045, purchaseDate: '2026-04-10',
    saleDate: null, depositDate: null, holdDays: null,
    totalExpenses: 944.12, prepCosts: 0, totalIncome: 12845,
    netProfit: 1045, roi: null, annualisedRoi: null,
  },
  {
    id: 9, reg: 'EK16 OOC', make: 'Volkswagen', model: 'Polo GTI Auto',
    type: 'owned', status: 'Sold', purchasePrice: 2720, salePrice: 5250,
    advertisedPrice: 5495, fee: 0, purchaseDate: '2026-04-12',
    saleDate: '2026-05-15', depositDate: '2026-05-15', holdDays: 33,
    totalExpenses: 3877.59, prepCosts: 1157.59, totalIncome: 5250,
    netProfit: 1372.41, roi: 50.46, annualisedRoi: 558.07,
  },
  {
    id: 11, reg: 'EF13 WBY', make: 'Ford', model: 'Fiesta Zetec S',
    type: 'owned', status: 'Sold', purchasePrice: 1600, salePrice: 1600,
    advertisedPrice: null, fee: 0, purchaseDate: '2026-04-20',
    saleDate: '2026-04-20', depositDate: null, holdDays: 0,
    totalExpenses: 1600, prepCosts: 0, totalIncome: 1600,
    netProfit: 0, roi: 0, annualisedRoi: null,
  },
  {
    id: 12, reg: 'LJ65 UOG', make: 'Ford', model: 'Transit Connect',
    type: 'sor', status: 'Sold', purchasePrice: 0, salePrice: 7500,
    advertisedPrice: null, fee: 353.76, purchaseDate: '2026-04-18',
    saleDate: '2026-05-14', depositDate: null, holdDays: 26,
    totalExpenses: 353.76, prepCosts: 0, totalIncome: 7500,
    netProfit: 353.76, roi: null, annualisedRoi: null,
  },
  {
    id: 13, reg: 'MJ17RSZ', make: 'BMW', model: '1 Series 120d M Sport Auto',
    type: 'owned', status: 'Sold', purchasePrice: 6000, salePrice: 9000,
    advertisedPrice: 9495, fee: 0, purchaseDate: '2026-04-24',
    saleDate: '2026-05-07', depositDate: '2026-05-07', holdDays: 13,
    totalExpenses: 7633.71, prepCosts: 1633.71, totalIncome: 9195,
    netProfit: 1561.29, roi: 26.02, annualisedRoi: 730.80,
  },
  {
    id: 14, reg: 'FGZ1880', make: 'Volvo', model: 'V40',
    type: 'owned', status: 'Sold', purchasePrice: 3800, salePrice: 5355,
    advertisedPrice: 5750, fee: 0, purchaseDate: '2026-05-01',
    saleDate: '2026-06-01', depositDate: '2026-05-30', holdDays: 31,
    totalExpenses: 4684.45, prepCosts: 884.45, totalIncome: 0,
    netProfit: 670.55, roi: 17.65, annualisedRoi: 207.82,
  },
  {
    id: 16, reg: 'OY15LTX', make: 'BMW', model: '320d M Sport Touring',
    type: 'owned', status: 'Sold', purchasePrice: 5900, salePrice: 8995,
    advertisedPrice: 8995, fee: 0, purchaseDate: '2026-05-08',
    saleDate: '2026-06-03', depositDate: '2026-06-02', holdDays: 26,
    totalExpenses: 1011.77, prepCosts: 1011.77, totalIncome: 0,
    netProfit: 2083.23, roi: 35.31, annualisedRoi: 495.85,
  },
  {
    id: 19, reg: 'YH10 NNV', make: 'BMW', model: 'X1',
    type: 'sor', status: 'Sold', purchasePrice: 0, salePrice: 3995,
    advertisedPrice: null, fee: 372.85, purchaseDate: null,
    saleDate: '2026-05-21', depositDate: null, holdDays: null,
    totalExpenses: 401.92, prepCosts: 0, totalIncome: 3995,
    netProfit: 372.85, roi: null, annualisedRoi: null,
  },
];

export const inStockVehicles: InStockVehicle[] = [
  { id: 2, reg: 'HF15 XAZ', make: 'Audi', model: 'Q5 S-Line Auto', type: 'owned', purchasePrice: 6250, advertisedPrice: 9750, purchaseDate: '2026-04-25', potentialProfit: 3500 },
  { id: 5, reg: 'MA18 ZRL', make: 'Mazda', model: 'CX-5', type: 'owned', purchasePrice: 5550, advertisedPrice: 8750, purchaseDate: '2026-04-26', potentialProfit: 3200 },
  { id: 10, reg: 'KM61 AFY', make: 'Volkswagen', model: 'Golf 1.4 TSI GT Cab', type: 'owned', purchasePrice: 2720, advertisedPrice: 4495, purchaseDate: '2026-04-15', potentialProfit: 1775 },
  { id: 17, reg: 'DA59CPE', make: 'Volkswagen', model: 'Golf GTD', type: 'owned', purchasePrice: 1100, advertisedPrice: 2995, purchaseDate: '2026-05-12', potentialProfit: 1895 },
  { id: 18, reg: 'EA68PFV', make: 'Ford', model: 'Fiesta 1.1 Zetec', type: 'owned', purchasePrice: 3525, advertisedPrice: 5250, purchaseDate: '2026-05-14', potentialProfit: 1725 },
  { id: 21, reg: 'SN63 DXB', make: 'Mercedes', model: 'E250d Estate', type: 'owned', purchasePrice: 6200, advertisedPrice: 9495, purchaseDate: '2026-05-22', potentialProfit: 3295 },
  { id: 22, reg: 'LM17 FHC', make: 'Nissan', model: 'Qashqai', type: 'owned', purchasePrice: 4695, advertisedPrice: 6995, purchaseDate: '2026-06-01', potentialProfit: 2300 },
  { id: 23, reg: 'LN16WUB', make: 'Hyundai', model: 'Tucson', type: 'owned', purchasePrice: 5500, advertisedPrice: 9250, purchaseDate: '2026-06-05', potentialProfit: 3750 },
];

// Computed summary stats
export function getStats() {
  const ownedDeals = soldDeals.filter(d => d.type === 'owned');
  const sorDeals = soldDeals.filter(d => d.type === 'sor');

  const totalCapitalDeployed = ownedDeals.reduce((sum, d) => sum + d.purchasePrice, 0);
  const totalRevenue = ownedDeals.reduce((sum, d) => sum + d.salePrice, 0);
  const totalOwnedProfit = ownedDeals.reduce((sum, d) => sum + d.netProfit, 0);
  const totalSorCommission = sorDeals.reduce((sum, d) => sum + d.netProfit, 0);
  const totalProfit = totalOwnedProfit + totalSorCommission;
  
  const profitableOwned = ownedDeals.filter(d => d.netProfit > 0);
  const avgRoi = profitableOwned.length > 0
    ? profitableOwned.reduce((sum, d) => sum + (d.roi || 0), 0) / profitableOwned.length
    : 0;
  
  const holdDays = soldDeals.filter(d => d.holdDays !== null && d.holdDays > 0).map(d => d.holdDays!);
  const avgHoldDays = holdDays.length > 0 ? holdDays.reduce((a, b) => a + b, 0) / holdDays.length : 0;
  
  const avgProfitPerCar = soldDeals.length > 0 ? totalProfit / soldDeals.length : 0;
  const avgPrepCost = ownedDeals.length > 0 ? ownedDeals.reduce((sum, d) => sum + d.prepCosts, 0) / ownedDeals.length : 0;

  // Current stock value
  const stockCapital = inStockVehicles.reduce((sum, v) => sum + v.purchasePrice, 0);
  const stockPotentialRevenue = inStockVehicles.reduce((sum, v) => sum + (v.advertisedPrice || 0), 0);

  return {
    totalDeals: soldDeals.length,
    ownedDeals: ownedDeals.length,
    sorDeals: sorDeals.length,
    totalCapitalDeployed,
    totalRevenue,
    totalOwnedProfit,
    totalSorCommission,
    totalProfit,
    avgRoi,
    avgHoldDays: Math.round(avgHoldDays),
    avgProfitPerCar: Math.round(avgProfitPerCar),
    avgPrepCost: Math.round(avgPrepCost),
    stockCount: inStockVehicles.length,
    stockCapital,
    stockPotentialRevenue,
    stockPotentialProfit: stockPotentialRevenue - stockCapital,
  };
}

// Forecast projection
export function projectReturns(capitalInvested: number, months: number = 12) {
  const stats = getStats();
  const ownedDeals = soldDeals.filter(d => d.type === 'owned' && d.netProfit > 0);
  
  if (ownedDeals.length === 0) return [];

  // Average capital per car (purchase + prep)
  const avgCapitalPerCar = ownedDeals.reduce((sum, d) => sum + d.purchasePrice + d.prepCosts, 0) / ownedDeals.length;
  // Average net profit per car
  const avgNetProfit = ownedDeals.reduce((sum, d) => sum + d.netProfit, 0) / ownedDeals.length;
  // Average turnover in days
  const avgTurnover = stats.avgHoldDays || 21;
  
  // How many cars can run simultaneously
  const simultaneousCars = Math.floor(capitalInvested / avgCapitalPerCar);
  // Cycles per month (30 days / avg hold)
  const cyclesPerMonth = 30 / avgTurnover;
  // Cars sold per month
  const carsPerMonth = simultaneousCars * cyclesPerMonth;
  // Monthly profit
  const monthlyProfit = carsPerMonth * avgNetProfit;
  
  const projections = [];
  let cumProfit = 0;
  
  for (let m = 1; m <= months; m++) {
    cumProfit += monthlyProfit;
    projections.push({
      month: m,
      monthlyProfit: Math.round(monthlyProfit),
      cumulativeProfit: Math.round(cumProfit),
      carsFlipped: Math.round(carsPerMonth * m),
      roi: Math.round((cumProfit / capitalInvested) * 100),
    });
  }
  
  return projections;
}
