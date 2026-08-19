import React, { useState, useEffect } from "react";
import { 
  Building2, 
  DollarSign, 
  CreditCard, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Save, 
  Trash2, 
  CheckCircle2, 
  Sparkles,
  Server,
  Activity,
  ShieldCheck
} from "lucide-react";
import { CompanyProfile, Currency } from "../types";
import { 
  exportBackupJSON, 
  importBackupJSON, 
  loadDemoDataset, 
  clearWorkspace 
} from "../services/storage";
import { fetchLiveExchangeRates } from "../services/currency";

interface SettingsManagerProps {
  company: CompanyProfile;
  onUpdateCompany: (company: CompanyProfile) => void;
  onReloadAllData: () => void;
  onLogout?: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  company,
  onUpdateCompany,
  onReloadAllData,
  onLogout,
}) => {
  const [formData, setFormData] = useState<CompanyProfile>(company);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [ratesNotice, setRatesNotice] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{
    status: string;
    engine: string;
    partnerCount: number;
    orderCount: number;
    paymentCount: number;
    lastUpdated?: string;
  } | null>(null);

  // Poll database status
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((data) => setDbStatus(data))
      .catch(() => setDbStatus(null));
  }, []);

  const handleFetchLiveRates = async () => {
    setIsFetchingRates(true);
    setRatesNotice("Fetching live interbank exchange rates from market APIs...");
    const result = await fetchLiveExchangeRates();
    setIsFetchingRates(false);

    if (result && result.rates) {
      const updatedProfile = {
        ...formData,
        exchangeRates: result.rates,
      };
      setFormData(updatedProfile);
      onUpdateCompany(updatedProfile);
      setRatesNotice(`✓ Live FX Rates synchronized successfully! (Updated: ${result.lastUpdated})`);
      setTimeout(() => setRatesNotice(null), 5000);
    } else {
      setRatesNotice("❌ Unable to reach exchange rate provider. Keeping current rates.");
      setTimeout(() => setRatesNotice(null), 4000);
    }
  };

  const handleFieldChange = (field: keyof CompanyProfile, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRateChange = (curr: Currency, rate: number) => {
    setFormData({
      ...formData,
      exchangeRates: {
        ...formData.exchangeRates,
        [curr]: rate,
      },
    });
  };

  const handleBankFieldChange = (index: number, field: string, value: any) => {
    const updated = [...formData.bankAccounts];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, bankAccounts: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompany(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formData.name.replace(/\s+/g, "_")}_Backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJSON(content);
        if (success) {
          setImportStatus("✓ Data successfully restored!");
          onReloadAllData();
        } else {
          setImportStatus("❌ Error: Invalid JSON backup file.");
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadDemo = () => {
    if (window.confirm("Load sample demo dataset (DISTRICT 88 sample orders, partners, and payments)?")) {
      loadDemoDataset();
      onReloadAllData();
      setImportStatus("✓ Sample demo dataset loaded!");
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Clear all data to start completely fresh with an empty workspace (0 invoices, 0 partners)?")) {
      clearWorkspace();
      onReloadAllData();
      setImportStatus("✓ Workspace cleared. Ready for your data!");
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Company & System Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Configure DISTRICT 88 LTD Hong Kong business details, live FX rates, and bank accounts.
        </p>
      </div>

      {/* Live Database Status Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Cloud Database & Server Connection</h3>
              <p className="text-xs text-slate-400">Real-time persistence across Mac, iPhone, and team devices</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {dbStatus ? "ONLINE & SYNCHRONIZED" : "LOCAL CACHE ACTIVE"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 pt-1 text-xs">
          <div>
            <span className="text-slate-500 block">Database Engine:</span>
            <span className="font-bold text-white font-mono">
              {dbStatus?.engine || "Railway PostgreSQL"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Invoices / Orders:</span>
            <span className="font-bold text-emerald-400 font-mono">
              {dbStatus?.orderCount ?? 0} records
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Partners / Clients:</span>
            <span className="font-bold text-blue-400 font-mono">
              {dbStatus?.partnerCount ?? 0} contacts
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Recorded Payments:</span>
            <span className="font-bold text-amber-400 font-mono">
              {dbStatus?.paymentCount ?? 0} transactions
            </span>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-300 text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Settings saved and synchronized successfully!
        </div>
      )}

      {importStatus && (
        <div className="p-4 bg-blue-950/60 border border-blue-800 rounded-2xl text-xs text-blue-300 font-semibold animate-in fade-in">
          {importStatus}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Company Profile */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Registered Hong Kong Entity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">HK Business Registration (BR No.)</label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => handleFieldChange("registrationNumber", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-200 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Address (Star House)</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleFieldChange("address", e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City / District</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleFieldChange("city", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleFieldChange("country", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Exchange Rates */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm sm:text-base font-bold text-white">Live Exchange Rates Grid (Reference: 1 USD)</h2>
            </div>
            
            <button
              type="button"
              onClick={handleFetchLiveRates}
              disabled={isFetchingRates}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition shadow-sm self-start sm:self-auto active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingRates ? "animate-spin text-emerald-400" : "text-emerald-400"}`} />
              <span>{isFetchingRates ? "Updating Rates..." : "⚡ Sync Live Market Rates"}</span>
            </button>
          </div>

          {ratesNotice && (
            <div className="p-3 bg-blue-950/60 border border-blue-800 rounded-xl text-xs text-blue-300 font-semibold animate-in fade-in">
              {ratesNotice}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-blue-400 mb-1">1 USD = ? HKD (Hong Kong)</label>
              <input
                type="number"
                step="0.001"
                value={formData.exchangeRates.HKD}
                onChange={(e) => handleRateChange("HKD", parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">1 USD = ? EUR (Euro)</label>
              <input
                type="number"
                step="0.001"
                value={formData.exchangeRates.EUR}
                onChange={(e) => handleRateChange("EUR", parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">1 USD = ? CNY (Yuan RMB)</label>
              <input
                type="number"
                step="0.001"
                value={formData.exchangeRates.CNY}
                onChange={(e) => handleRateChange("CNY", parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-400 mb-1">1 USD = ? GBP (Pound)</label>
              <input
                type="number"
                step="0.001"
                value={formData.exchangeRates.GBP}
                onChange={(e) => handleRateChange("GBP", parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Bank Accounts */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Bank Accounts & Wire Instructions</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.bankAccounts.map((bank, index) => (
              <div key={bank.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center font-bold text-sm text-white">
                  <span>{bank.bankName}</span>
                  <span className="text-xs bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                    {bank.currency}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400">Account Number</label>
                  <input
                    type="text"
                    value={bank.accountNumber}
                    onChange={(e) => handleBankFieldChange(index, "accountNumber", e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400">SWIFT / BIC Code</label>
                  <input
                    type="text"
                    value={bank.swiftBic}
                    onChange={(e) => handleBankFieldChange(index, "swiftBic", e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Configuration
        </button>
      </form>

      {/* Section 4: Backup, Restore & Workspace Data Management */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Database className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Data Backup & Workspace Management</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleDownloadBackup}
            className="p-4 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-white transition"
          >
            <Download className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">Download JSON</span>
            <span className="text-[10px] text-slate-500 text-center">Export offline backup file</span>
          </button>

          <label className="p-4 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-white cursor-pointer transition">
            <Upload className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold">Import JSON</span>
            <span className="text-[10px] text-slate-500 text-center">Restore from backup</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={handleClearAll}
            className="p-4 bg-slate-950/60 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-800/80 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-rose-400 transition"
          >
            <Trash2 className="w-5 h-5 text-rose-400" />
            <span className="text-xs font-bold text-rose-400">Clear Workspace</span>
            <span className="text-[10px] text-slate-500 text-center">Reset to empty database (0 records)</span>
          </button>

          <button
            onClick={handleLoadDemo}
            className="p-4 bg-slate-950/60 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-800/80 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-indigo-400 transition"
          >
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-400">Load Sample Demo</span>
            <span className="text-[10px] text-slate-500 text-center">Load test orders & clients</span>
          </button>
        </div>
      </div>

      {/* Section 5: Session & Security */}
      {onLogout && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Active Administrator Session</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as <strong className="text-blue-400">Admin</strong> • Lock access when leaving this device.
            </p>
          </div>

          <button
            onClick={onLogout}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Sign Out & Lock Workspace</span>
          </button>
        </div>
      )}
    </div>
  );
};
