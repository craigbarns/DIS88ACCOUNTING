import React, { useState } from "react";
import { 
  ShoppingBag, 
  PlusCircle, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Trash2, 
  Edit3,
  Factory
} from "lucide-react";
import { OrderInvoice, Partner, CompanyProfile, PaymentStatus } from "../types";
import { formatCurrency, formatDate } from "../services/currency";
import { generateOrderPDF } from "../services/export";

interface PurchasesManagerProps {
  orders: OrderInvoice[];
  partners: Partner[];
  company: CompanyProfile;
  onNewOrder: () => void;
  onEditOrder: (order: OrderInvoice) => void;
  onDeleteOrder: (id: string) => void;
  onRecordPayment: (order: OrderInvoice, installmentId?: string) => void;
}

export const PurchasesManager: React.FC<PurchasesManagerProps> = ({
  orders,
  partners,
  company,
  onNewOrder,
  onEditOrder,
  onDeleteOrder,
  onRecordPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const purchases = orders.filter((o) => o.type === "purchase");

  const filteredPurchases = purchases.filter((order) => {
    const matchesSearch =
      order.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesCurrency = currencyFilter === "all" || order.currency === currencyFilter;

    return matchesSearch && matchesStatus && matchesCurrency;
  });

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-semibold">✓ Paid in Full</span>;
      case "partially_paid":
        return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-full text-xs font-semibold">⚡ Deposit Sent</span>;
      case "pending":
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-semibold">⏳ Awaiting Payment</span>;
      case "overdue":
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-full text-xs font-semibold">⚠ Overdue</span>;
      default:
        return <span className="bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full text-xs font-semibold">Draft</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white">Purchases & Suppliers</h1>
          </div>
          <p className="text-slate-400 text-sm mt-0.5">
            Track factory purchase orders, production deposits, QC inspection balances, and shipments.
          </p>
        </div>

        <button
          onClick={onNewOrder}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 transition text-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          + New Purchase Order
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by PO reference, supplier, or batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" /> Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Awaiting Deposit</option>
            <option value="partially_paid">Deposit Sent (Partial)</option>
            <option value="paid">Paid in Full</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Currencies</option>
            <option value="USD">USD ($)</option>
            <option value="CNY">CNY / RMB (¥)</option>
            <option value="HKD">HKD (HK$)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>

      {/* Purchases List */}
      {filteredPurchases.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No purchase orders found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Create a new factory purchase order or modify your filter settings.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPurchases.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const partner = partners.find((p) => p.id === order.partnerId);
            const paidPct = order.totalAmount > 0 ? (order.totalPaid / order.totalAmount) * 100 : 0;

            return (
              <div
                key={order.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-1">
                      <ShoppingBag className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono font-bold text-lg text-white">{order.reference}</span>
                        {getStatusBadge(order.status)}
                        <span className="text-xs text-slate-400 font-medium">
                          Date: {formatDate(order.date)} • Due: {formatDate(order.dueDate)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <Factory className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-bold text-slate-200">{order.partnerName}</span>
                        {order.linkedOrderReference && (
                          <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                            Sales Invoice: {order.linkedOrderReference}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">{order.title}</p>
                    </div>
                  </div>

                  {/* Middle: Amount & Progress */}
                  <div className="bg-slate-950/60 p-3 sm:p-3.5 rounded-xl border border-slate-800/80 w-full lg:min-w-[280px] lg:w-auto">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-400">Total Order :</span>
                      <span className="font-mono font-extrabold text-base text-white">
                        {formatCurrency(order.totalAmount, order.currency)}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 my-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-rose-600 to-rose-400 h-2 rounded-full transition-all"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] sm:text-xs font-mono">
                      <span className="text-rose-400">Paid: {formatCurrency(order.totalPaid, order.currency)} ({paidPct.toFixed(0)}%)</span>
                      <span className="text-amber-400 font-bold">Due: {formatCurrency(order.balanceDue, order.currency)}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 self-stretch lg:self-center justify-end pt-2 lg:pt-0 border-t border-slate-800/60 lg:border-t-0">
                    {order.balanceDue > 0 && (
                      <button
                        onClick={() => onRecordPayment(order)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition flex items-center gap-1"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Pay
                      </button>
                    )}

                    <button
                      onClick={() => generateOrderPDF(order, partner, company)}
                      title="Download Purchase Order PDF"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    >
                      <Download className="w-4 h-4 text-indigo-400" />
                    </button>

                    <button
                      onClick={() => onEditOrder(order)}
                      title="Edit"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteOrder(order.id)}
                      title="Delete"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-800/80 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Factory Deposit & Settlement Schedule
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {(order.installments || []).map((inst) => {
                          const isPaid = inst.status === "paid";
                          return (
                            <div
                              key={inst.id}
                              className={`p-3 rounded-xl border flex flex-col justify-between ${
                                isPaid
                                  ? "bg-rose-950/20 border-rose-800/50"
                                  : "bg-slate-950/60 border-slate-800"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-xs text-white">{inst.title}</span>
                                {isPaid ? (
                                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">
                                    PAID
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                                    PENDING
                                  </span>
                                )}
                              </div>

                              <div className="mt-2 flex justify-between items-end">
                                <div>
                                  <div className="text-xs text-slate-400">
                                    {isPaid ? `Paid on ${formatDate(inst.paidDate)}` : `Due: ${formatDate(inst.dueDate)}`}
                                  </div>
                                  {inst.reference && (
                                    <div className="text-[10px] text-slate-500">Wire Ref: {inst.reference}</div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className="font-mono font-bold text-sm text-white">
                                    {formatCurrency(inst.amount, order.currency)}
                                  </span>
                                  {!isPaid && (
                                    <button
                                      onClick={() => onRecordPayment(order, inst.id)}
                                      className="block mt-1 text-[11px] bg-rose-600 hover:bg-rose-500 text-white px-2 py-0.5 rounded font-semibold ml-auto"
                                    >
                                      Pay
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Items Table */}
                    {order.items && order.items.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                            <tr>
                              <th className="p-2.5 rounded-l-lg">Component / Production Details</th>
                              <th className="p-2.5 text-center">Quantity</th>
                              <th className="p-2.5 text-right">Unit Cost</th>
                              <th className="p-2.5 text-right rounded-r-lg">Total Cost</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono">
                            {order.items.map((item) => (
                              <tr key={item.id} className="text-slate-300">
                                <td className="p-2.5 font-sans font-medium">{item.description}</td>
                                <td className="p-2.5 text-center">{item.quantity}</td>
                                <td className="p-2.5 text-right">{formatCurrency(item.unitPrice, order.currency)}</td>
                                <td className="p-2.5 text-right font-bold text-white">
                                  {formatCurrency(item.total, order.currency)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
