import React from "react";
import { OrderInvoice, PaymentEntry, CompanyProfile, Currency } from "../types";
import { formatCurrency, convertCurrency } from "../services/currency";
import { TrendingUp, PieChart, BarChart3, ShieldCheck } from "lucide-react";

interface FinancialChartsProps {
  orders: OrderInvoice[];
  payments: PaymentEntry[];
  company: CompanyProfile;
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ orders, payments, company }) => {
  const baseCurr = company.baseCurrency;
  const rates = company.exchangeRates;

  // 1. Calculate Monthly Cash Flow (Last 6 months or projected)
  const monthlyData: { month: string; inflow: number; outflow: number; net: number }[] = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Group real payments + projected installments by month
  const now = new Date();
  for (let i = -2; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;

    // Inflows in this month
    const inflow = payments
      .filter((p) => p.type === "inflow" && p.paymentDate.startsWith(monthKey))
      .reduce((sum, p) => sum + p.convertedAmountBase, 0);

    // Outflows in this month
    const outflow = payments
      .filter((p) => p.type === "outflow" && p.paymentDate.startsWith(monthKey))
      .reduce((sum, p) => sum + p.convertedAmountBase, 0);

    // Add pending installments for future months
    let pendingInflow = 0;
    let pendingOutflow = 0;
    if (i >= 0) {
      orders.forEach((o) => {
        (o.installments || []).forEach((inst) => {
          if (inst.status === "pending" && inst.dueDate.startsWith(monthKey)) {
            const val = convertCurrency(inst.amount, o.currency, baseCurr, rates);
            if (o.type === "sale") pendingInflow += val;
            else pendingOutflow += val;
          }
        });
      });
    }

    const totalIn = inflow + pendingInflow;
    const totalOut = outflow + pendingOutflow;

    monthlyData.push({
      month: label,
      inflow: Math.round(totalIn),
      outflow: Math.round(totalOut),
      net: Math.round(totalIn - totalOut),
    });
  }

  const maxMonthVal = Math.max(...monthlyData.map((m) => Math.max(m.inflow, m.outflow)), 10000);

  // 2. Currency Exposure
  const trackedCurrencies: Currency[] = ["USD", "HKD", "EUR", "CNY"];
  const currencyExposure = trackedCurrencies.map((curr) => {
    const totalSales = orders
      .filter((o) => o.type === "sale" && o.currency === curr)
      .reduce((s, o) => s + o.totalAmount, 0);
    const totalPurchases = orders
      .filter((o) => o.type === "purchase" && o.currency === curr)
      .reduce((s, o) => s + o.totalAmount, 0);
    const netExposureBase = convertCurrency(totalSales - totalPurchases, curr, baseCurr, rates);

    return {
      currency: curr,
      totalSales,
      totalPurchases,
      netExposureBase,
    };
  });

  // 3. Collection Rate
  const totalSalesBase = orders
    .filter((o) => o.type === "sale")
    .reduce((s, o) => s + convertCurrency(o.totalAmount, o.currency, baseCurr, rates), 0);
  const totalCollectedBase = orders
    .filter((o) => o.type === "sale")
    .reduce((s, o) => s + convertCurrency(o.totalPaid, o.currency, baseCurr, rates), 0);
  const collectionRate = totalSalesBase > 0 ? (totalCollectedBase / totalSalesBase) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Monthly Cash Flow Projection (2 cols) */}
      <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">Cash Flow Trend & 90-Day Projection</h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">Inflows (Sales)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="text-slate-300">Outflows (Purchases)</span>
            </div>
          </div>
        </div>

        {/* Bar chart visualization */}
        <div className="h-56 flex items-end justify-between gap-4 pt-6 pb-2 border-b border-slate-800">
          {monthlyData.map((m, idx) => {
            const inHeight = Math.max(8, (m.inflow / maxMonthVal) * 100);
            const outHeight = Math.max(8, (m.outflow / maxMonthVal) * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-14 bg-slate-950 border border-slate-700 text-[11px] rounded-lg p-2 opacity-0 group-hover:opacity-100 transition shadow-xl pointer-events-none z-20 whitespace-nowrap">
                  <div className="font-bold text-white">{m.month}</div>
                  <div className="text-emerald-400">Inflow: {formatCurrency(m.inflow, baseCurr, 0)}</div>
                  <div className="text-rose-400">Outflow: {formatCurrency(m.outflow, baseCurr, 0)}</div>
                  <div className="text-blue-300 font-mono font-semibold">Net: {formatCurrency(m.net, baseCurr, 0)}</div>
                </div>

                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  <div
                    className="w-3.5 sm:w-5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all group-hover:brightness-125"
                    style={{ height: `${inHeight}%` }}
                  />
                  <div
                    className="w-3.5 sm:w-5 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all group-hover:brightness-125"
                    style={{ height: `${outHeight}%` }}
                  />
                </div>

                <span className="text-[11px] font-medium text-slate-400 mt-2">{m.month}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>* Includes actual settled bank transactions + confirmed upcoming deposit installments.</span>
          <span className="font-bold text-blue-400">Values in {baseCurr}</span>
        </div>
      </div>

      {/* Chart 2: Collection Efficiency & Currency Risk (1 col) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Receivables Collection Health</h3>
          </div>

          {/* Circular progress gauge */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <div className="text-3xl font-extrabold font-mono text-emerald-400">
              {collectionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mt-1">Cash Collection Velocity</div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-2">
              <span>Collected: {formatCurrency(totalCollectedBase, baseCurr, 0)}</span>
              <span>Total: {formatCurrency(totalSalesBase, baseCurr, 0)}</span>
            </div>
          </div>
        </div>

        {/* Currency Exposure Mini Bars */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-bold text-slate-300">Net Exposure by Currency</span>
            <span className="text-[10px] text-slate-500">(Sales - Costs)</span>
          </div>

          <div className="space-y-2">
            {currencyExposure.map((exp) => (
              <div key={exp.currency} className="flex items-center justify-between text-xs">
                <span className="font-bold font-mono text-slate-300 w-12">{exp.currency}</span>
                <div className="flex-1 mx-3 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${exp.netExposureBase >= 0 ? "bg-blue-400" : "bg-amber-400"}`}
                    style={{ width: "70%" }}
                  />
                </div>
                <span className={`font-mono font-bold text-xs ${exp.netExposureBase >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {formatCurrency(exp.netExposureBase, baseCurr, 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
