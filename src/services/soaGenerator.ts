import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CompanyProfile, OrderInvoice, Partner, PaymentEntry } from "../types";
import { formatCurrency, formatDate } from "./currency";

export function generateStatementOfAccountPDF(
  partner: Partner,
  orders: OrderInvoice[],
  payments: PaymentEntry[],
  company: CompanyProfile
) {
  const doc = new jsPDF();
  const partnerOrders = orders.filter((o) => o.partnerId === partner.id);
  const isClient = partner.type === "client";

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 46, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(company.name, 15, 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text(`${company.legalStatus} | BR No: ${company.registrationNumber}`, 15, 20);
  doc.text("UNIT NO. 532B ON 5/F STAR HOUSE BUILDING, NO.3 SALISBURY ROAD", 15, 26);
  doc.text("TSIM SHA TSUI, HONG KONG", 15, 31);
  doc.setFontSize(7.5);
  doc.text(`Email: ${company.email} | Tel: ${company.phone}`, 15, 37);

  // Statement Badge
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(130, 10, 65, 22, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("STATEMENT OF ACCOUNT", 133, 19);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`As of: ${new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}`, 133, 27);

  // Partner Address Block
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(isClient ? "STATEMENT FOR CUSTOMER:" : "STATEMENT FOR SUPPLIER:", 15, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(partner.companyName, 15, 58);
  doc.text(`Attn: ${partner.name}`, 15, 63);
  doc.text(partner.address, 15, 68);
  doc.text(`Email: ${partner.email} | Tel: ${partner.phone}`, 15, 73);

  // Summary Totals
  const totalBilled = partnerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalSettled = partnerOrders.reduce((sum, o) => sum + o.totalPaid, 0);
  const totalBalanceDue = partnerOrders.reduce((sum, o) => sum + o.balanceDue, 0);
  const mainCurrency = partner.defaultCurrency || "USD";

  doc.setFont("helvetica", "bold");
  doc.text("ACCOUNT SUMMARY:", 130, 52);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Invoiced: ${formatCurrency(totalBilled, mainCurrency)}`, 130, 58);
  doc.text(`Total Settled: ${formatCurrency(totalSettled, mainCurrency)}`, 130, 63);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(185, 28, 28);
  doc.text(`TOTAL OUTSTANDING: ${formatCurrency(totalBalanceDue, mainCurrency)}`, 130, 70);

  // Invoices & Orders Ledger Table
  const tableRows = partnerOrders.map((ord) => [
    ord.date,
    ord.reference,
    ord.title,
    formatDate(ord.dueDate),
    formatCurrency(ord.totalAmount, ord.currency),
    formatCurrency(ord.totalPaid, ord.currency),
    formatCurrency(ord.balanceDue, ord.currency),
    ord.status.toUpperCase(),
  ]);

  if (tableRows.length === 0) {
    tableRows.push(["-", "No transactions", "-", "-", "0.00", "0.00", "0.00", "CLEAR"]);
  }

  autoTable(doc, {
    startY: 82,
    head: [["Date", "Reference", "Description / Batch", "Due Date", "Amount", "Paid", "Balance Due", "Status"]],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold", fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3.5 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25, fontStyle: "bold" },
      2: { cellWidth: 50 },
      3: { cellWidth: 20 },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 22, halign: "right", fontStyle: "bold" },
      7: { cellWidth: 15, halign: "center" },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Bank Wire Details
  doc.setFillColor(241, 245, 249);
  doc.rect(15, Math.min(240, finalY), 180, 40, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(15, Math.min(240, finalY), 180, 40, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("SETTLEMENT BANK DETAILS (ICBC ASIA HONG KONG):", 20, Math.min(240, finalY) + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const bank = company.bankAccounts[0] || {
    bankName: "ICBC (ASIA) - Wanchai Branch (Bank Code: 072)",
    accountName: "DISTRICT88 LIMITED",
    accountNumber: "954.530002.378",
    swiftBic: "UBHKHKHH",
  };

  doc.text(`Bank: ${bank.bankName} | Account Holder: ${bank.accountName}`, 20, Math.min(240, finalY) + 15);
  doc.text(`Account Number: ${bank.accountNumber} | SWIFT / BIC: ${bank.swiftBic}`, 20, Math.min(240, finalY) + 21);
  doc.text(`For payment reconciliation inquiries, please contact: ${company.email}`, 20, Math.min(240, finalY) + 34);

  // Save
  doc.save(`${company.name}_Statement_${partner.companyName.replace(/\s+/g, "_")}.pdf`);
}
