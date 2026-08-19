import React, { useState, useEffect } from "react";
import { 
  X, 
  DollarSign, 
  CheckCircle2 
} from "lucide-react";
import confetti from "canvas-confetti";
import { OrderInvoice, CompanyProfile, PaymentMethod } from "../../types";
import { formatCurrency } from "../../services/currency";

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderInvoice[];
  preselectedOrder?: OrderInvoice | null;
  preselectedInstallmentId?: string | null;
  company: CompanyProfile;
  onSavePayment: (
    order: OrderInvoice,
    paymentData: {
      amount: number;
      paymentDate: string;
      paymentMethod: PaymentMethod;
      bankAccount: string;
      reference: string;
      installmentId?: string;
      notes?: string;
    }
  ) => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  orders,
  preselectedOrder,
  preselectedInstallmentId,
  company,
  onSavePayment,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wire_transfer");
  const [bankAccount, setBankAccount] = useState<string>(company.bankAccounts[0]?.bankName || "HSBC Hong Kong (USD Main)");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (preselectedOrder) {
      setSelectedOrderId(preselectedOrder.id);
      if (preselectedInstallmentId) {
        setSelectedInstallmentId(preselectedInstallmentId);
        const inst = preselectedOrder.installments?.find((i) => i.id === preselectedInstallmentId);
        if (inst) {
          setAmount(inst.amount);
          setReference(inst.reference || "WIRE-" + Date.now().toString().slice(-6));
        }
      } else {
        setAmount(preselectedOrder.balanceDue || 0);
        setReference("WIRE-" + Date.now().toString().slice(-6));
      }
    } else if (orders.length > 0) {
      const firstWithBalance = orders.find((o) => o.balanceDue > 0) || orders[0];
      setSelectedOrderId(firstWithBalance.id);
      setAmount(firstWithBalance.balanceDue || 0);
      setReference("WIRE-" + Date.now().toString().slice(-6));
    }
  }, [preselectedOrder, preselectedInstallmentId, orders]);

  if (!isOpen) return null;

  const currentOrder = orders.find((o) => o.id === selectedOrderId);

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    setSelectedInstallmentId("");
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      setAmount(ord.balanceDue || 0);
    }
  };

  const handleInstallmentChange = (instId: string) => {
    setSelectedInstallmentId(instId);
    if (!currentOrder) return;
    if (instId) {
      const inst = currentOrder.installments?.find((i) => i.id === instId);
      if (inst) setAmount(inst.amount);
    } else {
      setAmount(currentOrder.balanceDue || 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder || amount <= 0) return;

    if (currentOrder.type === "sale" && amount >= currentOrder.balanceDue - 0.01) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {}
    }

    onSavePayment(currentOrder, {
      amount: Number(amount),
      paymentDate,
      paymentMethod,
      bankAccount,
      reference,
      installmentId: selectedInstallmentId || undefined,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Record Payment / Down Payment</h3>
              <p className="text-xs text-slate-400">Bank reconciliation & balance update</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Order Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Invoice or Purchase Order
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-blue-500"
              required
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  [{o.type === "sale" ? "CUSTOMER SALE" : "SUPPLIER PURCHASE"}] {o.reference} - {o.partnerName} (Balance: {formatCurrency(o.balanceDue, o.currency)})
                </option>
              ))}
            </select>
          </div>

          {currentOrder && (
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Total: </span>
                <span className="font-bold text-white font-mono">{formatCurrency(currentOrder.totalAmount, currentOrder.currency)}</span>
              </div>
              <div>
                <span className="text-emerald-400">Paid: </span>
                <span className="font-bold font-mono">{formatCurrency(currentOrder.totalPaid, currentOrder.currency)}</span>
              </div>
              <div>
                <span className="text-amber-400 font-bold">Balance: </span>
                <span className="font-bold font-mono text-amber-300">{formatCurrency(currentOrder.balanceDue, currentOrder.currency)}</span>
              </div>
            </div>
          )}

          {/* Linked Installment Tranche */}
          {currentOrder && currentOrder.installments && currentOrder.installments.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Link to Installment / Tranche (Optional)
              </label>
              <select
                value={selectedInstallmentId}
                onChange={(e) => handleInstallmentChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Direct / Custom Balance Payment</option>
                {currentOrder.installments.map((inst) => (
                  <option key={inst.id} value={inst.id} disabled={inst.status === "paid"}>
                    {inst.title} - {formatCurrency(inst.amount, currentOrder.currency)} ({inst.status === "paid" ? "ALREADY PAID" : "PENDING"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Amount Received / Paid ({currentOrder?.currency || "USD"})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold rounded-xl px-3.5 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Value / Settlement Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Payment Method & Bank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="wire_transfer">Bank Wire (T/T)</option>
                <option value="lc">Letter of Credit (L/C)</option>
                <option value="fps_hk">Hong Kong FPS (Instant Transfer)</option>
                <option value="wise">Wise Business</option>
                <option value="credit_card">Credit Card (Stripe/POS)</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bank Account Used</label>
              <select
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
              >
                {company.bankAccounts.map((b) => (
                  <option key={b.id} value={b.bankName + " (" + b.currency + ")"}>
                    {b.bankName} ({b.currency})
                  </option>
                ))}
                <option value="Other Bank / Petty Cash">Other Bank / Petty Cash</option>
              </select>
            </div>
          </div>

          {/* Bank Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Bank / SWIFT / FPS Reference
            </label>
            <input
              type="text"
              placeholder="e.g. TT-HSBC-984021 or FPS-105829144"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white font-mono rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Remarks / Payment Notes</label>
            <input
              type="text"
              placeholder="e.g. 30% Down payment received - Production release authorized"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
