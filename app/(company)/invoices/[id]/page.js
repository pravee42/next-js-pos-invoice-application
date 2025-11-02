"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { apiClient } from "../../../../lib/api";
import { formatCurrency, formatDate } from "../../../../lib/utils";
import { FiArrowLeft, FiPrinter, FiEdit, FiX } from "react-icons/fi";
import Link from "next/link";
import InvoicePrint from "../../../../components/invoices/InvoicePrint";
import InvoiceEditForm from "../../../../components/invoices/InvoiceEditForm";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState(null);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadInvoice();
    }
  }, [params.id]);

  const loadInvoice = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getInvoice(params.id);
      if (data.success) {
        setInvoice(data.invoice);
        // Load company info - you may need to add an API endpoint for this
        // For now, using placeholder
        setCompany({
          name: "Your Company Name",
          email: "company@example.com",
          phone: "+91 1234567890",
          address: "Company Address",
        });
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    loadInvoice(); // Reload invoice after edit
  };

  const handleCancel = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel this invoice? This action will reverse stock and customer balance changes."
      )
    )
      return;

    try {
      const data = await apiClient.cancelInvoice(params.id);
      if (data.success) {
        alert("Invoice cancelled successfully");
        loadInvoice();
      }
    } catch (error) {
      console.error("Error cancelling invoice:", error);
      alert(error.response?.data?.message || "Failed to cancel invoice");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      paid: "bg-success/10 text-success",
      issued: "bg-warning/10 text-warning",
      draft: "bg-muted/10 text-muted",
      cancelled: "bg-error/10 text-error",
      partially_paid: "bg-info/10 text-info",
    };
    return colors[status] || "bg-muted/10 text-muted";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted">Loading invoice...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <Link href="/invoices">
          <Button variant="ghost" className="mb-4">
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted">Invoice not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/invoices">
          <Button variant="ghost">
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
        </Link>
        <div className="flex gap-2">
          {/* Allow editing for non-cancelled invoices, including quick sales */}
          {invoice.status !== "cancelled" && (
            <>
              <Button variant="outline" onClick={() => setShowEdit(true)}>
                <FiEdit className="w-4 h-4 mr-2" />
                Edit {invoice.type === "quick_sale" ? "Quick Sale" : "Invoice"}
              </Button>
              {invoice.status !== "paid" && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="text-error border-error hover:bg-error hover:text-white"
                >
                  <FiX className="w-4 h-4 mr-2" />
                  Cancel{" "}
                  {invoice.type === "quick_sale" ? "Quick Sale" : "Invoice"}
                </Button>
              )}
            </>
          )}
          <Button variant="outline" onClick={() => setShowPrint(true)}>
            <FiPrinter className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">
                {invoice.invoiceNo}
              </CardTitle>
              <p className="text-muted">Date: {formatDate(invoice.date)}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(
                invoice.status
              )}`}
            >
              {invoice.status}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Customer Information</h3>
              {invoice.customerId ? (
                <>
                  <p className="text-muted">
                    Customer Name: {invoice.customerId.name}
                  </p>
                  {invoice.customerId.email && (
                    <p className="text-muted">
                      Email: {invoice.customerId.email}
                    </p>
                  )}
                  {invoice.customerId.phone && (
                    <p className="text-muted">
                      Phone: {invoice.customerId.phone}
                    </p>
                  )}
                  {invoice.customerId.address && (
                    <p className="text-muted">
                      Address: {invoice.customerId.address}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted">Walk-in Customer</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Invoice Details</h3>
              <p className="text-muted">Type: {invoice.type || "invoice"}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-semibold mb-4">Items</h3>
            <div className="space-y-2">
              {invoice.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted">
                      {item.qty} × {formatCurrency(item.unitPrice || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(item.total || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(invoice.subtotal || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tax</span>
                <span className="font-medium">
                  {formatCurrency(invoice.taxTotal || 0)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-accent pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatCurrency(invoice.totalAmount || 0)}</span>
              </div>
            </div>
          </div>

          {invoice.payments && invoice.payments.length > 0 && (
            <div className="border-t border-border pt-4 mt-4">
              <h3 className="font-semibold mb-4">Payments</h3>
              <div className="space-y-2">
                {invoice.payments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium capitalize">{payment.method}</p>
                      {payment.reference && (
                        <p className="text-sm text-muted">
                          Ref: {payment.reference}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(payment.amount || 0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Modal */}
      {showPrint && invoice && (
        <InvoicePrint
          invoice={invoice}
          company={company}
          onClose={() => setShowPrint(false)}
        />
      )}

      {/* Edit Modal */}
      {showEdit && invoice && (
        <InvoiceEditForm
          invoice={invoice}
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
