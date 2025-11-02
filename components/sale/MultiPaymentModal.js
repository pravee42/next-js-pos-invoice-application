"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { formatCurrency, calculateTotal } from "../../lib/utils";
import { PAYMENT_METHODS } from "../../lib/constants";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";

export default function MultiPaymentModal({
  cart,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  paymentMethods = null, // Dynamic payment methods
}) {
  const [payments, setPayments] = useState([]);
  const { total } = calculateTotal(cart, 18);

  // Get available payment methods (dynamic or default)
  const availableMethods = paymentMethods || Object.values(PAYMENT_METHODS);

  useEffect(() => {
    if (isOpen) {
      // Reset payments when modal opens
      setPayments([]);
    }
  }, [isOpen]);

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const remaining = total - totalPaid;
  const isFullyPaid = remaining <= 0;

  const handleAddPayment = () => {
    if (remaining <= 0) {
      alert("Invoice is already fully paid");
      return;
    }

    setPayments([
      ...payments,
      {
        method: availableMethods[0] || PAYMENT_METHODS.CASH,
        amount: remaining,
        reference: "",
        date: new Date(),
      },
    ]);
  };

  const handleUpdatePayment = (index, field, value) => {
    const updated = [...payments];
    if (field === "amount") {
      updated[index].amount = parseFloat(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setPayments(updated);
  };

  const handleRemovePayment = (index) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    // Allow confirming with no payments (will create draft)
    const totalPaidAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Validate payments don't exceed total
    if (totalPaidAmount > total) {
      alert(`Total payments (${formatCurrency(totalPaidAmount)}) cannot exceed invoice total (${formatCurrency(total)})`);
      return;
    }

    // If no payments but user wants to proceed, create draft
    if (payments.length === 0) {
      handleSkipPayment();
      return;
    }

    onConfirm({
      payments: payments,
      total: total,
      totalPaid: totalPaidAmount,
    });
  };

  const handleSkipPayment = () => {
    onConfirm({
      payments: [],
      total: total,
      totalPaid: 0,
      skipPayment: true,
    });
  };

  const getMethodLabel = (method) => {
    const labels = {
      [PAYMENT_METHODS.CASH]: "Cash",
      [PAYMENT_METHODS.CARD]: "Card",
      [PAYMENT_METHODS.UPI]: "UPI",
      [PAYMENT_METHODS.BANK_TRANSFER]: "Bank Transfer",
      [PAYMENT_METHODS.CHEQUE]: "Cheque",
      [PAYMENT_METHODS.WALLET]: "Wallet",
      [PAYMENT_METHODS.CREDIT]: "Credit",
    };
    return labels[method] || method;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Total Amount</label>
            <div className="text-2xl font-bold text-accent">{formatCurrency(total)}</div>
          </div>

          {/* Payments List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Payments</h4>
              {!isFullyPaid && (
                <Button variant="outline" size="sm" onClick={handleAddPayment}>
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Payment
                </Button>
              )}
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-lg text-muted text-sm">
                No payments added. Click "Add Payment" to add one.
              </div>
            ) : (
              <div className="space-y-2">
                {payments.map((payment, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 border border-border rounded-lg bg-light/30"
                  >
                    <div className="md:col-span-2">
                      <label className="text-xs text-muted mb-1 block">
                        Payment Method
                      </label>
                      <select
                        value={payment.method}
                        onChange={(e) =>
                          handleUpdatePayment(index, "method", e.target.value)
                        }
                        className="w-full h-9 rounded border border-border px-2 text-sm"
                      >
                        {availableMethods.map((method) => (
                          <option key={method} value={method}>
                            {getMethodLabel(method)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted mb-1 block">Amount</label>
                      <Input
                        type="number"
                        value={payment.amount}
                        onChange={(e) =>
                          handleUpdatePayment(index, "amount", e.target.value)
                        }
                        className="h-9"
                        max={remaining + payment.amount}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted mb-1 block">
                        Reference
                      </label>
                      <Input
                        type="text"
                        value={payment.reference || ""}
                        onChange={(e) =>
                          handleUpdatePayment(index, "reference", e.target.value)
                        }
                        placeholder="Optional"
                        className="h-9"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePayment(index)}
                        className="text-error h-9 w-9"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Summary */}
          {payments.length > 0 && (
            <div className="border-t border-border pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Total Paid:</span>
                  <span className="font-medium">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Remaining:</span>
                  <span
                    className={`font-medium ${
                      remaining > 0 ? "text-warning" : "text-success"
                    }`}
                  >
                    {formatCurrency(Math.abs(remaining))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkipPayment}
            disabled={isLoading}
            className="w-full sm:w-auto text-muted hover:text-foreground"
          >
            Skip Payment (Draft)
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Processing..." : "Confirm Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

