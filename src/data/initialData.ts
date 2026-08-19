import { CompanyProfile, Partner, OrderInvoice, PaymentEntry } from "../types";

export const initialCompanyProfile: CompanyProfile = {
  name: "DISTRICT 88 LTD",
  legalStatus: "Limited Liability Company (Hong Kong)",
  registrationNumber: "74892019-000-03-24-A",
  address: "UNIT NO. 532B ON 5/F STAR HOUSE BUILDING, NO.3 SALISBURY ROAD TSIM SHA TSUI",
  city: "Tsim Sha Tsui, Kowloon",
  country: "Hong Kong",
  phone: "+852 2888 8888",
  email: "contact@district88ltd.com",
  website: "www.district88ltd.com",
  baseCurrency: "USD",
  exchangeRates: {
    USD: 1.0,
    HKD: 7.82,     // 1 USD = 7.82 HKD
    EUR: 0.92,     // 1 USD = 0.92 EUR
    CNY: 7.24,     // 1 USD = 7.24 CNY (RMB)
    GBP: 0.79,     // 1 USD = 0.79 GBP
    SGD: 1.34,     // 1 USD = 1.34 SGD
    JPY: 154.50,   // 1 USD = 154.50 JPY
    CAD: 1.36,     // 1 USD = 1.36 CAD
    AUD: 1.52,     // 1 USD = 1.52 AUD
  },
  bankAccounts: [
    {
      id: "bank-1",
      bankName: "ICBC (ASIA) - Wanchai Branch (Bank Code: 072)",
      accountName: "DISTRICT88 LIMITED",
      accountNumber: "954.530002.378",
      swiftBic: "UBHKHKHH",
      currency: "USD",
      balance: 0.0,
    },
    {
      id: "bank-2",
      bankName: "ICBC (ASIA) HKD Account",
      accountName: "DISTRICT88 LIMITED",
      accountNumber: "954.530002.378",
      swiftBic: "UBHKHKHH",
      currency: "HKD",
      balance: 0.0,
    },
    {
      id: "bank-3",
      bankName: "Wise Business Multi-Currency",
      accountName: "DISTRICT88 LIMITED",
      accountNumber: "BE98 7654 3210 9876",
      swiftBic: "TRWIBEB1",
      currency: "EUR",
      balance: 0.0,
    },
  ],
};

// Clean default empty lists
export const initialPartners: Partner[] = [];
export const initialOrders: OrderInvoice[] = [];
export const initialPayments: PaymentEntry[] = [];

// Demo Dataset for testing if requested
export const demoPartners: Partner[] = [
  {
    id: "cli-siroko",
    type: "client",
    name: "Product & Sourcing Team",
    companyName: "Siroko Solutions S.L.",
    registrationNumber: "ESB52537651",
    taxId: "ESB52537651",
    email: "product@siroko.com",
    phone: "+34 984 08 28 88",
    address: "Plaza Seis de Agosto nº6-2º, Gijón (33207), Asturias",
    country: "Spain",
    defaultCurrency: "EUR",
    paymentTerms: "30% Deposit on order confirmation, 70% before Bill of Lading (B/L) release",
    notes: "Leading European sportswear, technical cycling & performance eyewear brand.",
    createdAt: "2026-02-18",
  },
  {
    id: "cli-1",
    type: "client",
    name: "Alexandre Dupont",
    companyName: "Maison Luxe Distribution SAS",
    registrationNumber: "FR829103948",
    email: "a.dupont@maisonluxe.fr",
    phone: "+33 1 42 68 00 12",
    address: "24 Rue du Faubourg Saint-Honoré, 75008 Paris",
    country: "France",
    defaultCurrency: "EUR",
    paymentTerms: "30% Deposit on order, 70% before Bill of Lading",
    notes: "VIP European customer.",
    createdAt: "2026-01-10",
  },
  {
    id: "sup-1",
    type: "supplier",
    name: "Mr. Zhang Wei",
    companyName: "Shenzhen Precision Electronics Co., Ltd",
    registrationNumber: "CN-91440300MA5",
    email: "zhangwei@sz-precision.com",
    phone: "+86 755 8329 1100",
    address: "Building B4, High-Tech Industrial Park, Nanshan, Shenzhen",
    country: "China",
    defaultCurrency: "USD",
    paymentTerms: "30% Production deposit, 70% before shipping release",
    notes: "Primary electronics manufacturer.",
    createdAt: "2026-01-05",
  },
];

export const demoOrders: OrderInvoice[] = [
  {
    id: "ord-1",
    reference: "INV-2026-004",
    type: "sale",
    documentType: "commercial_invoice",
    partnerId: "cli-siroko",
    partnerName: "Siroko Solutions S.L.",
    title: "Pro Cycling Performance Eyewear & UV400 Photochromic Lenses",
    linkedOrderReference: "PO-2026-004",
    date: "2026-02-18",
    dueDate: "2026-04-30",
    currency: "EUR",
    exchangeRateToBase: 0.92,
    items: [
      { id: "item-11", description: "Siroko Pro K3s Photochromic Cycling Sunglasses", hsCode: "9004.10", quantity: 3000, unitPrice: 18.5, total: 55500.0 },
      { id: "item-12", description: "Hard Shell EVA Custom Protective Cases with Carabiner", hsCode: "4202.92", quantity: 3000, unitPrice: 4.33, total: 13000.0 },
    ],
    subtotal: 68500.0,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 68500.0,
    totalPaid: 20550.0,
    balanceDue: 47950.0,
    status: "partially_paid",
    incoterm: "FOB",
    countryOfOrigin: "China",
    totalCartons: "40 CTNS",
    netWeight: "580 KG",
    grossWeight: "647 KG",
    measurementCbm: "4.11 CBMS",
    portOfLoading: "Hong Kong Port",
    portOfDischarge: "Valencia, Spain",
    shippingTerms: "FOB Hong Kong Port",
    notes: "30% initial deposit confirmed. Tooling & lens injection molding in progress.",
    createdAt: "2026-02-18",
    updatedAt: "2026-02-19",
    installments: [
      {
        id: "inst-11",
        title: "30% Deposit on Order Confirmation",
        percentage: 30,
        amount: 20550.0,
        dueDate: "2026-02-22",
        paidDate: "2026-02-19",
        status: "paid",
        paymentMethod: "wire_transfer",
        bankAccount: "Wise Business Multi-Currency",
        reference: "WIRE-SIROKO-0219",
      },
      {
        id: "inst-12",
        title: "70% Balance before Bill of Lading (B/L) Release",
        percentage: 70,
        amount: 47950.0,
        dueDate: "2026-04-30",
        status: "pending",
      },
    ],
  },
];

export const demoPayments: PaymentEntry[] = [
  {
    id: "pay-1",
    orderInvoiceId: "ord-1",
    orderReference: "INV-2026-004",
    partnerId: "cli-siroko",
    partnerName: "Siroko Solutions S.L.",
    type: "inflow",
    amount: 20550.0,
    currency: "EUR",
    exchangeRateToBase: 0.92,
    convertedAmountBase: 22336.96,
    paymentDate: "2026-02-19",
    paymentMethod: "wire_transfer",
    bankAccount: "Wise Business Multi-Currency",
    reference: "WIRE-SIROKO-0219",
    installmentTitle: "30% Deposit on Order Confirmation",
    notes: "30% Initial order deposit received from Siroko Solutions S.L. (Spain)",
    createdAt: "2026-02-19",
  },
];
