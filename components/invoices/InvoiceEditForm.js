"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { apiClient } from "../../lib/api";
import { formatCurrency } from "../../lib/utils";
import { FiTrash2, FiPlus } from "react-icons/fi";
import CustomerSelector from "../sale/CustomerSelector";
import PaymentManager from "./PaymentManager";

export default function InvoiceEditForm({ invoice, isOpen, onClose, onSave }) {
  const [items, setItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (isOpen && invoice) {
      // Load invoice items
      setItems(invoice.items || []);
      // Load payments
      setPayments(invoice.payments || []);
      if (invoice.customerId) {
        // If customerId is populated object
        if (typeof invoice.customerId === "object") {
          setSelectedCustomer(invoice.customerId);
        } else {
          // Load customer if it's just an ID
          loadCustomer(invoice.customerId);
        }
      }
      loadProducts();
    }
  }, [isOpen, invoice]);

  const loadProducts = async () => {
    try {
      const data = await apiClient.getProducts();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadCustomer = async (customerId) => {
    try {
      const data = await apiClient.getCustomers();
      if (data.success) {
        const customer = data.customers.find((c) => c._id === customerId);
        if (customer) setSelectedCustomer(customer);
      }
    } catch (error) {
      console.error("Error loading customer:", error);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        name: "",
        qty: 1,
        unitPrice: 0,
        taxRate: 0,
        discount: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    // If product is selected, update product details
    if (field === "productId" && value) {
      const product = products.find((p) => p._id === value);
      if (product) {
        updated[index] = {
          ...updated[index],
          name: product.name,
          unitPrice: product.price,
          taxRate: product.taxRate || 0,
        };
      }
    }

    // Recalculate item total
    const item = updated[index];
    const subtotal = item.unitPrice * item.qty;
    const tax = ((item.taxRate || 0) * subtotal) / 100;
    item.total = subtotal + tax - (item.discount || 0);

    setItems(updated);
  };

  const handleSave = async () => {
    if (items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    try {
      setIsLoading(true);
      const invoiceData = {
        items: items.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
        })),
        customerId: selectedCustomer?._id || null,
        payments: payments,
        paymentStatus: calculatePaymentStatus(totals.total, payments),
      };

      await apiClient.updateInvoice(invoice._id, invoiceData);
      onSave();
      onClose();
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert("Failed to update invoice");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.qty,
      0
    );
    const tax = items.reduce(
      (sum, item) =>
        sum + ((item.taxRate || 0) * item.unitPrice * item.qty) / 100,
      0
    );
    const discount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
    return { subtotal, tax, discount, total: subtotal + tax - discount };
  };

  const calculatePaymentStatus = (totalAmount, paymentList) => {
    const totalPaid = paymentList.reduce((sum, p) => sum + (p.amount || 0), 0);
    if (totalPaid >= totalAmount) return "paid";
    if (totalPaid > 0) return "partially_paid";
    return "issued";
  };

  const totals = calculateTotals();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Invoice {invoice?.invoiceNo}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Customer</label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <span>{selectedCustomer.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowCustomerSelector(true)}
                  className="w-full"
                >
                  Select Customer
                </Button>
              )}
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Items</label>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="md:col-span-2">
                        <label className="text-xs text-muted mb-1 block">
                          Product
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) =>
                            updateItem(index, "productId", e.target.value)
                          }
                          className="w-full h-9 rounded border border-border px-2"
                        >
                          <option value="">Select Product</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted mb-1 block">
                          Qty
                        </label>
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "qty",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          min="1"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted mb-1 block">
                          Price
                        </label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-9"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="text-error"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-muted">Tax: </span>
                      <span className="font-medium">{item.taxRate || 0}%</span>
                      <span className="ml-4 text-muted">Total: </span>
                      <span className="font-medium">
                        {formatCurrency(item.total || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payments */}
            <div className="border-t border-border pt-4">
              <PaymentManager
                payments={payments}
                totalAmount={totals.total}
                onPaymentsChange={setPayments}
                paymentMethods={null} // TODO: Load from company settings
              />
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted">Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(totals.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Tax:</span>
                    <span className="font-medium">
                      {formatCurrency(totals.tax)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-accent border-t border-border pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Selector */}
      {showCustomerSelector && (
        <CustomerSelector
          onSelect={(customer) => {
            setSelectedCustomer(customer);
            setShowCustomerSelector(false);
          }}
          onClose={() => setShowCustomerSelector(false)}
        />
      )}
    </>
  );
}
