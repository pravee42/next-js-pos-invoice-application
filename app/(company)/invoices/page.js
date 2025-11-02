"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { apiClient } from "../../../lib/api";
import { formatCurrency, formatDate } from "../../../lib/utils";
import Link from "next/link";
import InvoiceEditForm from "../../../components/invoices/InvoiceEditForm";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getInvoices();
      if (data.success) {
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      paid: "text-success",
      issued: "text-warning",
      draft: "text-muted",
      cancelled: "text-error",
      partially_paid: "text-info",
    };
    return colors[status] || "text-muted";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-accent">Invoices</h1>

      {isLoading ? (
        <div className="text-center py-12 text-muted">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12 text-muted">No invoices found</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Invoice No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="hover:bg-accent/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/invoices/${invoice._id}`}
                          className="font-medium text-accent hover:underline"
                        >
                          {invoice.invoiceNo}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">
                        {formatCurrency(invoice.totalAmount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`capitalize ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted capitalize">
                        {invoice.type || "invoice"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/invoices/${invoice._id}`}
                          className="text-accent hover:underline text-sm"
                        >
                          View
                        </Link>
                        {invoice.status !== "paid" &&
                          invoice.status !== "cancelled" && (
                            <>
                              <span className="mx-2 text-muted">|</span>
                              <button
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowEdit(true);
                                }}
                                className="text-accent hover:underline text-sm"
                              >
                                Edit
                              </button>
                            </>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Invoice Modal */}
      {showEdit && selectedInvoice && (
        <InvoiceEditForm
          invoice={selectedInvoice}
          isOpen={showEdit}
          onClose={() => {
            setShowEdit(false);
            setSelectedInvoice(null);
          }}
          onSave={() => {
            loadInvoices();
            setShowEdit(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
}

