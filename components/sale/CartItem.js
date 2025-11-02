"use client";

import { FiPlus, FiMinus, FiX } from "react-icons/fi";
import { Button } from "../ui/button";
import { formatCurrency } from "../../lib/utils";

export default function CartItem({ item, onQtyChange, onRemove }) {
  const price = item.price || item.unitPrice || 0;
  const qty = item.qty || 1;
  const total = price * qty;

  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-white to-light/30 rounded-sm border border-border hover:border-primary transition-all duration-200 mb-2">
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground mb-1 truncate">
          {item.name}
        </h4>
        <p className="text-sm text-muted">{formatCurrency(price)} each</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onQtyChange(item._id, Math.max(1, qty - 1))}
          className="h-9 w-9 rounded-lg hover:bg-accent hover:text-white transition-colors"
        >
          <FiMinus className="w-4 h-4" />
        </Button>
        <div className="w-12 text-center">
          <span className="font-bold text-lg text-accent">{qty}</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onQtyChange(item._id, qty + 1)}
          className="h-9 w-9 rounded-lg hover:bg-primary hover:text-white transition-colors"
        >
          <FiPlus className="w-4 h-4" />
        </Button>
        <div className="w-24 text-right">
          <span className="font-bold text-lg text-accent">
            {formatCurrency(total)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item._id)}
          className="h-9 w-9 text-error hover:bg-error hover:text-white rounded-lg transition-colors"
        >
          <FiX className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
