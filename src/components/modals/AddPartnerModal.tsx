import React, { useState, useEffect } from "react";
import { X, Building, Factory, Save } from "lucide-react";
import { Partner, Currency, PartnerType } from "../../types";

interface AddPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerToEdit?: Partner | null;
  defaultType?: PartnerType;
  onSavePartner: (partner: Partner) => void;
}

export const AddPartnerModal: React.FC<AddPartnerModalProps> = ({
  isOpen,
  onClose,
  partnerToEdit,
  defaultType = "client",
  onSavePartner,
}) => {
  const [type, setType] = useState<PartnerType>(defaultType);
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>("USD");
  const [paymentTerms, setPaymentTerms] = useState("30% Deposit on order, 70% before shipment");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (partnerToEdit) {
      setType(partnerToEdit.type);
      setCompanyName(partnerToEdit.companyName);
      setName(partnerToEdit.name);
      setEmail(partnerToEdit.email);
      setPhone(partnerToEdit.phone);
      setAddress(partnerToEdit.address);
      setCountry(partnerToEdit.country);
      setRegistrationNumber(partnerToEdit.registrationNumber || "");
      setDefaultCurrency(partnerToEdit.defaultCurrency);
      setPaymentTerms(partnerToEdit.paymentTerms);
      setNotes(partnerToEdit.notes || "");
    } else {
      setType(defaultType);
      setCompanyName("");
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setCountry(defaultType === "supplier" ? "China" : "USA");
      setRegistrationNumber("");
      setDefaultCurrency(defaultType === "supplier" ? "USD" : "EUR");
      setPaymentTerms(defaultType === "supplier" ? "30% Deposit, 70% before factory release" : "30% Deposit, 70% BL");
      setNotes("");
    }
  }, [partnerToEdit, defaultType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saved: Partner = {
      id: partnerToEdit ? partnerToEdit.id : (type === "client" ? "cli-" : "sup-") + Date.now(),
      type,
      companyName,
      name,
      email,
      phone,
      address,
      country,
      registrationNumber: registrationNumber || undefined,
      defaultCurrency,
      paymentTerms,
      notes: notes || undefined,
      createdAt: partnerToEdit ? partnerToEdit.createdAt : new Date().toISOString().split("T")[0],
    };
    onSavePartner(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              type === "client" ? "bg-emerald-600/20 text-emerald-400" : "bg-indigo-600/20 text-indigo-400"
            }`}>
              {type === "client" ? <Building className="w-5 h-5" /> : <Factory className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {partnerToEdit ? "Edit Partner" : type === "client" ? "New Client / Customer" : "New Supplier / Factory"}
              </h3>
              <p className="text-xs text-slate-400">Contact details and payment agreements</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Partner Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("client")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  type === "client"
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-400"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <Building className="w-4 h-4" /> Customer (Client)
              </button>

              <button
                type="button"
                onClick={() => setType("supplier")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  type === "supplier"
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-400"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <Factory className="w-4 h-4" /> Supplier / Factory
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Maison Luxe Distribution SAS"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Alexandre Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                placeholder="contact@client.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+33 1 42 68 00 12"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
              <input
                type="text"
                placeholder="France, USA, China, Hong Kong..."
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Default Currency</label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value as Currency)}
                className="w-full bg-slate-950 border border-slate-700 text-blue-400 font-bold rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Address</label>
            <input
              type="text"
              placeholder="24 Rue du Faubourg Saint-Honoré, 75008 Paris"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Agreed Payment Terms</label>
            <input
              type="text"
              placeholder="e.g. 30% deposit on order, 70% before shipment"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tax ID / Business Registration No.</label>
            <input
              type="text"
              placeholder="e.g. FR829103948 or US-CA-994821"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white font-mono rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
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
              <Save className="w-4 h-4" />
              {partnerToEdit ? "Save Partner" : "Create Partner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
