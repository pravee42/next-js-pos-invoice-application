"use client";

import { formatCurrency, formatDate } from "../../lib/utils";
import { FiX } from "react-icons/fi";

export default function InvoicePrint({ invoice, company, onClose }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto print:shadow-none print:max-h-none print:w-full print:p-0">
        {/* Print Button Bar - Hidden when printing */}
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between print:hidden">
          <h2 className="text-xl font-bold text-accent">Print Invoice</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-muted text-white rounded-lg hover:bg-muted/80"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 print:p-4">
          {/* Company Header */}
          <div className="mb-8 print:mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-accent mb-2">
                  {company?.name || "Company Name"}
                </h1>
                {company?.email && (
                  <p className="text-muted text-sm">Email: {company.email}</p>
                )}
                {company?.phone && (
                  <p className="text-muted text-sm">Phone: {company.phone}</p>
                )}
                {company?.address && (
                  <p className="text-muted text-sm mt-2">{company.address}</p>
                )}
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-accent mb-1">INVOICE</h2>
                <p className="text-sm text-muted">#{invoice.invoiceNo}</p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8 print:mb-6">
            <div>
              <h3 className="font-semibold mb-2 text-accent">Bill To:</h3>
              {invoice.customerId ? (
                <>
                  {typeof invoice.customerId === "object" ? (
                    <>
                      <p className="font-medium">{invoice.customerId.name}</p>
                      {invoice.customerId.email && (
                        <p className="text-sm text-muted">
                          {invoice.customerId.email}
                        </p>
                      )}
                      {invoice.customerId.phone && (
                        <p className="text-sm text-muted">
                          {invoice.customerId.phone}
                        </p>
                      )}
                      {invoice.customerId.address && (
                        <p className="text-sm text-muted mt-2">
                          {invoice.customerId.address}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted">
                      Customer ID: {invoice.customerId}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted">Walk-in Customer</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted mb-1">
                <span className="font-medium">Invoice Date:</span>{" "}
                {formatDate(invoice.date || invoice.createdAt)}
              </p>
              <p className="text-sm text-muted mb-1">
                <span className="font-medium">Status:</span>{" "}
                <span className="capitalize">{invoice.status}</span>
              </p>
              {invoice.type && (
                <p className="text-sm text-muted">
                  <span className="font-medium">Type:</span>{" "}
                  <span className="capitalize">{invoice.type}</span>
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8 print:mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-accent/10 border-b-2 border-accent">
                  <th className="text-left p-3 font-semibold text-accent">
                    Item
                  </th>
                  <th className="text-center p-3 font-semibold text-accent">
                    Qty
                  </th>
                  <th className="text-right p-3 font-semibold text-accent">
                    Rate
                  </th>
                  <th className="text-right p-3 font-semibold text-accent">
                    Tax
                  </th>
                  <th className="text-right p-3 font-semibold text-accent">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="p-3">
                      <p className="font-medium">{item.name}</p>
                      {item.productId && (
                        <p className="text-xs text-muted">
                          SKU: {item.productId}
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-center">{item.qty}</td>
                    <td className="p-3 text-right">
                      {formatCurrency(item.unitPrice || 0)}
                    </td>
                    <td className="p-3 text-right">
                      {item.taxRate > 0 ? `${item.taxRate}%` : "No Tax"}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatCurrency(item.total || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8 print:mb-6">
            <div className="w-80 space-y-2">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted">Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(invoice.subtotal || 0)}
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted">Tax:</span>
                <span className="font-medium">
                  {formatCurrency(invoice.taxTotal || 0)}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold text-accent pt-2 border-t-2 border-accent">
                <span>Total:</span>
                <span>{formatCurrency(invoice.totalAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* Payments */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="mb-8 print:mb-6">
              <h3 className="font-semibold mb-3 text-accent">Payments:</h3>
              <div className="space-y-2">
                {invoice.payments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b border-border pb-2"
                  >
                    <span className="text-muted capitalize">
                      {payment.method}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(payment.amount || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-border pt-6 mt-8 print:mt-6">
            <p className="text-center text-sm text-muted">
              Thank you for your business!
            </p>
            <p className="text-center text-xs text-muted mt-2">
              This is a computer-generated invoice.
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:max-h-none {
            max-height: none !important;
          }
          .print\\:w-full {
            width: 100% !important;
          }
          .print\\:p-4 {
            padding: 1rem !important;
          }
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          .print\\:mt-6 {
            margin-top: 1.5rem !important;
          }
          .bg-white {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
