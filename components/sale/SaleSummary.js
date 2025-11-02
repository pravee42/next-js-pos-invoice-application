"use client";

import { Button } from "../ui/button";
import { formatCurrency, calculateTotal } from "../../lib/utils";
import { FiSave } from "react-icons/fi";

export default function SaleSummary({ 
  cart, 
  onCheckout, 
  onSaveDraft,
  customer,
  isLoading = false 
}) {
  const { subtotal, tax, total } = calculateTotal(cart, 18);

  return (
    <div className="border-t border-border pt-4 mt-4">
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Tax</span>
          <span className="font-medium">{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-accent pt-2 border-t border-border">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {cart.length > 0 && onSaveDraft && (
          <Button
            variant="outline"
            className="w-full rounded-xl py-2.5"
            onClick={onSaveDraft}
            disabled={isLoading}
          >
            <FiSave className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
        )}
        <Button
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-3"
          onClick={onCheckout}
          disabled={cart.length === 0 || isLoading}
        >
          {isLoading ? "Processing..." : "Create Invoice"}
        </Button>
      </div>
    </div>
  );
}

