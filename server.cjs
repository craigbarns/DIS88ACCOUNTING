const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist");

// Body parser
app.use(express.json({ limit: "25mb" }));

// Determine database storage directory
const dataDir = process.env.DATA_DIR || path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "database.json");

// Default initial company profile
const defaultCompanyProfile = {
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
    HKD: 7.82,
    EUR: 0.92,
    CNY: 7.24,
    GBP: 0.79,
    SGD: 1.34,
    JPY: 154.5,
    CAD: 1.36,
    AUD: 1.52,
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

function readDatabase() {
  try {
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath, "utf8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading database:", err);
  }
  const initialDb = {
    companyProfile: defaultCompanyProfile,
    partners: [],
    orders: [],
    payments: [],
    updatedAt: new Date().toISOString(),
  };
  writeDatabase(initialDb);
  return initialDb;
}

function writeDatabase(data) {
  try {
    const tmpPath = `${dbPath}.${Date.now()}.tmp`;
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tmpPath, dbPath);
    return true;
  } catch (err) {
    console.error("Error writing database:", err);
    return false;
  }
}

// ─── REST API ENDPOINTS ──────────────────────────────────────────────────────

// 1. Health / Sync status
app.get("/api/status", (req, res) => {
  const db = readDatabase();
  res.json({
    status: "online",
    dbLocation: dbPath,
    partnerCount: (db.partners || []).length,
    orderCount: (db.orders || []).length,
    paymentCount: (db.payments || []).length,
    lastUpdated: db.updatedAt,
  });
});

// 2. Fetch All Workspace Data
app.get("/api/data", (req, res) => {
  const db = readDatabase();
  res.json({
    companyProfile: db.companyProfile || defaultCompanyProfile,
    partners: db.partners || [],
    orders: db.orders || [],
    payments: db.payments || [],
    updatedAt: db.updatedAt,
  });
});

// 3. Update Company Profile
app.post("/api/company", (req, res) => {
  const db = readDatabase();
  db.companyProfile = req.body;
  writeDatabase(db);
  res.json({ success: true, companyProfile: db.companyProfile });
});

// 4. Partners API
app.post("/api/partners", (req, res) => {
  const db = readDatabase();
  if (Array.isArray(req.body)) {
    db.partners = req.body;
  } else {
    const partner = req.body;
    const idx = (db.partners || []).findIndex((p) => p.id === partner.id);
    if (idx >= 0) {
      db.partners[idx] = partner;
    } else {
      db.partners = [partner, ...(db.partners || [])];
    }
  }
  writeDatabase(db);
  res.json({ success: true, partners: db.partners });
});

app.delete("/api/partners/:id", (req, res) => {
  const db = readDatabase();
  db.partners = (db.partners || []).filter((p) => p.id !== req.params.id);
  writeDatabase(db);
  res.json({ success: true, partners: db.partners });
});

// 5. Orders & Invoices API
app.post("/api/orders", (req, res) => {
  const db = readDatabase();
  if (Array.isArray(req.body)) {
    db.orders = req.body;
  } else {
    const order = req.body;
    const idx = (db.orders || []).findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      db.orders[idx] = order;
    } else {
      db.orders = [order, ...(db.orders || [])];
    }
  }
  writeDatabase(db);
  res.json({ success: true, orders: db.orders });
});

app.delete("/api/orders/:id", (req, res) => {
  const db = readDatabase();
  db.orders = (db.orders || []).filter((o) => o.id !== req.params.id);
  writeDatabase(db);
  res.json({ success: true, orders: db.orders });
});

// 6. Payments API
app.post("/api/payments", (req, res) => {
  const db = readDatabase();
  if (Array.isArray(req.body)) {
    db.payments = req.body;
  } else {
    const payment = req.body;
    const idx = (db.payments || []).findIndex((p) => p.id === payment.id);
    if (idx >= 0) {
      db.payments[idx] = payment;
    } else {
      db.payments = [payment, ...(db.payments || [])];
    }
  }
  writeDatabase(db);
  res.json({ success: true, payments: db.payments });
});

app.delete("/api/payments/:id", (req, res) => {
  const db = readDatabase();
  db.payments = (db.payments || []).filter((p) => p.id !== req.params.id);
  writeDatabase(db);
  res.json({ success: true, payments: db.payments });
});

// 7. Full Backup Import / Restore
app.post("/api/restore", (req, res) => {
  const data = req.body;
  const db = {
    companyProfile: data.companyProfile || defaultCompanyProfile,
    partners: Array.isArray(data.partners) ? data.partners : [],
    orders: Array.isArray(data.orders) ? data.orders : [],
    payments: Array.isArray(data.payments) ? data.payments : [],
    updatedAt: new Date().toISOString(),
  };
  writeDatabase(db);
  res.json({ success: true, db });
});

// 8. Clear Workspace
app.post("/api/clear", (req, res) => {
  const db = {
    companyProfile: defaultCompanyProfile,
    partners: [],
    orders: [],
    payments: [],
    updatedAt: new Date().toISOString(),
  };
  writeDatabase(db);
  res.json({ success: true, message: "Workspace cleared" });
});

// 9. Load Demo Dataset
app.post("/api/demo", (req, res) => {
  const demoPartners = [
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

  const demoOrders = [
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

  const demoPayments = [
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

  const db = {
    companyProfile: defaultCompanyProfile,
    partners: demoPartners,
    orders: demoOrders,
    payments: demoPayments,
    updatedAt: new Date().toISOString(),
  };
  writeDatabase(db);
  res.json({ success: true, message: "Demo data loaded", db });
});

// ─── STATIC CLIENT ASSETS & SPA ROUTING ──────────────────────────────────────
app.use(express.static(distPath, { maxAge: "1d" }));

app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DISTRICT 88 LTD Accounting Server running on port ${PORT}`);
  console.log(`Database storage file: ${dbPath}`);
});
