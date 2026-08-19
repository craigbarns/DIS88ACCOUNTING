import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CompanyProfile, OrderInvoice, Partner, PaymentEntry } from "../types";
import { formatCurrency, formatDate } from "./currency";

// EXCEL EXPORT
export function exportToExcel(
  company: CompanyProfile,
  orders: OrderInvoice[],
  payments: PaymentEntry[],
  partners: Partner[]
) {
  const wb = XLSX.utils.book_new();

  // 1. Invoices & Sales
  const salesData = orders
    .filter((o) => o.type === "sale")
    .map((o) => ({
      "Doc Type": o.documentType ? o.documentType.toUpperCase() : "INVOICE",
      "Invoice Ref": o.reference,
      Customer: o.partnerName,
      Title: o.title,
      Date: o.date,
      "Due Date": o.dueDate,
      Currency: o.currency,
      "Total Amount": o.totalAmount,
      "Paid Amount": o.totalPaid,
      "Balance Due": o.balanceDue,
      [`Amount in Base (${company.baseCurrency})`]: (o.totalAmount * (company.exchangeRates[o.currency] ? 1 / company.exchangeRates[o.currency] : 1)).toFixed(2),
      Status: o.status.toUpperCase(),
      Incoterm: o.incoterm || "-",
      "Country of Origin": o.countryOfOrigin || "-",
      "Total Cartons": o.totalCartons || "-",
      "Net Weight": o.netWeight || "-",
      "Gross Weight": o.grossWeight || "-",
      "Measurement (CBM)": o.measurementCbm || "-",
      "Linked PO": o.linkedOrderReference || "-",
    }));
  const wsSales = XLSX.utils.json_to_sheet(salesData);
  XLSX.utils.book_append_sheet(wb, wsSales, "Sales_Invoices");

  // 2. Purchase Orders
  const purchaseData = orders
    .filter((o) => o.type === "purchase")
    .map((o) => ({
      "PO Ref": o.reference,
      Supplier: o.partnerName,
      Title: o.title,
      Date: o.date,
      "Due Date": o.dueDate,
      Currency: o.currency,
      "Total Amount": o.totalAmount,
      "Paid Amount": o.totalPaid,
      "Balance Due": o.balanceDue,
      [`Amount in Base (${company.baseCurrency})`]: (o.totalAmount * (company.exchangeRates[o.currency] ? 1 / company.exchangeRates[o.currency] : 1)).toFixed(2),
      Status: o.status.toUpperCase(),
      "Linked Sale": o.linkedOrderReference || "-",
    }));
  const wsPurchases = XLSX.utils.json_to_sheet(purchaseData);
  XLSX.utils.book_append_sheet(wb, wsPurchases, "Purchase_Orders");

  // 3. Payments Journal
  const paymentsData = payments.map((p) => ({
    "Payment Date": p.paymentDate,
    Type: p.type === "inflow" ? "INFLOW (Customer Deposit/Payment)" : "OUTFLOW (Factory/Supplier)",
    "Order Ref": p.orderReference,
    Partner: p.partnerName,
    "Amount Transacted": p.amount,
    Currency: p.currency,
    [`Converted in Base (${company.baseCurrency})`]: p.convertedAmountBase,
    "Payment Method": p.paymentMethod.toUpperCase(),
    "Bank Account": p.bankAccount,
    "Bank Reference": p.reference,
    Installment: p.installmentTitle || "-",
    Notes: p.notes || "",
  }));
  const wsPayments = XLSX.utils.json_to_sheet(paymentsData);
  XLSX.utils.book_append_sheet(wb, wsPayments, "CashFlow_Journal");

  // 4. Partners Directory
  const partnersData = partners.map((pr) => ({
    Type: pr.type.toUpperCase(),
    Company: pr.companyName,
    Contact: pr.name,
    Email: pr.email,
    Phone: pr.phone,
    Address: pr.address,
    Country: pr.country,
    Currency: pr.defaultCurrency,
    "Payment Terms": pr.paymentTerms,
  }));
  const wsPartners = XLSX.utils.json_to_sheet(partnersData);
  XLSX.utils.book_append_sheet(wb, wsPartners, "Partners_Directory");

  // Save workbook
  const dateStr = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `${company.name.replace(/\s+/g, "_")}_Financial_Export_${dateStr}.xlsx`);
}

// PDF INVOICE / PROFORMA / PURCHASE ORDER GENERATOR
export function generateOrderPDF(
  order: OrderInvoice,
  partner: Partner | undefined,
  company: CompanyProfile
) {
  const doc = new jsPDF();

  // Primary Header Banner (slate-900)
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 46, "F");

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(company.name, 15, 14);

  // Legal Status & BR Number
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text(`${company.legalStatus} | BR No: ${company.registrationNumber}`, 15, 20);

  // Address (Wrapped cleanly on 2 lines)
  doc.text("UNIT NO. 532B ON 5/F STAR HOUSE BUILDING, NO.3 SALISBURY ROAD", 15, 26);
  doc.text("TSIM SHA TSUI, HONG KONG", 15, 31);

  doc.setFontSize(7.5);
  doc.text(`Email: ${company.email} | Tel: ${company.phone}`, 15, 37);

  // Determine Title & Color
  const isProforma = order.documentType === "proforma" || order.reference.startsWith("PI");
  const isSale = order.type === "sale";
  
  let docTitle = "COMMERCIAL INVOICE";
  let badgeColor = [37, 99, 235]; // blue

  if (isProforma) {
    docTitle = "PROFORMA INVOICE";
    badgeColor = [79, 70, 229]; // indigo
  } else if (!isSale) {
    docTitle = "PURCHASE ORDER";
    badgeColor = [13, 148, 136]; // teal
  }

  // Document Title Badge (Right Side)
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(128, 8, 67, 30, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(docTitle, 132, 16);

  doc.setFontSize(10);
  doc.text(order.reference, 132, 24);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  const statusLabel = order.status === "paid" ? "STATUS: PAID IN FULL" : order.status === "partially_paid" ? "STATUS: DEPOSIT RECEIVED" : "STATUS: PAYMENT PENDING";
  doc.text(statusLabel, 132, 32);

  // Metadata block (Billed to / Document details)
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text(isSale ? "BILLED TO / CUSTOMER:" : "ISSUED TO / SUPPLIER:", 15, 54);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  if (partner) {
    doc.setFont("helvetica", "bold");
    doc.text(partner.companyName, 15, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`Attn: ${partner.name}`, 15, 65);
    doc.text(partner.address, 15, 70, { maxWidth: 95 });
    doc.text(`Email: ${partner.email} | Tel: ${partner.phone}`, 15, 78);
    if (partner.taxId || partner.registrationNumber) {
      doc.text(`VAT / Tax ID: ${partner.taxId || partner.registrationNumber}`, 15, 83);
    }
  } else {
    doc.text(order.partnerName, 15, 60);
  }

  // Invoice Details right block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("DOCUMENT DETAILS:", 125, 54);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Date of Issue: ${formatDate(order.date)}`, 125, 60);
  doc.text(`Due Date: ${formatDate(order.dueDate)}`, 125, 65);
  doc.text(`Currency: ${order.currency}`, 125, 70);
  if (order.incoterm || order.shippingTerms) {
    doc.text(`Incoterm: ${order.incoterm || order.shippingTerms}`, 125, 75);
  }
  if (order.countryOfOrigin) {
    doc.text(`Origin: ${order.countryOfOrigin}`, 125, 80);
  }

  // Subject subtitle
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Subject: ${order.title}`, 15, 91);

  // Table of Items (with HS Code column)
  const tableRows = (order.items || []).map((item, index) => [
    (index + 1).toString(),
    item.description,
    item.hsCode || "-",
    item.quantity.toString() + " PCS",
    formatCurrency(item.unitPrice, order.currency),
    formatCurrency(item.total, order.currency),
  ]);

  if (tableRows.length === 0) {
    tableRows.push(["1", order.title, "-", "1 PCS", formatCurrency(order.totalAmount, order.currency), formatCurrency(order.totalAmount, order.currency)]);
  }

  autoTable(doc, {
    startY: 96,
    head: [["#", "Item Description / Specifications", "HS Code", "Qty", "Unit Price", "Total Amount"]],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold", fontSize: 8.5 },
    styles: { fontSize: 8.5, cellPadding: 3.5 },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 78 },
      2: { cellWidth: 24, halign: "center", fontStyle: "bold" },
      3: { cellWidth: 22, halign: "center" },
      4: { cellWidth: 26, halign: "right" },
      5: { cellWidth: 30, halign: "right", fontStyle: "bold" },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Totals Box (Right aligned)
  const totalBoxX = 115;
  doc.setFillColor(248, 250, 252);
  doc.rect(totalBoxX, finalY, 80, 38, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(totalBoxX, finalY, 80, 38, "S");

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal :", totalBoxX + 5, finalY + 7);
  doc.text(formatCurrency(order.subtotal || order.totalAmount, order.currency), totalBoxX + 75, finalY + 7, { align: "right" });

  doc.text(`Tax / VAT (${order.taxRate || 0}%) :`, totalBoxX + 5, finalY + 14);
  doc.text(formatCurrency(order.taxAmount || 0, order.currency), totalBoxX + 75, finalY + 14, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("TOTAL AMOUNT :", totalBoxX + 5, finalY + 23);
  doc.text(formatCurrency(order.totalAmount, order.currency), totalBoxX + 75, finalY + 23, { align: "right" });

  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52); // green-700
  doc.text("Total Paid / Deposits :", totalBoxX + 5, finalY + 29);
  doc.text(formatCurrency(order.totalPaid, order.currency), totalBoxX + 75, finalY + 29, { align: "right" });

  doc.setTextColor(185, 28, 28); // red-700
  doc.setFont("helvetica", "bold");
  doc.text("BALANCE DUE :", totalBoxX + 5, finalY + 35);
  doc.text(formatCurrency(order.balanceDue, order.currency), totalBoxX + 75, finalY + 35, { align: "right" });

  // Down payment & Installments Schedule (Left Side)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("PAYMENT SCHEDULE & DOWN PAYMENTS:", 15, finalY + 6);

  let currentInstY = finalY + 11;
  (order.installments || []).forEach((inst) => {
    const isPaid = inst.status === "paid";
    doc.setFillColor(isPaid ? 240 : 254, isPaid ? 253 : 242, isPaid ? 244 : 242);
    doc.rect(15, currentInstY - 4, 92, 9, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(isPaid ? 22 : 180, isPaid ? 101 : 83, isPaid ? 52 : 9);
    doc.text(`${inst.title} (${formatCurrency(inst.amount, order.currency)})`, 17, currentInstY + 1.5);

    doc.setFont("helvetica", "normal");
    const statusText = isPaid ? `PAID on ${formatDate(inst.paidDate)}` : `Due: ${formatDate(inst.dueDate)}`;
    doc.text(statusText, 105, currentInstY + 1.5, { align: "right" });

    currentInstY += 10.5;
  });

  // International Shipping & Customs Specifications Block (2 Rows Grid as requested)
  const totalPieces = (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const specsY = finalY + 44;

  doc.setFillColor(248, 250, 252);
  doc.rect(15, specsY, 180, 24, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(15, specsY, 180, 24, "S");

  // Grid Row 1
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  // Col 1: Total PCs
  doc.text("Total PCs:", 20, specsY + 5);
  doc.setFont("helvetica", "normal");
  doc.text(`${totalPieces || 10000} PCS`, 20, specsY + 9.5);

  // Col 2: Total Cartons
  doc.setFont("helvetica", "bold");
  doc.text("Total Cartons:", 62, specsY + 5);
  doc.setFont("helvetica", "normal");
  doc.text(order.totalCartons || "40 CTNS", 62, specsY + 9.5);

  // Col 3: Net Weight
  doc.setFont("helvetica", "bold");
  doc.text("Net Weight:", 104, specsY + 5);
  doc.setFont("helvetica", "normal");
  doc.text(order.netWeight || "580 KG", 104, specsY + 9.5);

  // Col 4: Gross Weight
  doc.setFont("helvetica", "bold");
  doc.text("Gross Weight:", 146, specsY + 5);
  doc.setFont("helvetica", "normal");
  doc.text(order.grossWeight || "647 KG", 146, specsY + 9.5);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(15, specsY + 12, 195, specsY + 12);

  // Grid Row 2
  // Col 1: Measurement
  doc.setFont("helvetica", "bold");
  doc.text("Measurement:", 20, specsY + 16.5);
  doc.setFont("helvetica", "normal");
  doc.text(order.measurementCbm || "4.11 CBMS", 20, specsY + 21);

  // Col 2: Country Of Origin
  doc.setFont("helvetica", "bold");
  doc.text("Country Of Origin:", 62, specsY + 16.5);
  doc.setFont("helvetica", "normal");
  doc.text(order.countryOfOrigin || "China", 62, specsY + 21);

  // Col 3: Incoterm
  doc.setFont("helvetica", "bold");
  doc.text("Incoterm:", 104, specsY + 16.5);
  doc.setFont("helvetica", "normal");
  doc.text(order.incoterm || "FOB", 104, specsY + 21);

  // Col 4: Payment Terms
  doc.setFont("helvetica", "bold");
  doc.text("Payment Terms:", 146, specsY + 16.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  const termsText = partner?.paymentTerms || "30% DEPOSIT / BALANCE BEFORE SHIPMENT";
  doc.text(termsText, 146, specsY + 21, { maxWidth: 44 });

  // Bank Wire & Settlement Details Footer
  const footerY = specsY + 28;
  
  doc.setFillColor(241, 245, 249);
  doc.rect(15, footerY, 180, 36, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(15, footerY, 180, 36, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("COMPANY BANK ACCOUNT / SETTLEMENT INSTRUCTIONS (HONG KONG):", 20, footerY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const bank = company.bankAccounts[0] || {
    bankName: "ICBC (ASIA) - Wanchai Branch (Bank Code: 072)",
    accountName: "DISTRICT88 LIMITED",
    accountNumber: "954.530002.378",
    swiftBic: "UBHKHKHH",
  };

  doc.text(`Account Holder : ${bank.accountName}  |  Account Number : ${bank.accountNumber}`, 20, footerY + 12);
  doc.text(`Account Domiciliation : ${bank.bankName}  |  SWIFT : ${bank.swiftBic}`, 20, footerY + 17.5);
  doc.text(`Please quote reference "${order.reference}" in remittance description / payment remarks.`, 20, footerY + 23);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.8);
  doc.text("All banking charges outside beneficiary bank to be borne by remitter.", 20, footerY + 28.5);

  // Save PDF
  doc.save(`${company.name}_${order.reference}.pdf`);
}
