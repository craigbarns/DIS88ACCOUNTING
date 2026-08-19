import React, { useState } from "react";
import { 
  Building, 
  PlusCircle, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  FileText, 
  Trash2, 
  Edit3, 
  Repeat, 
  Tag, 
  TrendingDown, 
  Layers, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Store,
  ChevronDown
} from "lucide-react";
import { 
  ExpenseItem, 
  OfficeLocation, 
  ExpenseCategory, 
  CompanyProfile, 
  Currency 
} from "../types";
import { formatCurrency, formatDate, convertCurrency } from "../services/currency";
import { CATEGORY_LABELS } from "./modals/AddExpenseModal";
import * as XLSX from "xlsx";

interface ExpensesManagerProps {
  expenses: ExpenseItem[];
  company: CompanyProfile;
  onNewExpense: (office?: OfficeLocation) => void;
  onEditExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesManager: React.FC<ExpensesManagerProps> = ({
  expenses,
  company,
  onNewExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [selectedOffice, setSelectedOffice] = useState<"all" | OfficeLocation>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const baseCurr = company.baseCurrency;
  const rates = company.exchangeRates;

  // Filter expenses
  const filteredExpenses = expenses.filter((item) => {
    const matchesOffice = selectedOffice === "all" || item.office === selectedOffice;
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.vendorName && item.vendorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.invoiceReceiptNumber && item.invoiceReceiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMonth = selectedMonth === "all" || item.date.startsWith(selectedMonth);

    return matchesOffice && matchesCat && matchesSearch && matchesMonth;
  });

  // Calculate Metrics
  const totalChinaOpexBase = expenses.reduce((sum, item) => sum + convertCurrency(item.amount, item.currency, baseCurr, rates), 0);
  const totalChinaOpexCNY = expenses.reduce((sum, item) => sum + convertCurrency(item.amount, item.currency, "CNY", rates), 0);

  const shanghaiExpenses = expenses.filter((e) => e.office === "shanghai");
  const totalShanghaiBase = shanghaiExpenses.reduce((sum, item) => sum + convertCurrency(item.amount, item.currency, baseCurr, rates), 0);
  const totalShanghaiCNY = shanghaiExpenses.reduce((sum, item) => sum + convertCurrency(item.amount, item.currency, "CNY", rates), 0);

  const hangzhouExpenses = expenses.filter((e) => e.office === "hangzhou");
  const totalHangzhouBase = hangzhouExpenses.reduce((sum, item) => sum + convertCurrency(item.amount, item.currency, baseCurr, rates), 0);
  const totalHangzhouCNY = hangzhouExpenses.reduce((sum, item) => sum + convertCurrency(item.amount, item.currency, "CNY", rates), 0);

  // Current Month calculation
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthPrefix));
  const currentMonthTotalBase = currentMonthExpenses.reduce((sum, item) => sum + convertCurrency(item.amount, item.currency, baseCurr, rates), 0);
  const currentMonthTotalCNY = currentMonthExpenses.reduce((sum, item) => sum + convertCurrency(item.amount, item.currency, "CNY", rates), 0);

  // Category breakdown for filtered list
  const categoryTotals: Record<string, number> = {};
  filteredExpenses.forEach((item) => {
    const valBase = convertCurrency(item.amount, item.currency, baseCurr, rates);
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + valBase;
  });

  // Export to Excel
  const handleExportExpensesExcel = () => {
    const data = filteredExpenses.map((exp) => ({
      "Office Location": exp.office === "shanghai" ? "Shanghai Office (上海)" : "Hangzhou Office (杭州)",
      "Expense Item": exp.title,
      "Category": CATEGORY_LABELS[exp.category]?.label || exp.category,
      "Amount (Original)": exp.amount,
      "Currency": exp.currency,
      "Amount in USD": Math.round(convertCurrency(exp.amount, exp.currency, "USD", rates) * 100) / 100,
      "Amount in CNY (RMB)": Math.round(convertCurrency(exp.amount, exp.currency, "CNY", rates) * 100) / 100,
      "Date": exp.date,
      "Payment Method": exp.paymentMethod,
      "Vendor / Payee": exp.vendorName || "-",
      "Fapiao / Receipt No": exp.invoiceReceiptNumber || "-",
      "Status": exp.status,
      "Recurring": exp.isRecurring ? `Yes (${exp.recurringFrequency})` : "No",
      "Notes": exp.notes || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "China Office Expenses");
    XLSX.writeFile(wb, `DISTRICT88_China_Office_Expenses_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">China Office Expenses</h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Operational expenses, office leases, staff payroll & QC travel for Shanghai & Hangzhou offices.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportExpensesExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Excel Export</span>
          </button>

          <button
            onClick={() => onNewExpense(selectedOffice === "all" ? "shanghai" : selectedOffice)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/20 transition active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Record Expense</span>
          </button>
        </div>
      </div>

      {/* Office Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setSelectedOffice("all")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            selectedOffice === "all"
              ? "bg-slate-800 text-white shadow-md border border-slate-700"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/40"
          }`}
        >
          <Building className="w-4 h-4 text-blue-400" />
          <span>All China Offices (全部)</span>
        </button>

        <button
          onClick={() => setSelectedOffice("shanghai")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            selectedOffice === "shanghai"
              ? "bg-red-950/60 text-red-300 border border-red-800 shadow-md"
              : "text-slate-400 hover:text-red-300 hover:bg-slate-950/40"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span>Shanghai Office (上海)</span>
        </button>

        <button
          onClick={() => setSelectedOffice("hangzhou")}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            selectedOffice === "hangzhou"
              ? "bg-blue-950/60 text-blue-300 border border-blue-800 shadow-md"
              : "text-slate-400 hover:text-blue-300 hover:bg-slate-950/40"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>Hangzhou Office (杭州)</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total China OPEX */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total China OPEX
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Building className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-base sm:text-2xl font-bold font-mono text-white truncate">
              {formatCurrency(totalChinaOpexCNY, "CNY")}
            </div>
            <div className="text-[10px] sm:text-xs text-blue-400 font-mono font-semibold mt-1">
              ≈ {formatCurrency(totalChinaOpexBase, baseCurr)}
            </div>
          </div>
        </div>

        {/* Current Month Burn */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              This Month Burn
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-base sm:text-2xl font-bold font-mono text-amber-400 truncate">
              {formatCurrency(currentMonthTotalCNY, "CNY")}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-mono mt-1">
              ≈ {formatCurrency(currentMonthTotalBase, baseCurr)}
            </div>
          </div>
        </div>

        {/* Shanghai Office Total */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-red-400 uppercase tracking-wider">
              Shanghai Office
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <span className="text-xs font-bold font-mono">SH</span>
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-base sm:text-2xl font-bold font-mono text-white truncate">
              {formatCurrency(totalShanghaiCNY, "CNY")}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-mono mt-1">
              {shanghaiExpenses.length} records • ≈ {formatCurrency(totalShanghaiBase, baseCurr)}
            </div>
          </div>
        </div>

        {/* Hangzhou Office Total */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Hangzhou Office
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <span className="text-xs font-bold font-mono">HZ</span>
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-base sm:text-2xl font-bold font-mono text-white truncate">
              {formatCurrency(totalHangzhouCNY, "CNY")}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-mono mt-1">
              {hangzhouExpenses.length} records • ≈ {formatCurrency(totalHangzhouBase, baseCurr)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, vendor, Fapiao..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 w-full sm:w-auto"
            >
              <option value="all">All Categories (全部项目)</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.icon} {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center">
          <Building className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm sm:text-base font-semibold text-slate-300">No office expenses recorded</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click "+ Record Expense" to add office rent, QC inspection travel, staff salaries or courier freight.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((exp) => {
            const catInfo = CATEGORY_LABELS[exp.category] || CATEGORY_LABELS.other;

            return (
              <div
                key={exp.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 sm:p-5 transition shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Office Badge & Info */}
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                      exp.office === "shanghai"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    }`}>
                      <span className="font-bold text-xs font-mono">
                        {exp.office === "shanghai" ? "SH" : "HZ"}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-bold text-sm sm:text-base text-white">{exp.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catInfo.color}`}>
                          {catInfo.icon} {catInfo.label.split(" ")[0]}
                        </span>
                        {exp.isRecurring && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-semibold flex items-center gap-1">
                            <Repeat className="w-2.5 h-2.5" />
                            {exp.recurringFrequency}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{formatDate(exp.date)}</span>
                        <span>•</span>
                        <span>{exp.office === "shanghai" ? "Shanghai Office" : "Hangzhou Office"}</span>
                        {exp.vendorName && (
                          <>
                            <span>•</span>
                            <span className="text-slate-300 font-medium">Payee: {exp.vendorName}</span>
                          </>
                        )}
                        {exp.invoiceReceiptNumber && (
                          <>
                            <span>•</span>
                            <span className="text-blue-400 font-mono text-[11px]">Fapiao: {exp.invoiceReceiptNumber}</span>
                          </>
                        )}
                      </div>

                      {exp.notes && (
                        <p className="text-xs text-slate-400 mt-1 bg-slate-950/40 px-2.5 py-1 rounded-lg inline-block">
                          {exp.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-slate-800/60 sm:border-t-0">
                    <div className="text-left sm:text-right">
                      <div className="font-mono font-extrabold text-base sm:text-lg text-white">
                        {formatCurrency(exp.amount, exp.currency)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-400 font-mono">
                        ≈ {formatCurrency(exp.convertedAmountBase, baseCurr)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditExpense(exp)}
                        title="Edit Expense"
                        className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        title="Delete Expense"
                        className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
