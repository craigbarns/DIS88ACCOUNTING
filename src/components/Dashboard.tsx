import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Calendar, 
  Layers, 
  ChevronRight,
  Mail,
  FileCheck
} from "lucide-react";
import { CompanyProfile, OrderInvoice, PaymentEntry, Currency } from "../types";
import { formatCurrency, convertCurrency, formatDate } from "../services/currency";
import { FinancialCharts } from "./FinancialCharts";

interface DashboardProps {
  company: CompanyProfile;
  orders: OrderInvoice[];
  payments: PaymentEntry[];
  onOpenOrder: (order: OrderInvoice) => void;
  onPayInstallment: (order: OrderInvoice, installmentId: string) => void;
  onSendEmailReminder: (order: OrderInvoice) => void;
  onNavigateTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  company,
  orders,
  payments,
  onOpenOrder,
  onPayInstallment,
  onSendEmailReminder,
  onNavigateTab,
}) => {
  const baseCurr = company.baseCurrency;
  const rates = company.exchangeRates;

  // Aggregate Sales
  const salesOrders = orders.filter((o) => o.type === "sale");
  const totalSalesBase = salesOrders.reduce((sum, o) => {
    return sum + convertCurrency(o.totalAmount, o.currency, baseCurr, rates);
  }, 0);

  const totalSalesPaidBase = salesOrders.reduce((sum, o) => {
    return sum + convertCurrency(o.totalPaid, o.currency, baseCurr, rates);
  }, 0);

  const totalSalesPendingBase = salesOrders.reduce((sum, o) => {
    return sum + convertCurrency(o.balanceDue, o.currency, baseCurr, rates);
  }, 0);

  // Aggregate Purchases
  const purchaseOrders = orders.filter((o) => o.type === "purchase");
  const totalPurchasesBase = purchaseOrders.reduce((sum, o) => {
    return sum + convertCurrency(o.totalAmount, o.currency, baseCurr, rates);
  }, 0);

  const totalPurchasesPaidBase = purchaseOrders.reduce((sum, o) => {
    return sum + convertCurrency(o.totalPaid, o.currency, baseCurr, rates);
  }, 0);

  const totalPurchasesPendingBase = purchaseOrders.reduce((sum, o) => {
    return sum + convertCurrency(o.balanceDue, o.currency, baseCurr, rates);
  }, 0);

  // Net Cash Balance & Profit
  const netCashFlowBase = totalSalesPaidBase - totalPurchasesPaidBase;
  const projectedGrossMarginBase = totalSalesBase - totalPurchasesBase;
  const marginPercentage = totalSalesBase > 0 ? (projectedGrossMarginBase / totalSalesBase) * 100 : 0;

  // Breakdown by Currency
  const currencies: Currency[] = ["USD", "HKD", "EUR", "CNY"];
  const currencyStats = currencies.map((curr) => {
    const salesInCurr = salesOrders.filter((o) => o.currency === curr);
    const purchasesInCurr = purchaseOrders.filter((o) => o.currency === curr);

    const totalSales = salesInCurr.reduce((s, o) => s + o.totalAmount, 0);
    const paidSales = salesInCurr.reduce((s, o) => s + o.totalPaid, 0);
    const dueSales = salesInCurr.reduce((s, o) => s + o.balanceDue, 0);

    const totalPurchases = purchasesInCurr.reduce((s, o) => s + o.totalAmount, 0);
    const paidPurchases = purchasesInCurr.reduce((s, o) => s + o.totalPaid, 0);
    const duePurchases = purchasesInCurr.reduce((s, o) => s + o.balanceDue, 0);

    return {
      currency: curr,
      totalSales,
      paidSales,
      dueSales,
      totalPurchases,
      paidPurchases,
      duePurchases,
    };
  });

  // Find upcoming & overdue installments
  const now = new Date();

  const pendingInstallments: {
    order: OrderInvoice;
    inst: any;
    isOverdue: boolean;
    daysDiff: number;
  }[] = [];

  orders.forEach((o) => {
    (o.installments || []).forEach((inst) => {
      if (inst.status === "pending") {
        const dueDate = new Date(inst.dueDate);
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isOverdue = diffDays < 0;

        pendingInstallments.push({
          order: o,
          inst,
          isOverdue,
          daysDiff: diffDays,
        });
      }
    });
  });

  pendingInstallments.sort((a, b) => a.daysDiff - b.daysDiff);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/60 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-800/60">
                DISTRICT 88 LTD Financial Hub
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400">Hong Kong</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-white mt-1">
              Multi-Currency Cash Flow & Payment Tracker
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Real-time monitoring of client receivables, factory deposits, and deal profit margins.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3">
            <div className="bg-slate-900/80 border border-slate-700/80 p-2.5 sm:px-4 sm:py-2.5 rounded-xl text-left sm:text-right">
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">Net Realized Cash</span>
              <span className={`text-sm sm:text-lg font-bold font-mono ${netCashFlowBase >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {formatCurrency(netCashFlowBase, baseCurr)}
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-700/80 p-2.5 sm:px-4 sm:py-2.5 rounded-xl text-left sm:text-right">
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">Gross Margin</span>
              <span className="text-sm sm:text-lg font-bold font-mono text-blue-400">
                {marginPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* KPI 1: SALES */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Client Sales</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-base sm:text-2xl font-bold font-mono text-white truncate">
              {formatCurrency(totalSalesBase, baseCurr)}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-800/80 gap-0.5">
              <span className="text-emerald-400 font-medium">
                Paid: {formatCurrency(totalSalesPaidBase, baseCurr)}
              </span>
              <span className="text-amber-400 font-medium">
                Due: {formatCurrency(totalSalesPendingBase, baseCurr)}
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1 sm:h-1.5 mt-2 sm:mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-1 sm:h-1.5 rounded-full transition-all"
              style={{ width: `${totalSalesBase > 0 ? (totalSalesPaidBase / totalSalesBase) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* KPI 2: PURCHASES */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Supplier Purchases</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-base sm:text-2xl font-bold font-mono text-white truncate">
              {formatCurrency(totalPurchasesBase, baseCurr)}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-800/80 gap-0.5">
              <span className="text-rose-400 font-medium">
                Paid: {formatCurrency(totalPurchasesPaidBase, baseCurr)}
              </span>
              <span className="text-amber-400 font-medium">
                Due: {formatCurrency(totalPurchasesPendingBase, baseCurr)}
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1 sm:h-1.5 mt-2 sm:mt-3 overflow-hidden">
            <div
              className="bg-rose-500 h-1 sm:h-1.5 rounded-full transition-all"
              style={{ width: `${totalPurchasesBase > 0 ? (totalPurchasesPaidBase / totalPurchasesBase) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* KPI 3: RECEIVABLES */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Receivables</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-base sm:text-2xl font-bold font-mono text-amber-400 truncate">
              {formatCurrency(totalSalesPendingBase, baseCurr)}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-800/80 line-clamp-1">
              Outstanding client balances.
            </p>
          </div>
        </div>

        {/* KPI 4: BANK ACCOUNTS */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">HK Bank Accounts</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xs font-semibold text-white truncate">ICBC (ASIA)</div>
            <div className="text-[10px] sm:text-xs text-slate-400 space-y-0.5 mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-slate-800/80">
              {company.bankAccounts.slice(0, 2).map((bank) => {
                const inflows = payments
                  .filter((p) => p.type === "inflow" && p.currency === bank.currency)
                  .reduce((sum, p) => sum + p.amount, 0);
                const outflows = payments
                  .filter((p) => p.type === "outflow" && p.currency === bank.currency)
                  .reduce((sum, p) => sum + p.amount, 0);
                const balance = inflows - outflows;

                return (
                  <div key={bank.id} className="flex justify-between">
                    <span>{bank.bankName.includes("HKD") ? "HKD :" : "USD :"}</span>
                    <span className={`font-mono font-bold ${balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {formatCurrency(balance, bank.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <FinancialCharts orders={orders} payments={payments} company={company} />

      {/* Multi-Currency Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Multi-Currency Native Breakdown</h2>
          </div>
          <span className="text-xs text-slate-400">Tracking in original transaction currencies</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currencyStats.map((stat) => (
            <div
              key={stat.currency}
              className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 hover:border-blue-500/40 transition"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-base text-white">{stat.currency}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300">
                  {stat.currency === "USD" ? "1.00 USD" : `1 USD = ${rates[stat.currency]} ${stat.currency}`}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Total Sales :</span>
                  <span className="font-mono font-bold text-slate-200">{formatCurrency(stat.totalSales, stat.currency)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-emerald-400">Received: {formatCurrency(stat.paidSales, stat.currency)}</span>
                  <span className="text-amber-400">Due: {formatCurrency(stat.dueSales, stat.currency)}</span>
                </div>

                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400 block">Total Purchases :</span>
                  <span className="font-mono font-bold text-slate-200">{formatCurrency(stat.totalPurchases, stat.currency)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-rose-400">Paid: {formatCurrency(stat.paidPurchases, stat.currency)}</span>
                  <span className="text-amber-400">Due: {formatCurrency(stat.duePurchases, stat.currency)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Installments Due & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Installments Schedule */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Upcoming & Overdue Installments Schedule</h2>
            </div>
            <span className="text-xs bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
              {pendingInstallments.length} pending
            </span>
          </div>

          {pendingInstallments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              All deposits and balances are fully up to date!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingInstallments.slice(0, 6).map(({ order, inst, isOverdue, daysDiff }) => (
                <div
                  key={inst.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    isOverdue
                      ? "bg-rose-950/20 border-rose-800/60"
                      : daysDiff <= 7
                      ? "bg-amber-950/20 border-amber-800/60"
                      : "bg-slate-950/50 border-slate-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-0.5 ${order.type === "sale" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                      {order.type === "sale" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{order.reference}</span>
                        <span className="text-xs text-slate-400">• {order.partnerName}</span>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          order.type === "sale" ? "bg-emerald-900/60 text-emerald-300" : "bg-indigo-900/60 text-indigo-300"
                        }`}>
                          {order.type === "sale" ? "Customer" : "Supplier"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 font-medium">{inst.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>Due date: <strong className="text-slate-200">{formatDate(inst.dueDate)}</strong></span>
                        {isOverdue ? (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Overdue by {Math.abs(daysDiff)} days
                          </span>
                        ) : (
                          <span className="text-amber-400">Due in {daysDiff} days</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <span className="font-mono font-bold text-base text-white mr-2">
                      {formatCurrency(inst.amount, order.currency)}
                    </span>

                    {order.type === "sale" && (
                      <button
                        onClick={() => onSendEmailReminder(order)}
                        title="Draft email reminder to customer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                    )}

                    <button
                      onClick={() => onPayInstallment(order, inst.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        order.type === "sale"
                          ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                          : "bg-rose-600 text-white hover:bg-rose-500 shadow-sm"
                      }`}
                    >
                      {order.type === "sale" ? "Collect" : "Pay"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Transactions */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Recent Transactions</h2>
            <button
              onClick={() => onNavigateTab("payments")}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {payments.slice(0, 6).map((pay) => (
              <div
                key={pay.id}
                className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${pay.type === "inflow" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                    {pay.type === "inflow" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{pay.partnerName}</span>
                    <span className="text-[11px] text-slate-400">{pay.orderReference} • {formatDate(pay.paymentDate)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-mono font-bold block ${pay.type === "inflow" ? "text-emerald-400" : "text-rose-400"}`}>
                    {pay.type === "inflow" ? "+" : "-"}{formatCurrency(pay.amount, pay.currency)}
                  </span>
                  <span className="text-[10px] text-slate-400">{pay.bankAccount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
