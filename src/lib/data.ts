import { supabase } from './supabase';

// ── Types ──

export interface Car {
  id: number;
  reg: string;
  make: string;
  model: string;
  paid: number | null;         // purchase price
  sold: number | null;         // sold price
  purchase_date: string | null;
  sale_date: string | null;
  deposit_date: string | null;
  status: string;              // "Sold", "In Stock", "On Site"
  type: string;                // "owned" or "sor"
  advertised: number | null;   // advertised price
  advertised_date: string | null;
  total_income: number;
  fee: number | null;
  is_sale_or_return: boolean;
  sale_or_return_commission_rate: number | null;
  deposit_amount: number;
  final_sale_price: number | null;
  owner_payout_amount: number | null;
  stock_number_text: string | null;
  notes: string | null;
  owner_name: string | null;
  // Vehicle details (from AutoTrader lookup)
  colour: string | null;
  fuel_type: string | null;
  body_type: string | null;
  transmission: string | null;
  year: number | null;
  engine_size: string | null;
  doors: number | null;
  seats: number | null;
  derivative: string | null;
  vin: string | null;
  mileage: number | null;
  engine_power_bhp: number | null;
  co2_emissions: number | null;
  retail_value: number | null;
  trade_value: number | null;
}

export interface Expense {
  id: number;
  stock_id: number | null;
  type: string;
  amount: number;
  net_amount: number | null;
  vat_amount: number | null;
  vat_status: string | null;
  date: string;
  supplier: string;
  is_overhead: boolean;
}

export interface Income {
  id: number;
  stock_id: number | null;
  type: string;
  amount: number;
  date: string;
}

export interface DealSummary {
  car: Car;
  expenses: Expense[];
  income: Income[];
  purchasePrice: number;       // "Vehicle Purchase" expense or car.paid
  prepCosts: number;           // all non-purchase expenses
  totalCosts: number;          // purchase + prep
  totalIncome: number;         // from income table or car.total_income
  salePrice: number;           // car.sold or total income for SOR
  netProfit: number;
  roi: number | null;          // % return on capital for owned
  holdDays: number | null;     // purchase_date → sale/deposit date
}

export interface Stats {
  totalDeals: number;
  soldDeals: number;
  ownedSoldDeals: number;
  sorSoldDeals: number;
  inStockCount: number;
  totalProfit: number;
  totalCapitalDeployed: number;
  avgRoi: number;
  avgHoldDays: number;
  avgProfitPerCar: number;
  stockCapital: number;
  stockPotentialRevenue: number;
}

// ── Fetch from Supabase ──

export async function fetchAllData(): Promise<{
  cars: Car[];
  expenses: Expense[];
  income: Income[];
}> {
  const [carsRes, expensesRes, incomeRes] = await Promise.all([
    supabase.from('cars').select('*').order('id'),
    supabase.from('expenses').select('id,stock_id,type,amount,date,supplier,is_overhead').not('stock_id', 'is', null),
    supabase.from('income').select('id,stock_id,type,amount,date').not('stock_id', 'is', null),
  ]);

  return {
    cars: (carsRes.data || []) as Car[],
    expenses: (expensesRes.data || []) as Expense[],
    income: (incomeRes.data || []) as Income[],
  };
}

// ── Compute deals ──

export function computeDeals(cars: Car[], expenses: Expense[], income: Income[]): DealSummary[] {
  const expensesByStock = new Map<number, Expense[]>();
  for (const e of expenses) {
    if (e.stock_id == null) continue;
    const list = expensesByStock.get(e.stock_id) || [];
    list.push(e);
    expensesByStock.set(e.stock_id, list);
  }

  const incomeByStock = new Map<number, Income[]>();
  for (const i of income) {
    if (i.stock_id == null) continue;
    const list = incomeByStock.get(i.stock_id) || [];
    list.push(i);
    incomeByStock.set(i.stock_id, list);
  }

  return cars.map(car => {
    const carExpenses = expensesByStock.get(car.id) || [];
    const carIncome = incomeByStock.get(car.id) || [];

    // Purchase price: look for "Vehicle Purchase" expense type, otherwise use car.paid
    const purchaseExpense = carExpenses.find(e => 
      e.type?.toLowerCase() === 'vehicle purchase' || e.type?.toLowerCase() === 'vehicle_purchase'
    );
    const purchasePrice = purchaseExpense?.amount ?? car.paid ?? 0;

    // Prep costs: all expenses that aren't the vehicle purchase
    const prepCosts = carExpenses
      .filter(e => e.type?.toLowerCase() !== 'vehicle purchase' && e.type?.toLowerCase() !== 'vehicle_purchase')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalCosts = purchasePrice + prepCosts;

    // Income: sum from income table or fall back to car.total_income
    const incomeTotal = carIncome.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalIncome = incomeTotal > 0 ? incomeTotal : (car.total_income || 0);

    // Sale price
    const salePrice = car.sold || car.final_sale_price || totalIncome || 0;

    // Net profit
    let netProfit: number;
    if (car.type === 'sor' || car.is_sale_or_return) {
      // SOR: profit is commission (fee or total_income minus owner payout)
      if (car.fee != null && car.fee > 0) {
        netProfit = car.fee;
      } else if (car.owner_payout_amount != null) {
        netProfit = totalIncome - car.owner_payout_amount - prepCosts;
      } else {
        // Approximate: use commission rate or just total_income as the commission
        netProfit = totalIncome - prepCosts;
      }
    } else {
      // Owned: profit = sale price - total costs
      netProfit = salePrice - totalCosts;
    }

    // ROI: only for owned with capital deployed
    const roi = (car.type === 'owned' && !car.is_sale_or_return && totalCosts > 0)
      ? Math.round((netProfit / totalCosts) * 100)
      : null;

    // Hold days
    const startDate = car.purchase_date ? new Date(car.purchase_date) : null;
    const endDate = car.deposit_date
      ? new Date(car.deposit_date)
      : car.sale_date
      ? new Date(car.sale_date)
      : null;
    const holdDays = startDate && endDate
      ? Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      car,
      expenses: carExpenses,
      income: carIncome,
      purchasePrice,
      prepCosts,
      totalCosts,
      totalIncome,
      salePrice,
      netProfit,
      roi,
      holdDays,
    };
  });
}

// ── Stats ──

export function computeStats(deals: DealSummary[]): Stats {
  const soldDeals = deals.filter(d => d.car.status === 'Sold');
  const ownedSold = soldDeals.filter(d => d.car.type === 'owned' && !d.car.is_sale_or_return);
  const sorSold = soldDeals.filter(d => d.car.type === 'sor' || d.car.is_sale_or_return);
  const inStock = deals.filter(d => d.car.status === 'In Stock' || d.car.status === 'On Site');

  const totalProfit = soldDeals.reduce((s, d) => s + d.netProfit, 0);
  const totalCapital = ownedSold.reduce((s, d) => s + d.totalCosts, 0);

  const ownedRois = ownedSold.filter(d => d.roi !== null).map(d => d.roi!);
  const avgRoi = ownedRois.length > 0 ? Math.round(ownedRois.reduce((a, b) => a + b, 0) / ownedRois.length) : 0;

  const holdDaysArr = soldDeals.filter(d => d.holdDays !== null && d.holdDays > 0).map(d => d.holdDays!);
  const avgHoldDays = holdDaysArr.length > 0 ? Math.round(holdDaysArr.reduce((a, b) => a + b, 0) / holdDaysArr.length) : 0;

  const stockCapital = inStock
    .filter(d => d.car.type === 'owned')
    .reduce((s, d) => s + d.totalCosts, 0);
  const stockPotentialRevenue = inStock
    .filter(d => d.car.advertised)
    .reduce((s, d) => s + (d.car.advertised || 0), 0);

  return {
    totalDeals: deals.length,
    soldDeals: soldDeals.length,
    ownedSoldDeals: ownedSold.length,
    sorSoldDeals: sorSold.length,
    inStockCount: inStock.length,
    totalProfit,
    totalCapitalDeployed: totalCapital,
    avgRoi,
    avgHoldDays,
    avgProfitPerCar: soldDeals.length > 0 ? Math.round(totalProfit / soldDeals.length) : 0,
    stockCapital,
    stockPotentialRevenue,
  };
}

// ── Forecast ──

export interface ForecastMonth {
  month: number;
  monthlyProfit: number;
  cumulativeProfit: number;
  carsFlipped: number;
  roi: number;
}

export function projectReturns(
  capital: number,
  months: number,
  deals: DealSummary[]
): ForecastMonth[] {
  const ownedDeals = deals.filter(
    d => d.car.type === 'owned' && !d.car.is_sale_or_return && d.car.status === 'Sold' && d.netProfit > 0
  );

  if (ownedDeals.length === 0) return [];

  const avgCostPerCar = ownedDeals.reduce((s, d) => s + d.totalCosts, 0) / ownedDeals.length;
  const avgProfitPerCar = ownedDeals.reduce((s, d) => s + d.netProfit, 0) / ownedDeals.length;
  const holdDaysArr = ownedDeals.filter(d => d.holdDays !== null && d.holdDays > 0).map(d => d.holdDays!);
  const avgTurnover = holdDaysArr.length > 0
    ? holdDaysArr.reduce((a, b) => a + b, 0) / holdDaysArr.length
    : 21;

  const simultaneousCars = Math.max(1, Math.floor(capital / avgCostPerCar));
  const cyclesPerMonth = 30 / avgTurnover;
  const carsPerMonth = simultaneousCars * cyclesPerMonth;
  const monthlyProfit = Math.round(carsPerMonth * avgProfitPerCar);

  const results: ForecastMonth[] = [];
  let cumulative = 0;
  let totalCars = 0;
  for (let m = 1; m <= months; m++) {
    cumulative += monthlyProfit;
    totalCars += carsPerMonth;
    results.push({
      month: m,
      monthlyProfit,
      cumulativeProfit: cumulative,
      carsFlipped: Math.round(totalCars),
      roi: Math.round((cumulative / capital) * 100),
    });
  }
  return results;
}
