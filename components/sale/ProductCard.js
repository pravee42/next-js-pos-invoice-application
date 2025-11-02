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
      <CardContent className="p-4">
        <div
          className={`aspect-square bg-gradient-to-br from-light to-secondary rounded-xl mb-3 flex items-center justify-center relative ${
            isOutOfStock ? "opacity-50" : ""
          }`}
        >
          <FiPackage className="w-12 h-12 text-accent" />
          {isLowStock && !isOutOfStock && (
            <span className="absolute top-2 right-2 px-2 py-1 text-xs font-semibold bg-warning text-white rounded-full">
              Low
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="px-3 py-1 text-xs font-semibold bg-error text-white rounded-full">
                Out of Stock
              </span>
            </span>
          )}
        </div>
        <h3 className="font-semibold text-foreground mb-1 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <p className="text-xs text-muted mb-2">
          {product.sku ? `SKU: ${product.sku}` : "No SKU"}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-accent">
            {formatCurrency(product.price || 0)}
          </span>
          {product.currentStock !== undefined && (
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                isOutOfStock
                  ? "bg-error/10 text-error"
                  : isLowStock
                  ? "bg-warning/10 text-warning"
                  : "bg-success/10 text-success"
              }`}
            >
              {product.currentStock} in stock
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
