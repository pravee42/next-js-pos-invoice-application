"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { formatCurrency, calculateTotal } from "../../lib/utils";
import { PAYMENT_METHODS } from "../../lib/constants";

export default function PaymentModal({ cart, isOpen, onClose, onConfirm, isLoading = false }) {
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS.CASH);
  const [paymentAmount, setPaymentAmount] = useState("");
  const { total } = calculateTotal(cart, 18);

  const handleConfirm = () => {
    const amount = parseFloat(paymentAmount) || total;
    const payment = {
      method: selectedMethod,
      amount: amount,
      total: total,
      date: new Date(),
      reference: "",
    };
    onConfirm(payment);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Total Amount</label>
            <div className="text-2xl font-bold text-accent">{formatCurrency(total)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-input px-3 py-2"
            >
              <option value={PAYMENT_METHODS.CASH}>Cash</option>
              <option value={PAYMENT_METHODS.CARD}>Card</option>
              <option value={PAYMENT_METHODS.UPI}>UPI</option>
              <option value={PAYMENT_METHODS.BANK_TRANSFER}>Bank Transfer</option>
              <option value={PAYMENT_METHODS.CHEQUE}>Cheque</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Amount Received</label>
            <Input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder={total.toString()}
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              // Create invoice without payment (draft)
              onConfirm({
                method: "cash",
                amount: 0,
                total: total,
                date: new Date(),
                reference: "",
                skipPayment: true,
              });
            }}
            disabled={isLoading}
            className="w-full sm:w-auto text-muted hover:text-foreground"
          >
            Skip Payment (Draft)
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Processing..." : "Confirm Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

