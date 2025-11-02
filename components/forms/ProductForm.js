"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function ProductForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  product = null, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    hsn: "",
    price: "",
    cost: "",
    mrp: "",
    stockUnit: "pcs",
    currentStock: "",
    minStockQty: "",
    taxRate: "",
    trackStock: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        hsn: product.hsn || "",
        price: product.price || "",
        cost: product.cost || "",
        mrp: product.mrp || "",
        stockUnit: product.stockUnit || "pcs",
        currentStock: product.currentStock || "",
        minStockQty: product.minStockQty || "",
        taxRate: product.taxRate || "",
        trackStock: product.trackStock !== undefined ? product.trackStock : true,
      });
    } else {
      setFormData({
        name: "",
        sku: "",
        barcode: "",
        hsn: "",
        price: "",
        cost: "",
        mrp: "",
        stockUnit: "pcs",
        currentStock: "",
        minStockQty: "",
        taxRate: "",
        trackStock: true,
      });
    }
  }, [product, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      cost: parseFloat(formData.cost) || 0,
      mrp: parseFloat(formData.mrp) || 0,
      currentStock: parseFloat(formData.currentStock) || 0,
      minStockQty: parseFloat(formData.minStockQty) || 0,
      taxRate: parseFloat(formData.taxRate) || 0,
    };
    onSubmit(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Product Name *</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SKU</label>
              <Input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Enter SKU"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Barcode</label>
              <Input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Enter barcode"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">HSN Code</label>
              <Input
                type="text"
                value={formData.hsn}
                onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                placeholder="Enter HSN code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cost Price</label>
              <Input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">MRP</label>
              <Input
                type="number"
                step="0.01"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Stock Unit</label>
              <select
                value={formData.stockUnit}
                onChange={(e) => setFormData({ ...formData, stockUnit: e.target.value })}
                className="w-full h-10 rounded-lg border border-border bg-input px-3 py-2 text-sm"
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kilogram</option>
                <option value="gm">Gram</option>
                <option value="ltr">Liter</option>
                <option value="ml">Milliliter</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Current Stock</label>
              <Input
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Min Stock Qty</label>
              <Input
                type="number"
                value={formData.minStockQty}
                onChange={(e) => setFormData({ ...formData, minStockQty: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.trackStock}
                  onChange={(e) => setFormData({ ...formData, trackStock: e.target.checked })}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm font-medium">Track Stock</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : product ? "Update Product" : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

