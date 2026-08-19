# DISTRICT 88 LTD — Multi-Currency Payment & Cash Flow Tracker

Custom-built financial management and payment tracking software for **DISTRICT 88 LTD** (Hong Kong).

---

## 🌟 Core Features

### 1. 🌐 Multi-Currency Management (HKD, USD, EUR, CNY/RMB, GBP, SGD...)
- Switchable base currency (USD, HKD, EUR, etc.) with automatic cross-conversion.
- Real-time exchange rates ticker and editable FX rate matrix.
- Native multi-currency ledger without conversion loss.

### 2. 💼 Customer Sales & Down Payments
- Issue and manage sales invoices & proforma documents.
- Flexible **installment templates** (e.g. 30% on order + 70% before BL release, 50/50, 30/40/30, 100% upfront or custom).
- Visual progress bars (% collected vs remaining balance due).
- Overdue and upcoming installment payment alerts.
- **Instant PDF Commercial Invoice generator** with DISTRICT 88 LTD branding & HSBC Hong Kong / FPS wire details.

### 3. 🏭 Supplier Purchases & Factory Deposits
- Purchase orders for manufacturing partners (Shenzhen, Dongguan, Hong Kong, Europe...).
- Track production deposits, QC inspection balances, and shipping release milestones.
- Direct linkage between customer orders and supplier purchase orders.

### 4. 📈 Deal Profitability & Margin Analysis
- Automatic reconciliation: `Customer Sale - Supplier Purchase = Gross Margin ($ and %)`.
- Live comparison between **Projected Gross Margin** and **Net Realized Cash Margin**.

### 5. 💳 Cash Flow Journal & Bank Reconciliation
- Full ledger of all inflows (+) and outflows (-).
- Filter by bank account (*HSBC USD, HSBC HKD, Wise EUR...*), currency, partner, and date range.
- Direct export to **Excel (.xlsx)**.

### 6. 👥 Partners Directory (CRM) & ⚙️ Local Backup
- Comprehensive customer and supplier directory.
- One-click JSON backup & restore (100% private and stored locally on your machine).
- Quick launch script (`start.command`) to open the app with a double-click on Mac.

---

## 🚀 Quick Start

### On Mac:
Double-click `start.command` or run in terminal:

```bash
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173).
