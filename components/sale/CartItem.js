"use client";

import { FiPlus, FiMinus, FiX, FiPackage } from "react-icons/fi";
import { Button } from "../ui/button";
import { formatCurrency } from "../../lib/utils";

export default function CartItem({ item, onQtyChange, onRemove }) {
  const price = item.price || item.unitPrice || 0;
  const qty = item.qty || 1;
  const total = price * qty;

  return (
    <div className="flex items-center gap-3 p-3 bg-card-hover rounded-lg border border-border">
      {/* Product Image Placeholder */}
      <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center flex-shrink-0">
        <FiPackage className="w-6 h-6 text-muted" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-foreground mb-1 truncate">
          {item.name}
        </h4>
        <p className="text-xs text-muted">{formatCurrency(price)}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onQtyChange(item._id, Math.max(1, qty - 1))}
          className="h-8 w-8 rounded-lg bg-card hover:bg-card-hover border-border text-foreground transition-colors"
        >
          <FiMinus className="w-4 h-4" />
        </Button>
        <div className="w-8 text-center">
          <span className="font-semibold text-sm text-foreground">{qty}</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onQtyChange(item._id, qty + 1)}
          className="h-8 w-8 rounded-lg bg-card hover:bg-card-hover border-border text-foreground transition-colors"
        >
          <FiPlus className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item._id)}
          className="h-8 w-8 text-error hover:bg-error/10 rounded-lg transition-colors ml-2"
        >
          <FiX className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
