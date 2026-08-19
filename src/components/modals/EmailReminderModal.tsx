import React, { useState } from "react";
import { X, Mail, Copy, Check, ExternalLink, Sparkles } from "lucide-react";
import { OrderInvoice, Partner, CompanyProfile } from "../../types";
import { formatCurrency, formatDate } from "../../services/currency";

interface EmailReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderInvoice | null;
  partner: Partner | undefined;
  company: CompanyProfile;
}

export const EmailReminderModal: React.FC<EmailReminderModalProps> = ({
  isOpen,
  onClose,
  order,
  partner,
  company,
}) => {
  const [templateType, setTemplateType] = useState<"friendly" | "urgent" | "lc_request" | "receipt">("friendly");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const bank = company.bankAccounts[0] || {
    bankName: "ICBC (ASIA) - Wanchai Branch (Bank Code: 072)",
    accountName: "DISTRICT88 LIMITED",
    accountNumber: "954.530002.378",
    swiftBic: "UBHKHKHH",
  };

  const recipientName = partner?.name || "Customer Representative";
  const companyName = partner?.companyName || order.partnerName;
  const amountStr = formatCurrency(order.balanceDue, order.currency);
  const totalStr = formatCurrency(order.totalAmount, order.currency);
  const dueDateStr = formatDate(order.dueDate);

  let subject = "";
  let body = "";

  if (templateType === "friendly") {
    subject = `Payment Reminder: ${company.name} - Invoice ${order.reference} (${amountStr})`;
    body = `Dear ${recipientName},

I hope this email finds you well.

This is a friendly reminder regarding Invoice ${order.reference} for "${order.title}" totaling ${totalStr}.

According to our records, the outstanding balance of ${amountStr} is scheduled for settlement on or before ${dueDateStr}.

Please find our bank wire instructions below for your remittance:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bank Name: ${bank.bankName}
Account Name: ${bank.accountName}
Account Number: ${bank.accountNumber}
SWIFT / BIC: ${bank.swiftBic}
${bank.fpsId ? "Hong Kong FPS ID: " + bank.fpsId + "\n" : ""}Payment Reference: ${order.reference}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Once the transfer is initiated, kindly share the bank wire slip / MT103 confirmation so our finance team can promptly process your order without delay.

Thank you for your valued partnership.

Best regards,

Financial Department
${company.name}
Central, Hong Kong
Email: ${company.email} | Phone: ${company.phone}`;
  } else if (templateType === "urgent") {
    subject = `OVERDUE NOTICE: ${company.name} - Invoice ${order.reference} (${amountStr})`;
    body = `Dear ${recipientName},

We are writing regarding the overdue payment for Invoice ${order.reference} with a balance of ${amountStr}, which matured on ${dueDateStr}.

To ensure that production schedule, cargo shipment, and Bill of Lading (B/L) release proceed without interruption, we kindly request the immediate settlement of this outstanding balance.

Bank Wire Settlement Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bank Name: ${bank.bankName}
Account Name: ${bank.accountName}
Account Number: ${bank.accountNumber}
SWIFT / BIC: ${bank.swiftBic}
Reference: ${order.reference}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please provide us with the bank transaction receipt at your earliest convenience today.

Thank you for your prompt attention to this matter.

Sincerely,

Credit & Accounts Receivable
${company.name} (Hong Kong)`;
  } else if (templateType === "lc_request") {
    subject = `L/C Opening Instructions: ${company.name} - Order ${order.reference}`;
    body = `Dear ${recipientName},

Following confirmation of Order ${order.reference} ("${order.title}"), please instruct your opening bank to issue the Irrevocable Letter of Credit (L/C at sight) with the following beneficiary details:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Beneficiary Name: ${company.name}
Beneficiary Address: ${company.address}, ${company.city}, ${company.country}
Advising / Beneficiary Bank: ${bank.bankName}
SWIFT Code: ${bank.swiftBic}
L/C Amount: ${totalStr}
Latest Shipment Date: ${order.dueDate}
Presentation Period: 21 days after date of onboard Bill of Lading
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please send us the draft L/C for review and confirmation prior to final issuance by your bank.

Best regards,

Trade Finance Team
${company.name}`;
  } else {
    // receipt
    subject = `Payment Acknowledgment: ${company.name} - Invoice ${order.reference}`;
    body = `Dear ${recipientName},

We are pleased to confirm that we have safely received your payment for Invoice ${order.reference}.

• Amount Received: ${formatCurrency(order.totalPaid, order.currency)}
• Remaining Balance: ${amountStr}

Your order status has been updated and manufacturing / dispatch milestones are proceeding as planned.

Thank you very much for your business.

Warm regards,

${company.name}`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const mailtoUrl = `mailto:${partner?.email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Payment Reminder & Email Generator</h3>
              <p className="text-xs text-slate-400">1-Click personalized client follow-up for {order.reference}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Template Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTemplateType("friendly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                templateType === "friendly" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Friendly Reminder
            </button>

            <button
              onClick={() => setTemplateType("urgent")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                templateType === "urgent" ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Urgent Overdue Demand
            </button>

            <button
              onClick={() => setTemplateType("lc_request")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                templateType === "lc_request" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Letter of Credit (L/C) Opening
            </button>

            <button
              onClick={() => setTemplateType("receipt")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                templateType === "receipt" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Payment Receipt
            </button>
          </div>

          {/* Email Preview */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs text-slate-300">
            <div className="pb-2 border-b border-slate-800 text-slate-400">
              <div><strong>To:</strong> {partner?.email || "customer@email.com"} ({companyName})</div>
              <div className="mt-1"><strong>Subject:</strong> <span className="text-white">{subject}</span></div>
            </div>

            <textarea
              readOnly
              value={body}
              rows={12}
              className="w-full bg-transparent font-sans text-xs text-slate-200 focus:outline-none resize-none no-scrollbar leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              * Pre-filled with HSBC Hong Kong wire instructions & invoice particulars.
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Email"}
              </button>

              <a
                href={mailtoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Email App
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
