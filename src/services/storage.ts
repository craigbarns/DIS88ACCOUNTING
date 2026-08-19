import { CompanyProfile, OrderInvoice, Partner, PaymentEntry, PaymentMethod, ExpenseItem } from "../types";
import { 
  initialCompanyProfile, 
  initialOrders, 
  initialPartners, 
  initialPayments,
  demoPartners,
  demoOrders,
  demoPayments
} from "../data/initialData";
import { convertCurrency } from "./currency";

const STORAGE_KEYS = {
  PROFILE: "d88_company_profile",
  PARTNERS: "d88_partners",
  ORDERS: "d88_orders",
  PAYMENTS: "d88_payments",
  EXPENSES: "d88_expenses",
};

export function loadCompanyProfile(): CompanyProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (data) {
      const parsed: CompanyProfile = JSON.parse(data);
      let needsSave = false;
      if (!parsed.address.includes("STAR HOUSE")) {
        parsed.address = initialCompanyProfile.address;
        parsed.city = initialCompanyProfile.city;
        parsed.country = initialCompanyProfile.country;
        needsSave = true;
      }
      if (!parsed.bankAccounts || !parsed.bankAccounts.some((b) => b.bankName.includes("ICBC"))) {
        parsed.bankAccounts = initialCompanyProfile.bankAccounts;
        needsSave = true;
      }
      if (needsSave) {
        saveCompanyProfile(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load profile from storage", e);
  }
  return initialCompanyProfile;
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function loadPartners(): Partner[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PARTNERS);
    if (data !== null) return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load partners from storage", e);
  }
  return initialPartners;
}

export function savePartners(partners: Partner[]): void {
  localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
}

export function loadOrders(): OrderInvoice[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (data !== null) return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load orders from storage", e);
  }
  return initialOrders;
}

export function saveOrders(orders: OrderInvoice[]): void {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

export function loadPayments(): PaymentEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (data !== null) return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load payments from storage", e);
  }
  return initialPayments;
}

export function savePayments(payments: PaymentEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
}

export function loadExpenses(): ExpenseItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (data !== null) return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load expenses from storage", e);
  }
  return [];
}

export function saveExpenses(expenses: ExpenseItem[]): void {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
}

export function recordPayment(
  order: OrderInvoice,
  paymentData: {
    amount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    bankAccount: string;
    reference: string;
    installmentId?: string;
    notes?: string;
  },
  existingOrders: OrderInvoice[],
  existingPayments: PaymentEntry[],
  company: CompanyProfile
): { updatedOrders: OrderInvoice[]; updatedPayments: PaymentEntry[] } {
  const baseCurrency = company.baseCurrency;
  const rates = company.exchangeRates;
  const convertedAmountBase = convertCurrency(paymentData.amount, order.currency, baseCurrency, rates);

  const newPayment: PaymentEntry = {
    id: `pay-${Date.now()}`,
    orderInvoiceId: order.id,
    orderReference: order.reference,
    partnerId: order.partnerId,
    partnerName: order.partnerName,
    type: order.type === "sale" ? "inflow" : "outflow",
    amount: paymentData.amount,
    currency: order.currency,
    exchangeRateToBase: rates[order.currency] || 1.0,
    convertedAmountBase,
    paymentDate: paymentData.paymentDate,
    paymentMethod: paymentData.paymentMethod,
    bankAccount: paymentData.bankAccount,
    reference: paymentData.reference,
    installmentTitle: paymentData.installmentId
      ? order.installments?.find((i) => i.id === paymentData.installmentId)?.title
      : undefined,
    notes: paymentData.notes,
    createdAt: new Date().toISOString(),
  };

  const updatedPayments = [newPayment, ...existingPayments];
  savePayments(updatedPayments);

  const updatedTotalPaid = order.totalPaid + paymentData.amount;
  const updatedBalanceDue = Math.max(0, order.totalAmount - updatedTotalPaid);

  let newStatus = order.status;
  if (updatedTotalPaid >= order.totalAmount && order.totalAmount > 0) {
    newStatus = "paid";
  } else if (updatedTotalPaid > 0) {
    newStatus = "partially_paid";
  }

  const updatedInstallments = (order.installments || []).map((inst) => {
    if (paymentData.installmentId && inst.id === paymentData.installmentId) {
      return {
        ...inst,
        status: "paid" as const,
        paidDate: paymentData.paymentDate,
        paymentMethod: paymentData.paymentMethod,
        bankAccount: paymentData.bankAccount,
        reference: paymentData.reference,
      };
    }
    return inst;
  });

  const updatedOrder: OrderInvoice = {
    ...order,
    totalPaid: updatedTotalPaid,
    balanceDue: updatedBalanceDue,
    status: newStatus,
    installments: updatedInstallments,
    updatedAt: new Date().toISOString(),
  };

  const updatedOrders = existingOrders.map((o) => (o.id === order.id ? updatedOrder : o));
  saveOrders(updatedOrders);

  return { updatedOrders, updatedPayments };
}

export function loadDemoDataset(): void {
  saveCompanyProfile(initialCompanyProfile);
  savePartners(demoPartners);
  saveOrders(demoOrders);
  savePayments(demoPayments);
}

export function clearWorkspace(): void {
  saveCompanyProfile(initialCompanyProfile);
  savePartners([]);
  saveOrders([]);
  savePayments([]);
  saveExpenses([]);
}

export function exportBackupJSON(): string {
  const backup = {
    version: "2.1.0",
    exportedAt: new Date().toISOString(),
    companyProfile: loadCompanyProfile(),
    partners: loadPartners(),
    orders: loadOrders(),
    payments: loadPayments(),
    expenses: loadExpenses(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackupJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.companyProfile) saveCompanyProfile(data.companyProfile);
    if (data.partners) savePartners(data.partners);
    if (data.orders) saveOrders(data.orders);
    if (data.payments) savePayments(data.payments);
    if (data.expenses) saveExpenses(data.expenses);
    return true;
  } catch (e) {
    console.error("Backup import failed", e);
    return false;
  }
}
