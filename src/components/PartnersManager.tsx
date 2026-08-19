import React, { useState } from "react";
import { 
  Users, 
  PlusCircle, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Trash2, 
  Edit3, 
  Building, 
  Factory, 
  Globe,
  FileSpreadsheet
} from "lucide-react";
import { Partner, OrderInvoice, CompanyProfile } from "../types";
import { formatCurrency, convertCurrency } from "../services/currency";
import { generateStatementOfAccountPDF } from "../services/soaGenerator";

interface PartnersManagerProps {
  partners: Partner[];
  orders: OrderInvoice[];
  payments: any[];
  company: CompanyProfile;
  onNewPartner: (type?: "client" | "supplier") => void;
  onEditPartner: (partner: Partner) => void;
  onDeletePartner: (id: string) => void;
}

export const PartnersManager: React.FC<PartnersManagerProps> = ({
  partners,
  orders,
  payments,
  company,
  onNewPartner,
  onEditPartner,
  onDeletePartner,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "client" | "supplier">("all");

  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || p.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-extrabold text-white">Partners Directory (Clients & Suppliers)</h1>
          </div>
          <p className="text-slate-400 text-sm mt-0.5">
            Centralized directory with contact details, currencies, and official Statement of Account generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNewPartner("client")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + New Client
          </button>
          <button
            onClick={() => onNewPartner("supplier")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + New Supplier
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company, contact person, email, country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === "all" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({partners.length})
          </button>
          <button
            onClick={() => setTypeFilter("client")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === "client" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Clients ({partners.filter((p) => p.type === "client").length})
          </button>
          <button
            onClick={() => setTypeFilter("supplier")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === "supplier" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Suppliers ({partners.filter((p) => p.type === "supplier").length})
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPartners.map((partner) => {
          const isClient = partner.type === "client";
          const partnerOrders = orders.filter((o) => o.partnerId === partner.id);
          const totalVolume = partnerOrders.reduce(
            (s, o) => s + convertCurrency(o.totalAmount, o.currency, company.baseCurrency, company.exchangeRates),
            0
          );
          const balancePending = partnerOrders.reduce(
            (s, o) => s + convertCurrency(o.balanceDue, o.currency, company.baseCurrency, company.exchangeRates),
            0
          );

          return (
            <div
              key={partner.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      isClient ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    }`}>
                      {isClient ? <Building className="w-5 h-5" /> : <Factory className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{partner.companyName}</h3>
                      <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded mt-0.5 ${
                        isClient ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-indigo-950 text-indigo-300 border border-indigo-800"
                      }`}>
                        {isClient ? "Customer" : "Supplier / Factory"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => generateStatementOfAccountPDF(partner, orders, payments, company)}
                      title="Download Official Statement of Account (SOA PDF)"
                      className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditPartner(partner)}
                      title="Edit"
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePartner(partner.id)}
                      title="Delete"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Contact: <strong className="text-slate-200">{partner.name}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <a href={`mailto:${partner.email}`} className="hover:underline text-blue-400 truncate">
                      {partner.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{partner.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{partner.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>Country: <strong className="text-slate-200">{partner.country}</strong> • Currency: <strong className="text-amber-400">{partner.defaultCurrency}</strong></span>
                  </div>
                </div>

                {partner.paymentTerms && (
                  <div className="mt-3 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 block">Payment Terms:</span>
                    {partner.paymentTerms}
                  </div>
                )}
              </div>

              {/* Financial stats footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Trading Volume :</span>
                  <span className="font-bold text-white">{formatCurrency(totalVolume, company.baseCurrency)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-sans block">
                    {isClient ? "Receivables Due :" : "Payables Due :"}
                  </span>
                  <span className={`font-bold ${balancePending > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                    {formatCurrency(balancePending, company.baseCurrency)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
