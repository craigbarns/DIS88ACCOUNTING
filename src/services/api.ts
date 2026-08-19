import { CompanyProfile, OrderInvoice, Partner, PaymentEntry, ExpenseItem } from "../types";

export interface WorkspaceData {
  companyProfile: CompanyProfile;
  partners: Partner[];
  orders: OrderInvoice[];
  payments: PaymentEntry[];
  expenses?: ExpenseItem[];
  updatedAt?: string;
}

export async function fetchWorkspaceData(): Promise<WorkspaceData | null> {
  try {
    const res = await fetch("/api/data");
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function syncCompanyProfile(profile: CompanyProfile): Promise<boolean> {
  try {
    const res = await fetch("/api/company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function syncPartners(partners: Partner[]): Promise<boolean> {
  try {
    const res = await fetch("/api/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partners),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function syncOrders(orders: OrderInvoice[]): Promise<boolean> {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orders),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function syncPayments(payments: PaymentEntry[]): Promise<boolean> {
  try {
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payments),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function syncExpenses(expenses: ExpenseItem[]): Promise<boolean> {
  try {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenses),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function apiClearWorkspace(): Promise<boolean> {
  try {
    const res = await fetch("/api/clear", { method: "POST" });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function apiLoadDemoData(): Promise<boolean> {
  try {
    const res = await fetch("/api/demo", { method: "POST" });
    return res.ok;
  } catch (err) {
    return false;
  }
}
