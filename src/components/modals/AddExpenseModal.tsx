import React, { useState, useEffect } from "react";
import { 
  X, 
  Building, 
  DollarSign, 
  Calendar, 
  FileText, 
  CreditCard, 
  MapPin, 
  Repeat, 
  Tag, 
  Save, 
  Receipt,
  Store
} from "lucide-react";
import { 
  ExpenseItem, 
  OfficeLocation, 
  ExpenseCategory, 
  Currency, 
  PaymentMethod, 
  CompanyProfile 
} from "../../types";
import { convertCurrency } from "../../services/currency";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit: ExpenseItem | null;
  defaultOffice: OfficeLocation;
  company: CompanyProfile;
  onSaveExpense: (expense: ExpenseItem) => void;
}

export const CATEGORY_LABELS: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  rent_utilities: { label: "Rent & Utilities (房租及水电)", icon: "🏢", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  salaries_social: { label: "Salaries & Social (薪资及社保)", icon: "👥", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  travel_transport: { label: "QC Travel & High-Speed Trains (差旅高铁)", icon: "🚅", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" },
  samples_qc: { label: "Samples Prototyping & Lab Tests (样品及打样)", icon: "🧪", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  meals_entertainment: { label: "Meals & Business Dining (餐饮及招待)", icon: "🍽️", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  office_supplies: { label: "Office Supplies & Hardware (办公用品及设备)", icon: "💻", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
  customs_express: { label: "SF Express & Freight Courier (顺丰及快递)", icon: "📦", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
  marketing_software: { label: "Software & Subscriptions (软件及订阅)", icon: "🌐", color: "bg-sky-500/10 text-sky-400 border-sky-500/30" },
  tax_legal: { label: "Tax, Accounting & Legal (财务代账法务)", icon: "⚖️", color: "bg-rose-500/10 text-rose-400 border-rose-500/30" },
  other: { label: "Miscellaneous (其他杂费)", icon: "📝", color: "bg-slate-500/10 text-slate-400 border-slate-500/30" },
};

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
  defaultOffice,
  company,
  onSaveExpense,
}) => {
  const [office, setOffice] = useState<OfficeLocation>(defaultOffice);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("rent_utilities");
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>("CNY");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("alipay");
  const [bankAccount, setBankAccount] = useState<string>("China Corporate Account");
  const [vendorName, setVendorName] = useState("");
  const [invoiceReceiptNumber, setInvoiceReceiptNumber] = useState("");
  const [status, setStatus] = useState<"paid" | "pending">("paid");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (expenseToEdit) {
      setOffice(expenseToEdit.office);
      setTitle(expenseToEdit.title);
      setCategory(expenseToEdit.category);
      setAmount(expenseToEdit.amount);
      setCurrency(expenseToEdit.currency);
      setDate(expenseToEdit.date);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setBankAccount(expenseToEdit.bankAccount || "");
      setVendorName(expenseToEdit.vendorName || "");
      setInvoiceReceiptNumber(expenseToEdit.invoiceReceiptNumber || "");
      setStatus(expenseToEdit.status);
      setIsRecurring(expenseToEdit.isRecurring || false);
      setRecurringFrequency(expenseToEdit.recurringFrequency || "monthly");
      setNotes(expenseToEdit.notes || "");
    } else {
      setOffice(defaultOffice);
      setTitle("");
      setCategory("rent_utilities");
      setAmount(0);
      setCurrency("CNY");
      setDate(new Date().toISOString().split("T")[0]);
      setPaymentMethod("alipay");
      setBankAccount(defaultOffice === "shanghai" ? "Shanghai Merchant Account (Alipay/Bank)" : "Hangzhou Operations Account");
      setVendorName("");
      setInvoiceReceiptNumber("");
      setStatus("paid");
      setIsRecurring(false);
      setRecurringFrequency("monthly");
      setNotes("");
    }
  }, [expenseToEdit, defaultOffice, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rates = company.exchangeRates;
    const baseCurr = company.baseCurrency;
    const rateToBase = rates[currency] || 1.0;
    const convertedAmountBase = convertCurrency(amount, currency, baseCurr, rates);

    const expenseData: ExpenseItem = {
      id: expenseToEdit ? expenseToEdit.id : `exp-${Date.now()}`,
      office,
      title: title.trim(),
      category,
      amount: Number(amount),
      currency,
      exchangeRateToBase: rateToBase,
      convertedAmountBase,
      date,
      paidDate: status === "paid" ? date : undefined,
      paymentMethod,
      bankAccount,
      vendorName: vendorName.trim(),
      invoiceReceiptNumber: invoiceReceiptNumber.trim(),
      status,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      notes: notes.trim(),
      createdAt: expenseToEdit ? expenseToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveExpense(expenseData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              office === "shanghai"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            }`}>
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {expenseToEdit ? "Edit Office Expense" : "Record Office Expense (支出登记)"}
              </h3>
              <p className="text-xs text-slate-400">
                China Mainland OPEX • {office === "shanghai" ? "Shanghai Office (上海办事处)" : "Hangzhou Office (杭州办事处)"}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Office Location Toggle (Shanghai vs Hangzhou) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              China Office Location (办事处地点)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOffice("shanghai")}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  office === "shanghai"
                    ? "bg-red-950/40 border-red-500 text-white shadow-md shadow-red-500/10"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  office === "shanghai" ? "border-red-400 bg-red-500" : "border-slate-600"
                }`} />
                <div>
                  <div className="font-bold text-sm text-white">Shanghai (上海)</div>
                  <div className="text-[11px] text-slate-400">Jing'an / Commercial & Sales</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOffice("hangzhou")}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  office === "hangzhou"
                    ? "bg-blue-950/40 border-blue-500 text-white shadow-md shadow-blue-500/10"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  office === "hangzhou" ? "border-blue-400 bg-blue-500" : "border-slate-600"
                }`} />
                <div>
                  <div className="font-bold text-sm text-white">Hangzhou (杭州)</div>
                  <div className="text-[11px] text-slate-400">Binjiang / Sourcing & QC Hub</div>
                </div>
              </button>
            </div>
          </div>

          {/* Expense Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Expense Description / Purpose (支出项目说明) *
            </label>
            <input
              type="text"
              placeholder="e.g., Office Rent, High-Speed Train to Ningbo Factory, SF Express Freight..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category & Amount Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category (支出类别)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-blue-500"
              >
                {Object.entries(CATEGORY_LABELS).map(([catKey, info]) => (
                  <option key={catKey} value={catKey}>
                    {info.icon} {info.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Amount & Currency (金额) *
              </label>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="bg-slate-950 border border-slate-700 text-emerald-400 font-bold font-mono rounded-xl px-3 py-2 text-sm"
                >
                  <option value="CNY">CNY (¥)</option>
                  <option value="USD">USD ($)</option>
                  <option value="HKD">HKD (HK$)</option>
                  <option value="EUR">EUR (€)</option>
                </select>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount || ""}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-slate-950 border border-slate-700 text-white font-mono font-bold text-base rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date, Payment Method & Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date (日期)</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method (付款方式)</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
              >
                <option value="alipay">Alipay (支付宝企业/个人)</option>
                <option value="wechat_pay">WeChat Pay (微信支付)</option>
                <option value="wire_transfer">China Bank Transfer (国内网银对公/对私)</option>
                <option value="cash">Petty Cash (备用金/现金)</option>
                <option value="credit_card">Corporate Card (公司信用卡)</option>
                <option value="wise">Wise Business Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vendor / Payee (收款方/供应商)</label>
              <input
                type="text"
                placeholder="e.g. Landlord, China Railway, SF Express..."
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          {/* Fapiao / Invoice Receipt Ref & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fapiao / Receipt No. (发票/收据单号)
              </label>
              <input
                type="text"
                placeholder="e.g., FP-2026-SH-08992"
                value={invoiceReceiptNumber}
                onChange={(e) => setInvoiceReceiptNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Settlement Account / Card (扣款账户)
              </label>
              <input
                type="text"
                placeholder="e.g., CMB China Merchants Bank / ICBC"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          {/* Recurring & Status */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-semibold">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span>Recurring Fixed Expense (每月固定支出: 如房租/网费/保洁)</span>
            </label>

            {isRecurring && (
              <select
                value={recurringFrequency}
                onChange={(e) => setRecurringFrequency(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 text-blue-300 font-semibold rounded-lg px-2.5 py-1 text-xs"
              >
                <option value="monthly">Monthly (按月)</option>
                <option value="quarterly">Quarterly (按季)</option>
                <option value="yearly">Yearly (按年)</option>
              </select>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Remarks (备注)</label>
            <textarea
              rows={2}
              placeholder="Additional internal details, project codes or tax reimbursement notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>{expenseToEdit ? "Update Office Expense" : "Save Office Expense (保存支出)"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
