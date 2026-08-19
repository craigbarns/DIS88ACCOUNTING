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
  paymentTerms: string;
  notes?: string;
  createdAt: string;
}

export type PaymentStatus = "draft" | "pending" | "partially_paid" | "paid" | "overdue" | "cancelled";

export type PaymentMethod = "wire_transfer" | "fps_hk" | "lc" | "wise" | "check" | "credit_card" | "cash" | "alipay" | "wechat_pay" | "other";

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
  hsCode?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderInvoice {
  id: string;
  reference: string;
  type: "sale" | "purchase";
  documentType?: DocumentType;
  partnerId: string;
  partnerName: string;
  title: string;
  linkedOrderReference?: string;
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
  
  incoterm?: string;
  countryOfOrigin?: string;
  totalCartons?: string;
  netWeight?: string;
  grossWeight?: string;
  measurementCbm?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  shippingTerms?: string;
  
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
  type: "inflow" | "outflow";
  amount: number;
  currency: Currency;
  exchangeRateToBase: number;
  convertedAmountBase: number;
  invoiceExchangeRate?: number;
  fxGainLossBase?: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  bankAccount: string;
  reference: string;
  installmentTitle?: string;
  notes?: string;
  createdAt: string;
}

// CHINA MAINLAND OFFICE EXPENSES (SHANGHAI & HANGZHOU)
export type OfficeLocation = "shanghai" | "hangzhou";

export type ExpenseCategory = 
  | "rent_utilities"       // Office lease, management fees, electricity, internet
  | "salaries_social"      // Local payroll, social security
  | "travel_transport"     // High-speed trains, factory QC visits, Didi, flights
  | "samples_qc"           // Sample prototyping, lab tests, QC tooling
  | "meals_entertainment"  // Client & supplier dinners, team meals
  | "office_supplies"      // Stationery, hardware, computer equipment
  | "customs_express"      // SF Express, DHL, courier, customs clearance
  | "marketing_software"   // Subscriptions, trade fairs, software
  | "tax_legal"            // Accounting, audit, agency fees
  | "other";

export interface ExpenseItem {
  id: string;
  office: OfficeLocation;
  title: string;
  category: ExpenseCategory;
  amount: number;
  currency: Currency; // Usually CNY, but can be USD or HKD
  exchangeRateToBase: number;
  convertedAmountBase: number;
  date: string;
  paidDate?: string;
  paymentMethod: PaymentMethod;
  bankAccount?: string;
  vendorName?: string;
  invoiceReceiptNumber?: string; // Fapiao or receipt ref
  status: "paid" | "pending";
  isRecurring?: boolean;
  recurringFrequency?: "monthly" | "quarterly" | "yearly";
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftBic: string;
  fpsId?: string;
  currency: Currency;
  balance?: number;
}

export interface CompanyProfile {
  name: string;
  legalStatus: string;
  registrationNumber: string;
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

export type ActiveTab = "dashboard" | "sales" | "purchases" | "expenses" | "payments" | "margins" | "partners" | "settings";
