"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../../lib/api";
import ProductCard from "../../../components/sale/ProductCard";
import CartItem from "../../../components/sale/CartItem";
import SaleSummary from "../../../components/sale/SaleSummary";
import CustomerSelector from "../../../components/sale/CustomerSelector";
import PaymentModal from "../../../components/sale/PaymentModal";
import MultiPaymentModal from "../../../components/sale/MultiPaymentModal";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { calculateTotal } from "../../../lib/utils";
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiX,
  FiCheck,
  FiFileText,
  FiPackage,
} from "react-icons/fi";
import { formatCurrency } from "../../../lib/utils";
import { saveDraft, getDrafts } from "../../../lib/draftStorage";
import DraftManager from "../../../components/sale/DraftManager";

export default function SalePage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDraftManager, setShowDraftManager] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    updateDraftCount();
    // Initial load will happen via the debounced effect when search changes
  }, []);

  const updateDraftCount = () => {
    const drafts = getDrafts();
    setDraftCount(drafts.length);
  };

  const handleSaveDraft = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Add products to save as draft.");
      return;
    }

    const draft = {
      cart: cart.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price || item.unitPrice,
        qty: item.qty || 1,
        productId: item._id,
        unitPrice: item.price || item.unitPrice,
      })),
      customer: selectedCustomer,
      customerId: selectedCustomer?._id || null,
      title: selectedCustomer
        ? `Invoice - ${selectedCustomer.name}`
        : `Quick Sale - ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = saveDraft(draft);
    if (saved) {
      alert("Draft saved successfully!");
      updateDraftCount();
    } else {
      alert("Failed to save draft. Please try again.");
    }
  };

  const handleLoadDraft = (draft) => {
    if (draft.cart && draft.cart.length > 0) {
      setCart(draft.cart);
      if (draft.customer) {
        setSelectedCustomer(draft.customer);
      }
      alert("Draft loaded successfully!");
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const data = await apiClient.getProducts(search); // Pass search query for filtering
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Load products on mount and reload when search changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Initial load
  useEffect(() => {
    if (products.length === 0) {
      loadProducts();
    }
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) {
        return prev.map((p) =>
          p._id === product._id ? { ...p, qty: (p.qty || 1) + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p._id !== id));
  };

  const updateQty = (id, qty) => {
    if (qty < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((p) => (p._id === id ? { ...p, qty } : p)));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Add products to create an invoice.");
      return;
    }
    // Allow checkout without customer (for quick sale)
    setShowPaymentModal(true);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    if (customer) {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentConfirm = async (payment) => {
    try {
      setIsLoading(true);
      const invoiceItems = cart.map((item) => ({
        productId: item._id || item.productId,
        qty: item.qty || 1,
        unitPrice: item.price || item.unitPrice || 0,
        discount: 0,
      }));

      let data;
      if (payment.skipPayment) {
        // Create draft invoice without payment
        data = await apiClient.createInvoice({
          type: "invoice",
          customerId: selectedCustomer?._id || null,
          items: invoiceItems,
          payments: [],
          paymentStatus: "draft",
        });
      } else if (selectedCustomer) {
        // Create invoice with customer (support multiple payments)
        const { total } = calculateTotal(cart, 18);
        const payments = payment.payments || (payment.amount ? [payment] : []);
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        data = await apiClient.createInvoice({
          type: "invoice",
          customerId: selectedCustomer._id,
          items: invoiceItems,
          payments: payments,
          paymentStatus:
            totalPaid >= total
              ? "paid"
              : totalPaid > 0
              ? "partially_paid"
              : "issued",
        });
      } else {
        // Quick sale without customer (support multiple payments)
        const payments = payment.payments || (payment.amount ? [payment] : []);
        data = await apiClient.createQuickSale({
          items: invoiceItems,
          payments: payments,
        });
      }

      if (data.success) {
        // Reset cart and clear any related drafts
        setCart([]);
        setSelectedCustomer(null);
        setShowPaymentModal(false);
        updateDraftCount();

        // Show success message and redirect
        router.push(`/invoices?success=true&invoice=${data.invoice._id}`);
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create invoice. Please try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-white to-light p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-accent mb-2">
              Point of Sale
            </h1>
            <p className="text-muted">Quick sale and invoice generation</p>
          </div>
          {draftCount > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowDraftManager(true)}
              className="flex items-center gap-2"
            >
              <FiFileText className="w-4 h-4" />
              Drafts ({draftCount})
            </Button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Products Section */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search products by name, SKU, or barcode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 text-lg rounded-xl border-2 border-border focus:border-primary"
                />
              </div>
              <p className="text-xs text-muted mt-2">
                {filteredProducts.length} products found
              </p>
            </div>

            {/* Products Grid */}
            {isLoadingProducts ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <FiPackage className="w-16 h-16 text-muted mx-auto mb-4" />
                <p className="text-lg text-muted">No products found</p>
                <p className="text-sm text-muted mt-2">
                  Try a different search term
                </p>
              </div>
            ) : (
              <div className="flex flex-warp flex-row gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAdd={addToCart}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:w-96 xl:w-[420px]">
            <Card className="sticky top-6 h-[calc(100vh-3rem)] flex flex-col shadow-xl border-2 border-border">
              <div className="p-6 border-b border-border bg-gradient-to-r from-accent to-dark text-white rounded-t-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FiShoppingCart className="w-5 h-5" />
                    <h2 className="text-xl font-bold">Cart</h2>
                  </div>
                  {cart.length > 0 && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                      {cart.length} {cart.length === 1 ? "item" : "items"}
                    </span>
                  )}
                </div>

                {/* Customer Selection */}
                {selectedCustomer ? (
                  <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg">
                    <FiUser className="w-4 h-4" />
                    <span className="text-sm truncate flex-1">
                      {selectedCustomer.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedCustomer(null)}
                      className="h-6 w-6 text-white hover:bg-white/20"
                    >
                      <FiX className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowCustomerSelector(true)}
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    <FiUser className="w-4 h-4 mr-2" />
                    Select Customer (Optional)
                  </Button>
                )}
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 bg-white">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <FiShoppingCart className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                    <p className="text-muted font-medium">Cart is empty</p>
                    <p className="text-sm text-muted mt-2">
                      Add products to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <CartItem
                        key={item._id}
                        item={item}
                        onQtyChange={updateQty}
                        onRemove={removeFromCart}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="p-4 border-t border-border bg-gradient-to-br from-white to-light/30">
                <SaleSummary
                  cart={cart}
                  onCheckout={handleCheckout}
                  onSaveDraft={handleSaveDraft}
                  customer={selectedCustomer}
                  isLoading={isLoading}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Customer Selector Modal */}
      {showCustomerSelector && (
        <CustomerSelector
          onSelect={handleCustomerSelect}
          onClose={() => setShowCustomerSelector(false)}
        />
      )}

      {/* Payment Modal - Using MultiPaymentModal for multiple payments */}
      {showPaymentModal && (
        <MultiPaymentModal
          cart={cart}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePaymentConfirm}
          isLoading={isLoading}
        />
      )}

      {/* Draft Manager Modal */}
      {showDraftManager && (
        <DraftManager
          isOpen={showDraftManager}
          onClose={() => {
            setShowDraftManager(false);
            updateDraftCount();
          }}
          onLoadDraft={handleLoadDraft}
        />
      )}
    </div>
  );
}
