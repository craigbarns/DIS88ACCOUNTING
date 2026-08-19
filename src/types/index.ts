export type Currency = "HKD" | "USD" | "EUR" | "CNY" | "GBP" | "SGD" | "JPY" | "CAD" | "AUD";

export interface ExchangeRates {
  HKD: number;
  USD: number;
  EUR: number;
  CNY: number;
  GBP: number;
  SGD: number;
  JPY: number;
  CAD: number;
  AUD: number;
}

export type PartnerType = "client" | "supplier";

export interface Partner {
  id: string;
  type: PartnerType;
  name: string;
  companyName: string;
  contactPerson?: string;
  registrationNumber?: string;
  taxId?: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  defaultCurrency: Currency;
  paymentTerms: string; // e.g., "30% deposit, 70% before shipment", "100% L/C at sight", "Net 30"
  notes?: string;
  createdAt: string;
}

export type PaymentStatus = "draft" | "pending" | "partially_paid" | "paid" | "overdue" | "cancelled";

export type PaymentMethod = "wire_transfer" | "fps_hk" | "lc" | "wise" | "check" | "credit_card" | "cash" | "other";

export type ShipmentMilestone = "production_pending" | "in_production" | "qc_inspection" | "vessel_booked" | "shipped_onboard" | "delivered";

export type DocumentType = "proforma" | "commercial_invoice" | "purchase_order";

export interface LetterOfCreditDetails {
  lcNumber?: string;
  issuingBank?: string;
  advisingBank?: string;
  issueDate?: string;
  expiryDate?: string;
  latestShipmentDate?: string;
  presentationDays?: number;
  requiredDocuments?: string[];
  lcAmount?: number;
  lcCurrency?: Currency;
  status?: "draft" | "issued" | "amended" | "negotiated" | "settled";
}

export interface Installment {
  id: string;
  title: string;
  percentage?: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "pending" | "paid" | "overdue";
  paymentMethod?: PaymentMethod;
  bankAccount?: string;
  reference?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  description: string;
  hsCode?: string; // e.g. 6109.10 or 9004.10
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderInvoice {
  id: string;
  reference: string; // e.g. PI-2026-001, INV-2026-001 or PO-2026-001
  type: "sale" | "purchase";
  documentType?: DocumentType; // Proforma vs Commercial Invoice vs Purchase Order
  partnerId: string;
  partnerName: string;
  title: string;
  linkedOrderReference?: string; // Links sales invoice with purchase order to calculate margin
  date: string;
  dueDate: string;
  currency: Currency;
  exchangeRateToBase: number;
  items: OrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  totalPaid: number;
  balanceDue: number;
  status: PaymentStatus;
  installments: Installment[];
  
  // International Trade, Shipping & Customs Specifications (Packing List info)
  incoterm?: string; // FOB, CIF, EXW, DDP, CFR, FCA
  countryOfOrigin?: string; // China, Hong Kong, etc.
  totalCartons?: string; // e.g. 40 CTNS
  netWeight?: string; // e.g. 580 KG
  grossWeight?: string; // e.g. 647 KG
  measurementCbm?: string; // e.g. 4.11 CBMS
  portOfLoading?: string; // e.g. Hong Kong / Shenzhen
  portOfDischarge?: string; // e.g. Valencia / Rotterdam
  shippingTerms?: string; // Extra notes
  
  shipmentMilestone?: ShipmentMilestone;
  etdDate?: string;
  etaDate?: string;
  blNumber?: string;
  letterOfCredit?: LetterOfCreditDetails;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEntry {
  id: string;
  orderInvoiceId: string;
  orderReference: string;
  partnerId: string;
  partnerName: string;
  type: "inflow" | "outflow"; // inflow = client payment, outflow = supplier payment
  amount: number;
  currency: Currency;
  exchangeRateToBase: number;
  convertedAmountBase: number;
  invoiceExchangeRate?: number;
  fxGainLossBase?: number; // Gain / loss due to currency rate fluctuation
  paymentDate: string;
  paymentMethod: PaymentMethod;
  bankAccount: string;
  reference: string;
  installmentTitle?: string;
  notes?: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftBic: string;
  fpsId?: string; // HK Faster Payment System ID
  currency: Currency;
  balance?: number;
}

export interface CompanyProfile {
  name: string;
  legalStatus: string;
  registrationNumber: string; // HK BR No.
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  phone: string;
  email: string;
  website: string;
  baseCurrency: Currency;
  exchangeRates: ExchangeRates;
  bankAccounts: BankAccount[];
}

export type ActiveTab = "dashboard" | "sales" | "purchases" | "payments" | "margins" | "partners" | "settings";
