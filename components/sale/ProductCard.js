"use client";

import { Card, CardContent } from "../ui/card";
import { formatCurrency } from "../../lib/utils";
import { FiPackage } from "react-icons/fi";

export default function ProductCard({ product, onAdd }) {
  const isLowStock =
    product.currentStock !== undefined &&
    product.currentStock <= (product.minStockQty || 5);
  const isOutOfStock =
    product.currentStock !== undefined && product.currentStock === 0;

  return (
    <Card
      className={`cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary ${
        isOutOfStock ? "opacity-60 cursor-not-allowed" : ""
      }`}
      onClick={() => !isOutOfStock && onAdd(product)}
    >
      <CardContent className="p-3 relative">
        <div
          className={`aspect-square bg-card-hover rounded-lg mb-2 flex items-center justify-center relative ${
            isOutOfStock ? "opacity-50" : ""
          }`}
        >
          <FiPackage className="w-8 h-8 text-muted" />
          {isLowStock && !isOutOfStock && (
            <span className="absolute top-1 right-1 px-1.5 py-0.5 text-xs font-semibold bg-warning text-white rounded-full">
              Low
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="px-2 py-0.5 text-xs font-semibold bg-error text-white rounded-full">
                Out
              </span>
            </span>
          )}
        </div>
        <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-2 min-h-[2rem]">
          {product.name}
        </h3>
        <p className="text-sm text-foreground mb-2">
          {formatCurrency(product.price || 0)}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isOutOfStock) onAdd(product);
          }}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center hover:bg-[#059669] transition-colors text-lg font-bold shadow-md"
        >
          +
        </button>
      </CardContent>
    </Card>
  );
}
