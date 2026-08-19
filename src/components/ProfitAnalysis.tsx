import React, { useState } from "react";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Briefcase
} from "lucide-react";
import { OrderInvoice, CompanyProfile } from "../types";
import { formatCurrency, convertCurrency } from "../services/currency";

interface ProfitAnalysisProps {
  orders: OrderInvoice[];
  company: CompanyProfile;
}

export const ProfitAnalysis: React.FC<ProfitAnalysisProps> = ({ orders, company }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const baseCurr = company.baseCurrency;
  const rates = company.exchangeRates;

  const sales = orders.filter((o) => o.type === "sale");
  const purchases = orders.filter((o) => o.type === "purchase");

  // Group dossiers
  const dossiers = sales.map((sale) => {
    const linkedPurchases = purchases.filter(
      (p) => p.linkedOrderReference === sale.reference || p.reference === sale.linkedOrderReference
    );

    const saleAmountBase = convertCurrency(sale.totalAmount, sale.currency, baseCurr, rates);
    const salePaidBase = convertCurrency(sale.totalPaid, sale.currency, baseCurr, rates);

    const purchaseAmountBase = linkedPurchases.reduce(
      (sum, p) => sum + convertCurrency(p.totalAmount, p.currency, baseCurr, rates),
      0
    );

    const purchasePaidBase = linkedPurchases.reduce(
      (sum, p) => sum + convertCurrency(p.totalPaid, p.currency, baseCurr, rates),
      0
    );

    const projectedMarginBase = saleAmountBase - purchaseAmountBase;
    const projectedMarginPct = saleAmountBase > 0 ? (projectedMarginBase / saleAmountBase) * 100 : 0;

    const realizedCashMarginBase = salePaidBase - purchasePaidBase;

    return {
      sale,
      linkedPurchases,
      saleAmountBase,
      salePaidBase,
      purchaseAmountBase,
      purchasePaidBase,
      projectedMarginBase,
      projectedMarginPct,
      realizedCashMarginBase,
    };
  });

  const filteredDossiers = dossiers.filter((d) => {
    return (
      d.sale.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.sale.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.sale.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.linkedPurchases.some((p) => p.partnerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Global Totals
  const totalSalesAll = dossiers.reduce((s, d) => s + d.saleAmountBase, 0);
  const totalCostAll = dossiers.reduce((s, d) => s + d.purchaseAmountBase, 0);
  const totalProjectedProfit = totalSalesAll - totalCostAll;
  const overallMarginPct = totalSalesAll > 0 ? (totalProjectedProfit / totalSalesAll) * 100 : 0;
  const totalRealizedCashMargin = dossiers.reduce((s, d) => s + d.realizedCashMarginBase, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl font-extrabold text-white">Deal Profitability & Margin Analysis</h1>
        </div>
        <p className="text-slate-400 text-sm mt-0.5">
          Automatic reconciliation of Client Sales vs Factory Purchases to calculate expected and realized cash margins.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Consolidated Revenue</span>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {formatCurrency(totalSalesAll, baseCurr)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">All customer sales</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Factory Purchasing Cost</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
            {formatCurrency(totalCostAll, baseCurr)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Suppliers & subcontractors</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Overall Gross Margin</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {formatCurrency(totalProjectedProfit, baseCurr)}
          </div>
          <span className="text-xs font-semibold text-emerald-300 mt-1 block">
            Margin Rate : {overallMarginPct.toFixed(1)}%
          </span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Net Cash Margin Realized</span>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-2">
            {formatCurrency(totalRealizedCashMargin, baseCurr)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Client Received - Factory Paid</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by deal or partner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Dossiers Grid */}
      <div className="space-y-4">
        {filteredDossiers.map((d) => {
          return (
            <div
              key={d.sale.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-400" />
                    <span className="font-mono font-extrabold text-base text-white">{d.sale.reference}</span>
                    <span className="text-xs text-slate-400">• Customer: <strong className="text-slate-200">{d.sale.partnerName}</strong></span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{d.sale.title}</p>
                </div>

                {/* Margin Badge */}
                <div className="flex items-center gap-3">
                  <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Expected Margin</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(d.projectedMarginBase, baseCurr)} ({d.projectedMarginPct.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cash Margin Realized</span>
                    <span className={`font-mono font-bold text-sm ${d.realizedCashMarginBase >= 0 ? "text-blue-400" : "text-amber-400"}`}>
                      {formatCurrency(d.realizedCashMarginBase, baseCurr)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial comparison row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                {/* Client Side */}
                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between items-center text-emerald-400 font-bold mb-2">
                    <span className="flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> Customer Sale :</span>
                    <span className="font-mono">{formatCurrency(d.sale.totalAmount, d.sale.currency)}</span>
                  </div>
                  <div className="space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>Deposits Collected :</span>
                      <span className="font-mono text-emerald-300">{formatCurrency(d.sale.totalPaid, d.sale.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Balance Outstanding :</span>
                      <span className="font-mono text-amber-300">{formatCurrency(d.sale.balanceDue, d.sale.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Supplier Side */}
                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between items-center text-rose-400 font-bold mb-2">
                    <span className="flex items-center gap-1"><ArrowDownLeft className="w-3.5 h-3.5" /> Linked Factory Orders :</span>
                    <span className="font-mono">
                      {d.linkedPurchases.length === 0 ? "No linked PO rattached" : formatCurrency(d.purchaseAmountBase, baseCurr)}
                    </span>
                  </div>

                  {d.linkedPurchases.length === 0 ? (
                    <p className="text-slate-500 italic text-[11px]">
                      To calculate accurate profit margin, link a supplier purchase order to this invoice ({d.sale.reference}).
                    </p>
                  ) : (
                    <div className="space-y-1 text-slate-400">
                      {d.linkedPurchases.map((p) => (
                        <div key={p.id} className="flex justify-between text-[11px]">
                          <span>{p.reference} ({p.partnerName}) :</span>
                          <span className="font-mono text-slate-200">{formatCurrency(p.totalAmount, p.currency)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-1 border-t border-slate-800">
                        <span>Factory Deposits Paid :</span>
                        <span className="font-mono text-rose-300">{formatCurrency(d.purchasePaidBase, baseCurr)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
