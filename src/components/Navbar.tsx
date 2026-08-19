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
    { id: "payments", label: "Payments Journal", icon: ArrowLeftRight },
    { id: "margins", label: "Deal Profitability", icon: TrendingUp },
    { id: "partners", label: "Partners Directory", icon: Users },
    { id: "settings", label: "Settings & FX Rates", icon: Settings },
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      {/* Top Ticker: Live Exchange Rates & Base Currency */}
      <div className="bg-slate-950/80 px-4 py-1.5 border-b border-slate-800/80 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-300">Live FX Rates:</span>
          <div className="hidden sm:flex items-center gap-3 font-mono text-slate-300">
            <span>1 USD = <strong className="text-blue-400">7.82 HKD</strong></span>
            <span>•</span>
            <span>1 USD = <strong className="text-emerald-400">0.92 EUR</strong></span>
            <span>•</span>
            <span>1 USD = <strong className="text-amber-400">7.24 CNY</strong></span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Cloud DB Active
          </span>
        </div>

        {/* Base Currency Toggle */}
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 hidden sm:inline">Display Currency:</span>
          <select
            value={company.baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value as Currency)}
            className="bg-slate-800 border border-slate-700 text-blue-300 font-bold px-2 py-0.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {currencies.map((curr) => (
              <option key={curr} value={curr}>
                {curr} ({CURRENCY_SYMBOLS[curr]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 text-white flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">{company.name}</span>
                <span className="bg-blue-950 text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-800">
                  HONG KONG
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Multi-Currency • Down Payments • Clients & Suppliers</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNewOrder("sale")}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition text-xs font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              + Sales Invoice
            </button>

            <button
              onClick={() => onNewOrder("purchase")}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition text-xs font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              + Purchase Order
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
              <span className="hidden sm:inline">Excel</span>
            </button>

            {/* Prominent Sign Out Button */}
            <button
              onClick={onLogout}
              title="Sign Out / Lock Session"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 hover:border-rose-700 transition text-xs font-bold shadow-sm ml-1"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/60">
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
