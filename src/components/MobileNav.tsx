import React from "react";
import { 
  LayoutDashboard, 
  Receipt, 
  ShoppingBag, 
  ArrowLeftRight, 
  Users, 
  Settings,
  Plus,
  Building
} from "lucide-react";
import { ActiveTab } from "../types";

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onQuickAction: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onQuickAction,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === "dashboard" ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => setActiveTab("sales")}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === "sales" ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Sales</span>
        </button>

        {/* Quick Floating Action Button in Middle */}
        <button
          onClick={onQuickAction}
          className="p-2.5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 -mt-4 border-2 border-slate-950 active:scale-95 transition"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === "expenses" ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">OPEX</span>
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === "payments" ? "text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Cash</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            activeTab === "settings" ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Settings</span>
        </button>
      </div>
    </div>
  );
};
