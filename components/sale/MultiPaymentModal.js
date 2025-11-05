"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { formatCurrency, calculateTotal } from "../../lib/utils";
import { FiArrowLeft, FiLayers, FiPlus, FiX, FiTrash2 } from "react-icons/fi";

export default function MultiPaymentModal({
  cart,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) {
  const [payments, setPayments] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [showSplitPayment, setShowSplitPayment] = useState(false);
  const { total } = calculateTotal(cart, 18);

  useEffect(() => {
    if (isOpen) {
      setSelectedMethod("cash");
      setAmountTendered("");
      setPayments([]);
      setShowSplitPayment(false);
    }
  }, [isOpen]);

  const paymentMethods = ["cash", "card", "mobile", "upi", "wallet"];

  const getMethodLabel = (method) => {
    const labels = {
      cash: "Cash",
      card: "Card",
      mobile: "Mobile",
      upi: "UPI",
      wallet: "Wallet",
    };
    return labels[method] || method;
  };

  // Calculate totals
  const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const remaining = total - totalPaid;
  const isFullyPaid = totalPaid >= total;

  // For single payment mode (cash)
  const amount = parseFloat(amountTendered) || 0;
  const changeDue = amount > total ? amount - total : 0;
  const singlePaymentFullyPaid = !showSplitPayment && amount >= total;

  const quickTenderAmounts = [
    total.toFixed(2),
    (total + 5).toFixed(2),
    (total + 10).toFixed(2),
  ];

  const handleQuickTender = (amount) => {
    setAmountTendered(amount);
  };

  const handleAddPayment = () => {
    if (remaining <= 0) {
      alert("Invoice is already fully paid");
      return;
    }

    setPayments([
      ...payments,
      {
        method: selectedMethod,
        amount: remaining.toFixed(2),
        reference: "",
      },
    ]);
  };

  const handleUpdatePayment = (index, field, value) => {
    const updated = [...payments];
    updated[index][field] = value;
    setPayments(updated);
  };

  const handleRemovePayment = (index) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleSplitPaymentClick = () => {
    setShowSplitPayment(true);
    setAmountTendered("");
    // Add first payment with remaining amount
    if (payments.length === 0) {
      handleAddPayment();
    }
  };

  const handleConfirm = () => {
    if (showSplitPayment) {
      // Multi-payment mode
      const totalPaidAmount = payments.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
      );

      if (totalPaidAmount < total) {
        alert(
          `Total payments (${formatCurrency(totalPaidAmount)}) must be at least equal to total (${formatCurrency(total)})`
        );
        return;
      }

      onConfirm({
        payments: payments.map((p) => ({
          method: p.method,
          amount: parseFloat(p.amount) || 0,
          reference: p.reference || "",
          date: new Date(),
        })),
        total: total,
        totalPaid: totalPaidAmount,
        change: totalPaidAmount > total ? totalPaidAmount - total : 0,
      });
    } else {
      // Single payment mode
      if (!singlePaymentFullyPaid) {
        alert(
          `Amount tendered (${formatCurrency(amount)}) must be at least equal to total (${formatCurrency(total)})`
        );
        return;
      }

      onConfirm({
        payments: [
          {
            method: selectedMethod,
            amount: total,
            date: new Date(),
          },
        ],
        total: total,
        totalPaid: total,
        change: changeDue,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-background text-foreground">
        {/* Top Title */}
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xs text-muted font-normal">Payment Processing</h1>
        </div>

        {/* Header */}
        <div className="bg-card px-4 py-3 flex items-center gap-4 border-b border-border">
          <button onClick={onClose} className="text-foreground">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-semibold text-foreground flex-1">Payment</h2>
        </div>

        <div className="p-4 space-y-6">
          {/* Total Due */}
          <div className="text-center">
            <p className="text-sm text-muted mb-2">Total Due</p>
            <p className="text-4xl font-bold text-foreground">{formatCurrency(total)}</p>
          </div>

          {!showSplitPayment ? (
            <>
              {/* Payment Method Tabs */}
              <div className="flex gap-2">
                {paymentMethods.slice(0, 3).map((method) => (
                  <button
                    key={method}
                    onClick={() => setSelectedMethod(method)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedMethod === method
                        ? "bg-primary text-white"
                        : "bg-card text-foreground hover:bg-card-hover"
                    }`}
                  >
                    {getMethodLabel(method)}
                  </button>
                ))}
              </div>

              {/* Amount Tendered */}
              {selectedMethod === "cash" && (
                <>
                  <div>
                    <p className="text-sm text-muted mb-2">Amount Tendered</p>
                    <Input
                      type="number"
                      value={amountTendered}
                      onChange={(e) => setAmountTendered(e.target.value)}
                      placeholder="0.00"
                      className="text-2xl font-semibold h-14 text-center bg-card border-border text-foreground"
                    />
                  </div>

                  {/* Change Due */}
                  {changeDue > 0 && (
                    <div className="bg-primary rounded-xl p-4 text-white">
                      <p className="text-sm text-white/80 mb-2">Change Due</p>
                      <p className="text-3xl font-bold">{formatCurrency(changeDue)}</p>
                    </div>
                  )}

                  {/* Quick Tender Buttons */}
                  <div className="flex gap-2">
                    {quickTenderAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleQuickTender(amount)}
                        className="flex-1 py-2 px-3 rounded-lg bg-card text-foreground text-sm font-medium hover:bg-card-hover border border-border"
                      >
                        {formatCurrency(parseFloat(amount))}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedMethod !== "cash" && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted mb-4">Enter payment amount</p>
                  <Input
                    type="number"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    placeholder="Enter amount"
                    className="text-xl font-semibold h-12 text-center bg-card border-border text-foreground"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {/* Split Payment Mode */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Multiple Payments</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddPayment}
                    disabled={isFullyPaid}
                    className="text-xs"
                  >
                    <FiPlus className="w-3 h-3 mr-1" />
                    Add Payment
                  </Button>
                </div>

                {payments.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-border rounded-lg text-muted text-sm">
                    No payments added. Click "Add Payment" to add one.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment, index) => (
                      <div
                        key={index}
                        className="p-3 bg-card-hover rounded-lg border border-border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 space-y-2">
                            <select
                              value={payment.method}
                              onChange={(e) =>
                                handleUpdatePayment(index, "method", e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground"
                            >
                              {paymentMethods.map((method) => (
                                <option key={method} value={method}>
                                  {getMethodLabel(method)}
                                </option>
                              ))}
                            </select>
                            <Input
                              type="number"
                              value={payment.amount}
                              onChange={(e) =>
                                handleUpdatePayment(index, "amount", e.target.value)
                              }
                              placeholder="Amount"
                              className="bg-card border-border text-foreground"
                              max={remaining + parseFloat(payment.amount || 0)}
                              min="0"
                            />
                            <Input
                              type="text"
                              value={payment.reference || ""}
                              onChange={(e) =>
                                handleUpdatePayment(index, "reference", e.target.value)
                              }
                              placeholder="Reference (optional)"
                              className="bg-card border-border text-foreground text-xs"
                            />
                          </div>
                          <button
                            onClick={() => handleRemovePayment(index)}
                            className="ml-2 p-2 text-error hover:bg-error/10 rounded-lg"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Payment Summary */}
                {payments.length > 0 && (
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Total Paid:</span>
                      <span className="font-medium">{formatCurrency(totalPaid)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Remaining:</span>
                      <span
                        className={`font-medium ${
                          remaining > 0 ? "text-warning" : "text-success"
                        }`}
                      >
                        {formatCurrency(Math.abs(remaining))}
                      </span>
                    </div>
                    {totalPaid > total && (
                      <div className="bg-primary rounded-lg p-3 text-white">
                        <p className="text-sm text-white/80 mb-1">Change Due</p>
                        <p className="text-xl font-bold">{formatCurrency(totalPaid - total)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {!showSplitPayment ? (
              <Button
                variant="outline"
                onClick={handleSplitPaymentClick}
                className="w-full py-3 bg-card hover:bg-card-hover border-border text-foreground"
              >
                <FiLayers className="w-4 h-4 mr-2" />
                Split Payment
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setShowSplitPayment(false);
                  setPayments([]);
                }}
                className="w-full py-3 bg-card hover:bg-card-hover border-border text-foreground"
              >
                <FiX className="w-4 h-4 mr-2" />
                Single Payment
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              disabled={
                isLoading ||
                (!showSplitPayment && !singlePaymentFullyPaid) ||
                (showSplitPayment && !isFullyPaid)
              }
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold"
            >
              {isLoading ? "Processing..." : "Complete Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
