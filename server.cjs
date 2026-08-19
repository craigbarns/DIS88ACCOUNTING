const express = require("express");
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist");

app.use(express.json({ limit: "25mb" }));

// ─── POSTGRESQL & LOCAL STORAGE HYBRID ENGINE ────────────────────────────────
const isPostgres = Boolean(process.env.DATABASE_URL);
let pgPool = null;

if (isPostgres) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  // Initialize PostgreSQL table
  pgPool.query(`
    CREATE TABLE IF NOT EXISTS d88_store (
      key VARCHAR(50) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `).then(() => {
    console.log("✓ Connected to Railway PostgreSQL Database & verified table schema");
  }).catch((err) => {
    console.error("PostgreSQL initialization error:", err);
  });
}

// Fallback Local File Storage
const dataDir = process.env.DATA_DIR || path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, "database.json");

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

async function getFullData() {
  if (isPostgres && pgPool) {
    try {
      const res = await pgPool.query("SELECT key, data FROM d88_store");
      const storeMap = {};
      res.rows.forEach((r) => { storeMap[r.key] = r.data; });

      return {
        companyProfile: storeMap["companyProfile"] || defaultCompanyProfile,
        partners: storeMap["partners"] || [],
        orders: storeMap["orders"] || [],
        payments: storeMap["payments"] || [],
        databaseEngine: "Railway PostgreSQL",
        updatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error("PostgreSQL read error:", err);
    }
  }

  // Fallback to local JSON file
  try {
    if (fs.existsSync(dbPath)) {
      const parsed = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      parsed.databaseEngine = "Embedded Persistent Storage";
      return parsed;
    }
  } catch (err) {
    console.error("File DB read error:", err);
  }

  return {
    companyProfile: defaultCompanyProfile,
    partners: [],
    orders: [],
    payments: [],
    databaseEngine: "Embedded Persistent Storage",
    updatedAt: new Date().toISOString(),
  };
}

async function saveKeyData(key, data) {
  if (isPostgres && pgPool) {
    try {
      await pgPool.query(
        `INSERT INTO d88_store (key, data, updated_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (key) 
         DO UPDATE SET data = $2, updated_at = NOW()`,
        [key, JSON.stringify(data)]
      );
      return true;
    } catch (err) {
      console.error(`PostgreSQL save error for ${key}:`, err);
    }
  }

  // Also sync to file
  try {
    const full = await getFullData();
    full[key] = data;
    full.updatedAt = new Date().toISOString();
    const tmp = `${dbPath}.${Date.now()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(full, null, 2), "utf8");
    fs.renameSync(tmp, dbPath);
    return true;
  } catch (err) {
    console.error("File save error:", err);
    return false;
  }
}

async function saveAllData(allData) {
  if (isPostgres && pgPool) {
    try {
      await saveKeyData("companyProfile", allData.companyProfile || defaultCompanyProfile);
      await saveKeyData("partners", allData.partners || []);
      await saveKeyData("orders", allData.orders || []);
      await saveKeyData("payments", allData.payments || []);
      return true;
    } catch (err) {
      console.error("PostgreSQL bulk save error:", err);
    }
  }

  try {
    const tmp = `${dbPath}.${Date.now()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(allData, null, 2), "utf8");
    fs.renameSync(tmp, dbPath);
    return true;
  } catch (err) {
    console.error("File save error:", err);
    return false;
  }
}

// ─── REST API ENDPOINTS ──────────────────────────────────────────────────────

app.get("/api/status", async (req, res) => {
  const data = await getFullData();
  res.json({
    status: "online",
    engine: isPostgres ? "Railway PostgreSQL" : "Embedded Persistent Storage",
    partnerCount: data.partners.length,
    orderCount: data.orders.length,
    paymentCount: data.payments.length,
    lastUpdated: data.updatedAt,
  });
});

app.get("/api/data", async (req, res) => {
  const data = await getFullData();
  res.json(data);
});

app.post("/api/company", async (req, res) => {
  await saveKeyData("companyProfile", req.body);
  res.json({ success: true, companyProfile: req.body });
});

app.post("/api/partners", async (req, res) => {
  await saveKeyData("partners", req.body);
  res.json({ success: true, partners: req.body });
});

app.post("/api/orders", async (req, res) => {
  await saveKeyData("orders", req.body);
  res.json({ success: true, orders: req.body });
});

app.post("/api/payments", async (req, res) => {
  await saveKeyData("payments", req.body);
  res.json({ success: true, payments: req.body });
});

app.post("/api/restore", async (req, res) => {
  await saveAllData(req.body);
  res.json({ success: true });
});

app.post("/api/clear", async (req, res) => {
  await saveAllData({
    companyProfile: defaultCompanyProfile,
    partners: [],
    orders: [],
    payments: [],
  });
  res.json({ success: true, message: "Workspace cleared" });
});

app.post("/api/demo", async (req, res) => {
  const demoData = {
    companyProfile: defaultCompanyProfile,
    partners: [
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
    ],
    orders: [
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
    ],
    payments: [
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
    ],
  };

  await saveAllData(demoData);
  res.json({ success: true, message: "Demo data loaded" });
});

// ─── STATIC CLIENT ASSETS & SPA ROUTING ──────────────────────────────────────
app.use(express.static(distPath, { maxAge: "1d" }));

app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DISTRICT 88 LTD Server online on port ${PORT}`);
  console.log(`Database: ${isPostgres ? "Connected to Railway PostgreSQL" : "Local Embedded Storage"}`);
});
