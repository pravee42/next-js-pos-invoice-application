"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { formatCurrency } from "../../lib/utils";
import { PAYMENT_METHODS } from "../../lib/constants";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";

export default function PaymentManager({
  payments = [],
  totalAmount,
  onPaymentsChange,
  paymentMethods = null, // If null, use default from constants
}) {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    method: paymentMethods?.[0] || PAYMENT_METHODS.CASH,
    amount: "",
    reference: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Get available payment methods (dynamic or default)
  const availableMethods = paymentMethods || Object.values(PAYMENT_METHODS);

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const remaining = totalAmount - totalPaid;
  const isFullyPaid = remaining <= 0;

  const handleAddPayment = () => {
    const amount = parseFloat(newPayment.amount) || 0;
    if (amount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    const payment = {
      method: newPayment.method,
      amount: amount,
      date: new Date(newPayment.date || new Date()),
      reference: newPayment.reference || "",
    };

    onPaymentsChange([...payments, payment]);

    // Reset form
    setNewPayment({
      method: paymentMethods?.[0] || PAYMENT_METHODS.CASH,
      amount: "",
      reference: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowAddPayment(false);
  };

  const handleRemovePayment = (index) => {
    const updated = payments.filter((_, i) => i !== index);
    onPaymentsChange(updated);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold mb-1">Payments</h3>
          <div className="text-sm text-muted">
            Total Amount: {formatCurrency(totalAmount)} | Paid:{" "}
            {formatCurrency(totalPaid)} | Remaining:{" "}
            <span className={remaining > 0 ? "text-warning" : "text-success"}>
              {formatCurrency(Math.abs(remaining))}
            </span>
          </div>
        </div>
        {!isFullyPaid && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddPayment(true)}
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add Payment
          </Button>
        )}
      </div>

      {/* Existing Payments */}
      {payments.length > 0 && (
        <div className="space-y-2">
          {payments.map((payment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-border rounded-lg bg-light/30"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium capitalize">
                    {getMethodLabel(payment.method)}
                  </span>
                  <span className="text-sm text-muted">
                    {formatCurrency(payment.amount || 0)}
                  </span>
                  {payment.reference && (
                    <span className="text-xs text-muted">
                      Ref: {payment.reference}
                    </span>
                  )}
                  {payment.date && (
                    <span className="text-xs text-muted">
                      {new Date(payment.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemovePayment(index)}
                className="text-error hover:text-error h-8 w-8"
              >
                <FiTrash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Payment Form */}
      {showAddPayment && (
        <div className="border border-border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Add Payment</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddPayment(false)}
              className="h-6 w-6"
            >
              <FiX className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted mb-1 block">
                Payment Method
              </label>
              <select
                value={newPayment.method}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, method: e.target.value })
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
                value={newPayment.amount}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, amount: e.target.value })
                }
                placeholder="0.00"
                className="h-9"
                max={remaining}
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">
                Reference (Optional)
              </label>
              <Input
                type="text"
                value={newPayment.reference}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, reference: e.target.value })
                }
                placeholder="Transaction ID"
                className="h-9"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddPayment}
                className="w-full h-9"
                disabled={
                  !newPayment.amount || parseFloat(newPayment.amount) <= 0
                }
              >
                Add
              </Button>
            </div>
          </div>
          {remaining > 0 && (
            <p className="text-xs text-muted mt-2">
              Maximum amount: {formatCurrency(remaining)}
            </p>
          )}
        </div>
      )}

      {payments.length === 0 && !showAddPayment && (
        <div className="text-center py-4 text-muted text-sm border border-dashed border-border rounded-lg">
          No payments added yet
        </div>
      )}
    </div>
  );
}
