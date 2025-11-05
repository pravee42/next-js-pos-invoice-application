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
    <div className="space-y-4 p-3">
      <h1 className="text-2xl font-bold text-accent mb-4">Invoices</h1>

      {isLoading ? (
        <div className="text-center py-8 text-sm text-muted">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted">No invoices found</div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Card key={invoice._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <Link
                      href={`/invoices/${invoice._id}`}
                      className="font-semibold text-base text-accent hover:underline block mb-1"
                    >
                      {invoice.invoiceNo}
                    </Link>
                    <p className="text-xs text-muted mb-2">{formatDate(invoice.date)}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs capitalize ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                      <span className="text-xs text-muted capitalize">
                        • {invoice.type || "invoice"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-base mb-2">
                      {formatCurrency(invoice.totalAmount || 0)}
                    </p>
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/invoices/${invoice._id}`}
                        className="text-xs text-accent hover:underline"
                      >
                        View
                      </Link>
                      {invoice.status !== "paid" &&
                        invoice.status !== "cancelled" && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowEdit(true);
                            }}
                            className="text-xs text-accent hover:underline"
                          >
                            Edit
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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

