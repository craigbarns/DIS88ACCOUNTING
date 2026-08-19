import React from "react";
import { 
  Building2, 
  LayoutDashboard, 
  Receipt, 
  ShoppingBag, 
  ArrowLeftRight, 
  TrendingUp, 
  Users, 
  Settings, 
  PlusCircle, 
  Download, 
  DollarSign, 
  Globe, 
  LogOut 
} from "lucide-react";
import { ActiveTab, CompanyProfile, Currency } from "../types";
import { CURRENCY_SYMBOLS } from "../services/currency";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  company: CompanyProfile;
  setBaseCurrency: (currency: Currency) => void;
  onNewPayment: () => void;
  onNewOrder: (type: "sale" | "purchase") => void;
  onExportExcel: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  company,
  setBaseCurrency,
  onNewPayment,
  onNewOrder,
  onExportExcel,
  onLogout,
}) => {
  const currencies: Currency[] = ["USD", "HKD", "EUR", "CNY", "GBP", "SGD"];

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "sales", label: "Sales & Clients", icon: Receipt },
    { id: "purchases", label: "Purchases & Suppliers", icon: ShoppingBag },
    { id: "expenses", label: "China Offices OPEX (SH/HZ)", icon: Building2 },
    { id: "payments", label: "Payments Journal", icon: ArrowLeftRight },
    { id: "margins", label: "Deal Profitability", icon: TrendingUp },
    { id: "partners", label: "Partners Directory", icon: Users },
    { id: "settings", label: "Settings & FX Rates", icon: Settings },
  ];

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      {/* Top Ticker: Hidden or ultra-compact on mobile */}
      <div className="bg-slate-950/90 px-3 sm:px-4 py-1 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-300 hidden sm:inline">Live FX:</span>
          <div className="flex items-center gap-2 font-mono text-slate-300 text-[11px] truncate">
            <span>1 USD = <strong className="text-blue-400">{company.exchangeRates.HKD} HKD</strong></span>
            <span>•</span>
            <span>1 USD = <strong className="text-emerald-400">{company.exchangeRates.EUR} EUR</strong></span>
            <span>•</span>
            <span>1 USD = <strong className="text-amber-400">{company.exchangeRates.CNY} CNY</strong></span>
          </div>
        </div>

        {/* Currency & Logout */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-slate-400" />
            <select
              value={company.baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value as Currency)}
              className="bg-slate-800 border border-slate-700 text-blue-300 font-bold px-1.5 py-0.5 rounded text-[11px] focus:outline-none"
            >
              {currencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/20 text-white flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-lg text-white tracking-tight">DISTRICT 88</span>
                <span className="bg-blue-950 text-blue-300 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded border border-blue-800">
                  HK
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Multi-Currency Trade & Cash Flow</p>
            </div>
          </div>

          {/* Quick Actions (Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => onNewOrder("sale")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition text-xs font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              + Invoice
            </button>

            <button
              onClick={() => onNewOrder("purchase")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition text-xs font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              + PO
            </button>

            <button
              onClick={onNewPayment}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 transition text-xs font-semibold"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Record Payment
            </button>

            <button
              onClick={onExportExcel}
              title="Export all data to Excel"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Excel</span>
            </button>
          </div>

          {/* Quick Actions (Mobile Header) */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={onNewPayment}
              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm flex items-center gap-1"
            >
              <DollarSign className="w-3 h-3" />
              <span>Pay</span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on mobile because bottom bar is used) */}
        <nav className="hidden md:flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
