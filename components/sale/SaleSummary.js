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
    <div className="border-t border-border pt-3 mt-2">
      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between text-xs">
          <span className="text-muted">Subtotal</span>
          <span className="font-medium text-sm">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted">Tax</span>
          <span className="font-medium text-sm">{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-foreground pt-1.5 border-t border-border">
          <span>Grand Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {cart.length > 0 && onSaveDraft && (
          <Button
            variant="outline"
            className="w-full rounded-lg py-2 text-xs"
            onClick={onSaveDraft}
            disabled={isLoading}
          >
            <FiSave className="w-3 h-3 mr-1" />
            Save Draft
          </Button>
        )}
        <Button
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg py-2.5 text-sm font-semibold"
          onClick={onCheckout}
          disabled={cart.length === 0 || isLoading}
        >
          {isLoading ? "Processing..." : "Proceed to Payment"}
        </Button>
      </div>
    </div>
  );
}

