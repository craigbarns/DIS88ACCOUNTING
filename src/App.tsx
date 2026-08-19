import React, { useState, useEffect } from "react";
import { ActiveTab, CompanyProfile, OrderInvoice, Partner, PaymentEntry, Currency, PaymentMethod } from "./types";
import { 
  loadCompanyProfile, 
  saveCompanyProfile, 
  loadPartners, 
  savePartners, 
  loadOrders, 
  saveOrders, 
  loadPayments, 
  savePayments,
  recordPayment 
} from "./services/storage";
import { 
  fetchWorkspaceData, 
  syncCompanyProfile, 
  syncPartners, 
  syncOrders, 
  syncPayments 
} from "./services/api";
import { exportToExcel } from "./services/export";

import { Navbar } from "./components/Navbar";
import { MobileNav } from "./components/MobileNav";
import { Dashboard } from "./components/Dashboard";
import { SalesManager } from "./components/SalesManager";
import { PurchasesManager } from "./components/PurchasesManager";
import { PaymentsJournal } from "./components/PaymentsJournal";
import { ProfitAnalysis } from "./components/ProfitAnalysis";
import { PartnersManager } from "./components/PartnersManager";
import { SettingsManager } from "./components/SettingsManager";

import { AddPaymentModal } from "./components/modals/AddPaymentModal";
import { AddOrderModal } from "./components/modals/AddOrderModal";
import { AddPartnerModal } from "./components/modals/AddPartnerModal";
import { EmailReminderModal } from "./components/modals/EmailReminderModal";

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [company, setCompany] = useState<CompanyProfile>(loadCompanyProfile);
  const [partners, setPartners] = useState<Partner[]>(loadPartners);
  const [orders, setOrders] = useState<OrderInvoice[]>(loadOrders);
  const [payments, setPayments] = useState<PaymentEntry[]>(loadPayments);

  // Initial cloud database sync
  useEffect(() => {
    fetchWorkspaceData().then((data) => {
      if (data) {
        if (data.companyProfile) {
          setCompany(data.companyProfile);
          saveCompanyProfile(data.companyProfile);
        }
        if (Array.isArray(data.partners)) {
          setPartners(data.partners);
          savePartners(data.partners);
        }
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
          saveOrders(data.orders);
        }
        if (Array.isArray(data.payments)) {
          setPayments(data.payments);
          savePayments(data.payments);
        }
      }
    });
  }, []);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentPreselectedOrder, setPaymentPreselectedOrder] = useState<OrderInvoice | null>(null);
  const [paymentPreselectedInstallmentId, setPaymentPreselectedInstallmentId] = useState<string | null>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderModalType, setOrderModalType] = useState<"sale" | "purchase">("sale");
  const [orderToEdit, setOrderToEdit] = useState<OrderInvoice | null>(null);

  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerModalDefaultType, setPartnerModalDefaultType] = useState<"client" | "supplier">("client");
  const [partnerToEdit, setPartnerToEdit] = useState<Partner | null>(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailModalOrder, setEmailModalOrder] = useState<OrderInvoice | null>(null);

  // Synchronize base currency changes
  const handleSetBaseCurrency = (newCurrency: Currency) => {
    const updated = { ...company, baseCurrency: newCurrency };
    setCompany(updated);
    saveCompanyProfile(updated);
    syncCompanyProfile(updated);
  };

  const handleUpdateCompany = (newCompany: CompanyProfile) => {
    setCompany(newCompany);
    saveCompanyProfile(newCompany);
    syncCompanyProfile(newCompany);
  };

  const handleReloadAllData = () => {
    setCompany(loadCompanyProfile());
    setPartners(loadPartners());
    setOrders(loadOrders());
    setPayments(loadPayments());

    fetchWorkspaceData().then((data) => {
      if (data) {
        if (data.companyProfile) setCompany(data.companyProfile);
        if (Array.isArray(data.partners)) setPartners(data.partners);
        if (Array.isArray(data.orders)) setOrders(data.orders);
        if (Array.isArray(data.payments)) setPayments(data.payments);
      }
    });
  };

  // Payment Handlers
  const handleOpenNewPayment = (order?: OrderInvoice, installmentId?: string) => {
    setPaymentPreselectedOrder(order || null);
    setPaymentPreselectedInstallmentId(installmentId || null);
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = (
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
  ) => {
    const result = recordPayment(order, paymentData, orders, payments, company);
    setOrders(result.updatedOrders);
    setPayments(result.updatedPayments);
    syncOrders(result.updatedOrders);
    syncPayments(result.updatedPayments);
  };

  const handleDeletePayment = (paymentId: string) => {
    if (!window.confirm("Are you sure you want to delete this payment transaction?")) return;
    const updated = payments.filter((p) => p.id !== paymentId);
    setPayments(updated);
    savePayments(updated);
    syncPayments(updated);
  };

  // Email Reminder Handler
  const handleOpenEmailReminder = (order: OrderInvoice) => {
    setEmailModalOrder(order);
    setIsEmailModalOpen(true);
  };

  // Order Handlers
  const handleOpenNewOrder = (type: "sale" | "purchase") => {
    setOrderModalType(type);
    setOrderToEdit(null);
    setIsOrderModalOpen(true);
  };

  const handleOpenEditOrder = (order: OrderInvoice) => {
    setOrderModalType(order.type);
    setOrderToEdit(order);
    setIsOrderModalOpen(true);
  };

  const handleSaveOrder = (order: OrderInvoice) => {
    let updated: OrderInvoice[];
    const exists = orders.some((o) => o.id === order.id);
    if (exists) {
      updated = orders.map((o) => (o.id === order.id ? order : o));
    } else {
      updated = [order, ...orders];
    }
    setOrders(updated);
    saveOrders(updated);
    syncOrders(updated);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    saveOrders(updated);
    syncOrders(updated);
  };

  // Partner Handlers
  const handleOpenNewPartner = (type: "client" | "supplier" = "client") => {
    setPartnerModalDefaultType(type);
    setPartnerToEdit(null);
    setIsPartnerModalOpen(true);
  };

  const handleOpenEditPartner = (partner: Partner) => {
    setPartnerModalDefaultType(partner.type);
    setPartnerToEdit(partner);
    setIsPartnerModalOpen(true);
  };

  const handleSavePartner = (partner: Partner) => {
    let updated: Partner[];
    const exists = partners.some((p) => p.id === partner.id);
    if (exists) {
      updated = partners.map((p) => (p.id === partner.id ? partner : p));
    } else {
      updated = [partner, ...partners];
    }
    setPartners(updated);
    savePartners(updated);
    syncPartners(updated);
  };

  const handleDeletePartner = (partnerId: string) => {
    if (!window.confirm("Are you sure you want to delete this partner?")) return;
    const updated = partners.filter((p) => p.id !== partnerId);
    setPartners(updated);
    savePartners(updated);
    syncPartners(updated);
  };

  // Excel Export
  const handleExportExcel = () => {
    exportToExcel(company, orders, payments, partners);
  };

  const currentEmailPartner = emailModalOrder ? partners.find((p) => p.id === emailModalOrder.partnerId) : undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white pb-16 md:pb-0">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        company={company}
        setBaseCurrency={handleSetBaseCurrency}
        onNewPayment={() => handleOpenNewPayment()}
        onNewOrder={handleOpenNewOrder}
        onExportExcel={handleExportExcel}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === "dashboard" && (
          <Dashboard
            company={company}
            orders={orders}
            payments={payments}
            onOpenOrder={handleOpenEditOrder}
            onPayInstallment={(order, instId) => handleOpenNewPayment(order, instId)}
            onSendEmailReminder={handleOpenEmailReminder}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "sales" && (
          <SalesManager
            orders={orders}
            partners={partners}
            payments={payments}
            company={company}
            onNewOrder={() => handleOpenNewOrder("sale")}
            onEditOrder={handleOpenEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onRecordPayment={(order, instId) => handleOpenNewPayment(order, instId)}
            onSendEmailReminder={handleOpenEmailReminder}
          />
        )}

        {activeTab === "purchases" && (
          <PurchasesManager
            orders={orders}
            partners={partners}
            company={company}
            onNewOrder={() => handleOpenNewOrder("purchase")}
            onEditOrder={handleOpenEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onRecordPayment={(order, instId) => handleOpenNewPayment(order, instId)}
          />
        )}

        {activeTab === "payments" && (
          <PaymentsJournal
            payments={payments}
            company={company}
            onNewPayment={() => handleOpenNewPayment()}
            onDeletePayment={handleDeletePayment}
            onExportExcel={handleExportExcel}
          />
        )}

        {activeTab === "margins" && (
          <ProfitAnalysis orders={orders} company={company} />
        )}

        {activeTab === "partners" && (
          <PartnersManager
            partners={partners}
            orders={orders}
            payments={payments}
            company={company}
            onNewPartner={handleOpenNewPartner}
            onEditPartner={handleOpenEditPartner}
            onDeletePartner={handleDeletePartner}
          />
        )}

        {activeTab === "settings" && (
          <SettingsManager
            company={company}
            onUpdateCompany={handleUpdateCompany}
            onReloadAllData={handleReloadAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} <strong>{company.name}</strong> — Star House, Tsim Sha Tsui, Hong Kong. All rights reserved.
          </span>
          <span className="font-mono text-slate-400">
            Base Currency: <strong className="text-blue-400">{company.baseCurrency}</strong> • Cloud Database Synchronized
          </span>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickAction={() => handleOpenNewOrder("sale")}
      />

      {/* Modals */}
      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orders={orders}
        preselectedOrder={paymentPreselectedOrder}
        preselectedInstallmentId={paymentPreselectedInstallmentId}
        company={company}
        onSavePayment={handleSavePayment}
      />

      <AddOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        type={orderModalType}
        orderToEdit={orderToEdit}
        partners={partners}
        existingOrders={orders}
        company={company}
        onSaveOrder={handleSaveOrder}
        onOpenNewPartner={handleOpenNewPartner}
      />

      <AddPartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        partnerToEdit={partnerToEdit}
        defaultType={partnerModalDefaultType}
        onSavePartner={handleSavePartner}
      />

      <EmailReminderModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        order={emailModalOrder}
        partner={currentEmailPartner}
        company={company}
      />
    </div>
  );
}

export default App;
