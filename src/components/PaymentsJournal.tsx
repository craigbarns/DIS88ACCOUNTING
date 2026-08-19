import React, { useState } from "react";
import { 
  ArrowLeftRight, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  PlusCircle, 
  Trash2, 
  Download,
  CreditCard
} from "lucide-react";
import { PaymentEntry, CompanyProfile, PaymentMethod } from "../types";
import { formatCurrency, formatDate } from "../services/currency";

interface PaymentsJournalProps {
  payments: PaymentEntry[];
  company: CompanyProfile;
  onNewPayment: () => void;
  onDeletePayment: (id: string) => void;
  onExportExcel: () => void;
}

export const PaymentsJournal: React.FC<PaymentsJournalProps> = ({
  payments,
  company,
  onNewPayment,
  onDeletePayment,
  onExportExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.orderReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.installmentTitle && p.installmentTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === "all" || p.type === typeFilter;
    const matchesCurrency = currencyFilter === "all" || p.currency === currencyFilter;

    return matchesSearch && matchesType && matchesCurrency;
  });

  const totalInflowBase = filteredPayments
    .filter((p) => p.type === "inflow")
    .reduce((sum, p) => sum + p.convertedAmountBase, 0);

  const totalOutflowBase = filteredPayments
    .filter((p) => p.type === "outflow")
    .reduce((sum, p) => sum + p.convertedAmountBase, 0);

  const netJournalBase = totalInflowBase - totalOutflowBase;

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case "wire_transfer":
        return "Bank Wire (T/T)";
      case "lc":
        return "Letter of Credit (L/C)";
      case "fps_hk":
        return "Hong Kong FPS";
      case "wise":
        return "Wise Business";
      case "check":
        return "Check";
      case "credit_card":
        return "Credit Card";
      case "cash":
        return "Cash";
      default:
        return "Other";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-extrabold text-white">Cash Flow & Payments Journal</h1>
          </div>
          <p className="text-slate-400 text-sm mt-0.5">
            Full audit log and bank reconciliation for all inflows and outflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export Excel
          </button>

          <button
            onClick={onNewPayment}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20 transition text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            + Record Payment
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Client Inflows (+)</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-2">
            +{formatCurrency(totalInflowBase, company.baseCurrency)}
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Supplier Outflows (-)</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-2">
            -{formatCurrency(totalOutflowBase, company.baseCurrency)}
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Selection Balance</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl font-bold font-mono mt-2 ${netJournalBase >= 0 ? "text-blue-400" : "text-amber-400"}`}>
            {formatCurrency(netJournalBase, company.baseCurrency)}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ref, partner, bank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Cash Flows (In/Out)</option>
            <option value="inflow">Client Inflows (+)</option>
            <option value="outflow">Supplier Outflows (-)</option>
          </select>

          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Currencies</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="HKD">HKD (HK$)</option>
            <option value="CNY">CNY (¥)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Flow / Type</th>
                <th className="p-3.5">Partner (Client / Factory)</th>
                <th className="p-3.5">Document Ref / Tranche</th>
                <th className="p-3.5">Bank & Wire Reference</th>
                <th className="p-3.5 text-right">Amount in Currency</th>
                <th className="p-3.5 text-right">Equivalent ({company.baseCurrency})</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500 text-xs">
                    No transactions found for these filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isInflow = p.type === "inflow";
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition text-slate-300">
                      <td className="p-3.5 font-medium whitespace-nowrap text-slate-200">
                        {formatDate(p.paymentDate)}
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          isInflow
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {isInflow ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                          {isInflow ? "Client Inflow" : "Supplier Outflow"}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-white text-xs">{p.partnerName}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-mono font-bold text-blue-400">{p.orderReference}</div>
                        <div className="text-[11px] text-slate-400">{p.installmentTitle || "Direct Payment"}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="text-slate-200">{p.bankAccount}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {getMethodLabel(p.paymentMethod)} • Ref: {p.reference}
                        </div>
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold whitespace-nowrap">
                        <span className={isInflow ? "text-emerald-400" : "text-rose-400"}>
                          {isInflow ? "+" : "-"}{formatCurrency(p.amount, p.currency)}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono font-medium text-slate-400 whitespace-nowrap">
                        {formatCurrency(p.convertedAmountBase, company.baseCurrency)}
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => onDeletePayment(p.id)}
                          title="Delete transaction"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
