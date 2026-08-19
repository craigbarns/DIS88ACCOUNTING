import React, { useState, useEffect } from "react";
import { 
  X, 
  Receipt, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  Ship, 
  Package, 
  Globe 
} from "lucide-react";
import { OrderInvoice, Partner, Currency, OrderItem, Installment, CompanyProfile, DocumentType } from "../../types";
import { CURRENCY_SYMBOLS } from "../../services/currency";

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "sale" | "purchase";
  orderToEdit?: OrderInvoice | null;
  partners: Partner[];
  existingOrders: OrderInvoice[];
  company: CompanyProfile;
  onSaveOrder: (order: OrderInvoice) => void;
  onOpenNewPartner: (type: "client" | "supplier") => void;
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({
  isOpen,
  onClose,
  type,
  orderToEdit,
  partners,
  existingOrders,
  company,
  onSaveOrder,
  onOpenNewPartner,
}) => {
  const isSale = type === "sale";
  const partnerType = isSale ? "client" : "supplier";
  const availablePartners = partners.filter((p) => p.type === partnerType);

  const [documentType, setDocumentType] = useState<DocumentType>(isSale ? "commercial_invoice" : "purchase_order");
  const [reference, setReference] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [title, setTitle] = useState("");
  const [linkedOrderReference, setLinkedOrderReference] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [notes, setNotes] = useState("");

  // International Trade, Shipping & Customs Specifications
  const [incoterm, setIncoterm] = useState("FOB");
  const [shippingTerms, setShippingTerms] = useState("FOB Hong Kong");
  const [countryOfOrigin, setCountryOfOrigin] = useState("China");
  const [totalCartons, setTotalCartons] = useState("");
  const [netWeight, setNetWeight] = useState("");
  const [grossWeight, setGrossWeight] = useState("");
  const [measurementCbm, setMeasurementCbm] = useState("");
  const [portOfLoading, setPortOfLoading] = useState("Hong Kong Port");
  const [portOfDischarge, setPortOfDischarge] = useState("");

  const [items, setItems] = useState<OrderItem[]>([
    { id: "item-1", description: "", hsCode: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);

  const [installments, setInstallments] = useState<Installment[]>([]);
  const [installmentPreset, setInstallmentPreset] = useState("30_70");

  useEffect(() => {
    if (orderToEdit) {
      setDocumentType(orderToEdit.documentType || (orderToEdit.type === "sale" ? (orderToEdit.reference.startsWith("PI") ? "proforma" : "commercial_invoice") : "purchase_order"));
      setReference(orderToEdit.reference);
      setPartnerId(orderToEdit.partnerId);
      setTitle(orderToEdit.title);
      setLinkedOrderReference(orderToEdit.linkedOrderReference || "");
      setDate(orderToEdit.date);
      setDueDate(orderToEdit.dueDate);
      setCurrency(orderToEdit.currency);
      setIncoterm(orderToEdit.incoterm || "FOB");
      setShippingTerms(orderToEdit.shippingTerms || "FOB Hong Kong");
      setCountryOfOrigin(orderToEdit.countryOfOrigin || "China");
      setTotalCartons(orderToEdit.totalCartons || "");
      setNetWeight(orderToEdit.netWeight || "");
      setGrossWeight(orderToEdit.grossWeight || "");
      setMeasurementCbm(orderToEdit.measurementCbm || "");
      setPortOfLoading(orderToEdit.portOfLoading || "Hong Kong Port");
      setPortOfDischarge(orderToEdit.portOfDischarge || "");
      setNotes(orderToEdit.notes || "");
      setItems(orderToEdit.items && orderToEdit.items.length > 0 ? orderToEdit.items : [{ id: "1", description: orderToEdit.title, hsCode: "", quantity: 1, unitPrice: orderToEdit.totalAmount, total: orderToEdit.totalAmount }]);
      setInstallments(orderToEdit.installments || []);
    } else {
      const defaultDocType: DocumentType = isSale ? "commercial_invoice" : "purchase_order";
      setDocumentType(defaultDocType);
      
      const prefix = isSale ? "INV-2026-" : "PO-2026-";
      const count = existingOrders.filter((o) => o.type === type).length + 1;
      const autoRef = prefix + String(count).padStart(3, "0");
      setReference(autoRef);

      const defaultPartner = availablePartners[0];
      if (defaultPartner) {
        setPartnerId(defaultPartner.id);
        setCurrency(defaultPartner.defaultCurrency || "USD");
      }

      setTitle("");
      setLinkedOrderReference("");
      setDate(new Date().toISOString().split("T")[0]);
      
      const due = new Date();
      due.setDate(due.getDate() + 30);
      setDueDate(due.toISOString().split("T")[0]);

      setIncoterm("FOB");
      setShippingTerms("FOB Hong Kong");
      setCountryOfOrigin("China");
      setTotalCartons("40 CTNS");
      setNetWeight("580 KG");
      setGrossWeight("647 KG");
      setMeasurementCbm("4.11 CBMS");
      setPortOfLoading("Hong Kong Port");
      setPortOfDischarge("");
      
      setItems([{ id: "item-1", description: "", hsCode: "", quantity: 1, unitPrice: 0, total: 0 }]);
      applyPreset("30_70", 0, due.toISOString().split("T")[0]);
    }
  }, [orderToEdit, type, isOpen]);

  // When switching document type between PI and CI
  const handleDocTypeChange = (newType: DocumentType) => {
    setDocumentType(newType);
    if (!orderToEdit) {
      const count = existingOrders.filter((o) => o.type === type).length + 1;
      if (newType === "proforma") {
        setReference(`PI-2026-${String(count).padStart(3, "0")}`);
      } else if (newType === "commercial_invoice") {
        setReference(`INV-2026-${String(count).padStart(3, "0")}`);
      } else {
        setReference(`PO-2026-${String(count).padStart(3, "0")}`);
      }
    }
  };

  const handlePartnerSelect = (pid: string) => {
    setPartnerId(pid);
    const p = partners.find((item) => item.id === pid);
    if (p && p.defaultCurrency) {
      setCurrency(p.defaultCurrency);
    }
    if (p && p.paymentTerms && !orderToEdit) {
      if (p.paymentTerms.toLowerCase().includes("50%")) {
        applyPreset("50_50", totalAmount);
      } else if (p.paymentTerms.toLowerCase().includes("l/c") || p.paymentTerms.toLowerCase().includes("letter of credit")) {
        applyPreset("lc_sight", totalAmount);
      } else if (p.paymentTerms.toLowerCase().includes("100%")) {
        applyPreset("100", totalAmount);
      } else {
        applyPreset("30_70", totalAmount);
      }
    }
  };

  const handleItemChange = (index: number, field: keyof OrderItem, val: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: val };

    if (field === "quantity" || field === "unitPrice") {
      const q = field === "quantity" ? parseFloat(val) || 0 : current.quantity;
      const u = field === "unitPrice" ? parseFloat(val) || 0 : current.unitPrice;
      current.total = Math.round(q * u * 100) / 100;
    }

    updated[index] = current;
    setItems(updated);

    const newTotal = updated.reduce((sum, item) => sum + (item.total || 0), 0);
    recalcInstallments(installmentPreset, newTotal);
  };

  const addItem = () => {
    setItems([...items, { id: `item-${Date.now()}`, description: "", hsCode: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    const newTotal = updated.reduce((sum, item) => sum + (item.total || 0), 0);
    recalcInstallments(installmentPreset, newTotal);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const totalPieces = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const applyPreset = (preset: string, total: number = totalAmount, finalDue: string = dueDate) => {
    setInstallmentPreset(preset);
    recalcInstallments(preset, total, finalDue);
  };

  const recalcInstallments = (preset: string, total: number, finalDue: string = dueDate) => {
    const orderDateObj = date ? new Date(date) : new Date();
    const depositDue = new Date(orderDateObj);
    depositDue.setDate(depositDue.getDate() + 7);
    const depositDueStr = depositDue.toISOString().split("T")[0];

    if (preset === "30_70") {
      setInstallments([
        {
          id: "inst-1",
          title: "30% Deposit on Order Confirmation",
          percentage: 30,
          amount: Math.round(total * 0.3 * 100) / 100,
          dueDate: depositDueStr,
          status: "pending",
        },
        {
          id: "inst-2",
          title: "70% Balance before Bill of Lading (B/L) Release",
          percentage: 70,
          amount: Math.round((total - Math.round(total * 0.3 * 100) / 100) * 100) / 100,
          dueDate: finalDue,
          status: "pending",
        },
      ]);
    } else if (preset === "50_50") {
      setInstallments([
        {
          id: "inst-1",
          title: "50% Down Payment on Order",
          percentage: 50,
          amount: Math.round(total * 0.5 * 100) / 100,
          dueDate: depositDueStr,
          status: "pending",
        },
        {
          id: "inst-2",
          title: "50% Balance upon Delivery",
          percentage: 50,
          amount: Math.round((total - Math.round(total * 0.5 * 100) / 100) * 100) / 100,
          dueDate: finalDue,
          status: "pending",
        },
      ]);
    } else if (preset === "30_40_30") {
      const midDate = new Date(orderDateObj);
      midDate.setDate(midDate.getDate() + 20);
      setInstallments([
        {
          id: "inst-1",
          title: "30% Deposit Kickoff",
          percentage: 30,
          amount: Math.round(total * 0.3 * 100) / 100,
          dueDate: depositDueStr,
          status: "pending",
        },
        {
          id: "inst-2",
          title: "40% QC Factory Inspection",
          percentage: 40,
          amount: Math.round(total * 0.4 * 100) / 100,
          dueDate: midDate.toISOString().split("T")[0],
          status: "pending",
        },
        {
          id: "inst-3",
          title: "30% Balance before Vessel Loading",
          percentage: 30,
          amount: Math.round(total * 0.3 * 100) / 100,
          dueDate: finalDue,
          status: "pending",
        },
      ]);
    } else if (preset === "lc_sight") {
      setInstallments([
        {
          id: "inst-1",
          title: "100% Irrevocable Letter of Credit (L/C at sight)",
          percentage: 100,
          amount: total,
          dueDate: finalDue,
          status: "pending",
        },
      ]);
    } else if (preset === "100") {
      setInstallments([
        {
          id: "inst-1",
          title: "100% Upfront Wire Payment",
          percentage: 100,
          amount: total,
          dueDate: finalDue,
          status: "pending",
        },
      ]);
    }
  };

  const handleInstallmentFieldChange = (index: number, field: string, val: any) => {
    const updated = [...installments];
    updated[index] = { ...updated[index], [field]: val };
    setInstallments(updated);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const partner = partners.find((p) => p.id === partnerId);
    const partnerName = partner ? partner.companyName : "Unknown Partner";

    const totalPaid = orderToEdit ? orderToEdit.totalPaid : 0;
    const balanceDue = Math.max(0, totalAmount - totalPaid);

    let status = orderToEdit ? orderToEdit.status : "pending";
    if (totalPaid >= totalAmount && totalAmount > 0) {
      status = "paid";
    } else if (totalPaid > 0) {
      status = "partially_paid";
    } else {
      status = "pending";
    }

    const orderData: OrderInvoice = {
      id: orderToEdit ? orderToEdit.id : `ord-${Date.now()}`,
      reference,
      type,
      documentType,
      partnerId,
      partnerName,
      title: title || (items[0] ? items[0].description : "International Trade Order"),
      linkedOrderReference: linkedOrderReference || undefined,
      date,
      dueDate,
      currency,
      exchangeRateToBase: company.exchangeRates[currency] || 1.0,
      items,
      subtotal: totalAmount,
      taxRate: 0,
      taxAmount: 0,
      totalAmount,
      totalPaid,
      balanceDue,
      status: status as any,
      installments,
      incoterm,
      countryOfOrigin,
      totalCartons,
      netWeight,
      grossWeight,
      measurementCbm,
      portOfLoading,
      portOfDischarge,
      shippingTerms: `${incoterm} ${portOfLoading || ""}`.trim(),
      notes,
      createdAt: orderToEdit ? orderToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveOrder(orderData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isSale ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
            }`}>
              {isSale ? <Receipt className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {orderToEdit ? "Edit Document" : isSale ? "New Customer Sales Invoice / Proforma" : "New Supplier Purchase Order"}
              </h3>
              <p className="text-xs text-slate-400">
                {isSale ? "Issue commercial invoices, proforma documents & down payment schedules" : "Track factory manufacturing deposits and purchase orders"}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Document Type Selector (For Sales) */}
          {isSale && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-200">Document Classification:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDocTypeChange("proforma")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    documentType === "proforma" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  PROFORMA INVOICE (PI)
                </button>
                <button
                  type="button"
                  onClick={() => handleDocTypeChange("commercial_invoice")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    documentType === "commercial_invoice" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  COMMERCIAL INVOICE (CI)
                </button>
              </div>
            </div>
          )}

          {/* Reference & Partner Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Document Reference</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. PI-2026-001 or INV-2026-001"
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isSale ? "Customer (Client)" : "Supplier / Factory"}
                </label>
                <button
                  type="button"
                  onClick={() => onOpenNewPartner(partnerType)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
                >
                  + Add New {isSale ? "Client" : "Supplier"}
                </button>
              </div>
              <select
                value={partnerId}
                onChange={(e) => handlePartnerSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="" disabled>-- Select {isSale ? "Customer" : "Supplier"} --</option>
                {availablePartners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.companyName} ({p.country} • {p.defaultCurrency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title & Linked Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Order Title / Project Batch</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sweatshirt Production 2026 Batch or Cycling Glasses K3s"
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isSale ? "Linked PO Ref (Optional)" : "Linked Sales Ref (Optional)"}
              </label>
              <input
                type="text"
                value={linkedOrderReference}
                onChange={(e) => setLinkedOrderReference(e.target.value)}
                placeholder={isSale ? "e.g. PO-2026-001" : "e.g. INV-2026-001"}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 font-mono rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dates & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date of Issue</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Final Due / Shipment Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  recalcInstallments(installmentPreset, totalAmount, e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Invoiced Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="HKD">HKD (HK$)</option>
                <option value="CNY">CNY (¥)</option>
                <option value="GBP">GBP (£)</option>
                <option value="SGD">SGD (S$)</option>
              </select>
            </div>
          </div>

          {/* Section: International Shipping, Packing & Customs Specifications */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <Ship className="w-4 h-4" />
              International Trade, Shipping & Customs Specifications
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Incoterm</label>
                <select
                  value={incoterm}
                  onChange={(e) => setIncoterm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-bold rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value="FOB">FOB (Free On Board)</option>
                  <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                  <option value="EXW">EXW (Ex Works)</option>
                  <option value="DDP">DDP (Delivered Duty Paid)</option>
                  <option value="CFR">CFR (Cost and Freight)</option>
                  <option value="FCA">FCA (Free Carrier)</option>
                  <option value="CIP">CIP (Carriage and Insurance Paid)</option>
                  <option value="DAP">DAP (Delivered at Place)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Country Of Origin</label>
                <input
                  type="text"
                  value={countryOfOrigin}
                  onChange={(e) => setCountryOfOrigin(e.target.value)}
                  placeholder="e.g. China"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Total Cartons</label>
                <input
                  type="text"
                  value={totalCartons}
                  onChange={(e) => setTotalCartons(e.target.value)}
                  placeholder="e.g. 40 CTNS"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-mono rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Measurement (CBM)</label>
                <input
                  type="text"
                  value={measurementCbm}
                  onChange={(e) => setMeasurementCbm(e.target.value)}
                  placeholder="e.g. 4.11 CBMS"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-mono rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Net Weight</label>
                <input
                  type="text"
                  value={netWeight}
                  onChange={(e) => setNetWeight(e.target.value)}
                  placeholder="e.g. 580 KG"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-mono rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Gross Weight</label>
                <input
                  type="text"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  placeholder="e.g. 647 KG"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-mono rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Port of Loading (POL)</label>
                <input
                  type="text"
                  value={portOfLoading}
                  onChange={(e) => setPortOfLoading(e.target.value)}
                  placeholder="e.g. Hong Kong Port"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Port of Discharge (POD)</label>
                <input
                  type="text"
                  value={portOfDischarge}
                  onChange={(e) => setPortOfDischarge(e.target.value)}
                  placeholder="e.g. Valencia / Rotterdam"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Items Table (with HS Code) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Line Items & HS Codes ({items.length}) • Total: {totalPieces} PCS
              </label>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Line Item
              </button>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">Item Description & Specifications</th>
                    <th className="p-2.5 w-28">HS CODE</th>
                    <th className="p-2.5 w-20 text-center">Qty (PCS)</th>
                    <th className="p-2.5 w-28 text-right">Unit Price ({CURRENCY_SYMBOLS[currency]})</th>
                    <th className="p-2.5 w-28 text-right">Total</th>
                    <th className="p-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="e.g. Sweatshirt 100% Organic Cotton or UV400 Lens"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="e.g. 6109.10"
                          value={item.hsCode || ""}
                          onChange={(e) => handleItemChange(idx, "hsCode", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs text-center"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-center font-mono text-slate-200 text-xs"
                          required
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-right font-mono text-slate-200 text-xs"
                          required
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-white text-xs">
                        {item.total.toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Banner */}
              <div className="p-3 bg-slate-900 flex justify-between items-center text-xs font-bold border-t border-slate-800">
                <span className="text-slate-300">TOTAL ORDER AMOUNT :</span>
                <span className="text-emerald-400 font-mono text-sm">
                  {totalAmount.toFixed(2)} {CURRENCY_SYMBOLS[currency]}
                </span>
              </div>
            </div>
          </div>

          {/* Installments & Down Payment Presets */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Payment Terms & Down Payment Schedule
              </label>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset("30_70", totalAmount)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    installmentPreset === "30_70" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  30% / 70%
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("50_50", totalAmount)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    installmentPreset === "50_50" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  50% / 50%
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("30_40_30", totalAmount)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    installmentPreset === "30_40_30" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  30/40/30
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("lc_sight", totalAmount)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    installmentPreset === "lc_sight" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  100% L/C
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("100", totalAmount)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    installmentPreset === "100" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  100% Wire
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {installments.map((inst, index) => (
                <div key={inst.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <input
                      type="text"
                      value={inst.title}
                      onChange={(e) => handleInstallmentFieldChange(index, "title", e.target.value)}
                      className="bg-transparent font-bold text-xs text-slate-200 border-b border-slate-700 focus:border-blue-400 focus:outline-none w-2/3"
                    />
                    <span className="text-[11px] font-mono text-blue-400">Tranche #{index + 1}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400">Amount ({currency})</label>
                      <input
                        type="number"
                        step="0.01"
                        value={inst.amount}
                        onChange={(e) => handleInstallmentFieldChange(index, "amount", parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 font-mono text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">Due Date</label>
                      <input
                        type="date"
                        value={inst.dueDate}
                        onChange={(e) => handleInstallmentFieldChange(index, "dueDate", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes / Special Terms */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Commercial Notes & Terms</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. 30% deposit upon order confirmation. Balance against copy of Bill of Lading (B/L)."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl font-bold text-xs text-white shadow-lg transition flex items-center gap-2 ${
                isSale ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
              }`}
            >
              <Save className="w-4 h-4" />
              {orderToEdit ? "Save Changes" : isSale ? (documentType === "proforma" ? "Generate Proforma Invoice" : "Generate Commercial Invoice") : "Create Purchase Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
