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
  FiMenu,
  FiArrowLeft,
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
  const [showCartModal, setShowCartModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDraftManager, setShowDraftManager] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    updateDraftCount();
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
    const items = draft.cart || draft.items || [];
    if (items.length > 0) {
      setCart(items);
      if (draft.customer) {
        setSelectedCustomer(draft.customer);
      }
      setShowDraftManager(false);
      // Show cart modal after loading
      setTimeout(() => setShowCartModal(true), 300);
    } else {
      alert("This draft has no items.");
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

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

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
    // Close cart modal and show payment modal
    setShowCartModal(false);
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

      const payments = payment.payments || [];
      const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const { total } = calculateTotal(cart, 18);

      let data;
      if (selectedCustomer) {
        // Create invoice with customer
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
        // Quick sale without customer
        data = await apiClient.createQuickSale({
          items: invoiceItems,
          payments: payments,
        });
      }

      if (data.success) {
        // Reset cart and clear any related drafts
        setCart([]);
        setSelectedCustomer(null);
        setShowCartModal(false);
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

  const cartTotal = calculateTotal(cart, 18).total;
  const cartItemCount = cart.length;

  return (
    <div className="min-h-screen bg-background text-foreground pb-[80px]">
      {/* Top Title - Product Catalog */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xs text-muted font-normal">Product Catalog</h1>
      </div>

      {/* Header Bar with Menu */}
      <div className="bg-card px-4 py-3 flex items-center justify-between">
        {draftCount > 0 && (
          <button
            onClick={() => setShowDraftManager(true)}
            className="relative text-foreground"
          >
            <FiFileText className="w-5 h-5" />
            {draftCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                {draftCount}
              </span>
            )}
          </button>
        )}
        <button
          onClick={() => setShowSearchModal(true)}
          className="text-foreground flex items-center gap-2"
        >
          <FiSearch className="w-5 h-5" /> Search Products
        </button>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="bg-card rounded-xl shadow-lg w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <FiSearch className="w-5 h-5 text-muted" />
                <Input
                  type="text"
                  placeholder="Search products by name, SKU, or barcode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-input border-border text-foreground"
                  autoFocus
                />
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="text-foreground hover:text-muted"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto p-4">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <FiPackage className="w-12 h-12 text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted">No products found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => {
                        addToCart(product);
                        setShowSearchModal(false);
                      }}
                      className="w-full p-3 bg-card-hover rounded-lg hover:bg-card border border-border text-left flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-sm text-foreground mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted">
                          {product.sku && `SKU: ${product.sku} • `}
                          {formatCurrency(product.price || 0)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                          setShowSearchModal(false);
                        }}
                        className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center hover:bg-[#059669] transition-colors text-lg font-bold"
                      >
                        +
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="px-4 py-4">
        {isLoadingProducts ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
            <p className="text-sm text-muted">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="w-12 h-12 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
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

      {/* Cart Footer - Fixed Bottom */}
      {cartItemCount > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-[#10b981] text-white px-4 py-3 rounded-t-xl shadow-lg z-50 flex items-center justify-between cursor-pointer"
          onClick={() => setShowCartModal(true)}
        >
          <div className="flex items-center gap-3">
            <FiShoppingCart className="w-5 h-5" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                Cart: {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
              </span>
              <span className="text-sm font-medium">•</span>
              <span className="text-sm font-semibold">
                {formatCurrency(cartTotal)}
              </span>
            </div>
          </div>
          <button className="text-white hover:opacity-80">
            <FiCheck className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Cart Modal/Drawer - Order Summary */}
      {showCartModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex flex-col"
          onClick={() => setShowCartModal(false)}
        >
          <div
            className="bg-card mt-auto rounded-t-xl max-h-[80vh] flex flex-col p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Order Summary Header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-4">
              <button
                onClick={() => setShowCartModal(false)}
                className="text-foreground"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-semibold text-foreground flex-1">
                Order Summary
              </h2>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <FiShoppingCart className="w-10 h-10 text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted">Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
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

            {/* Summary and Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-border bg-card">
                <SaleSummary
                  cart={cart}
                  onCheckout={handleCheckout}
                  onSaveDraft={handleSaveDraft}
                  customer={selectedCustomer}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Selector Modal */}
      {showCustomerSelector && (
        <CustomerSelector
          onSelect={handleCustomerSelect}
          onClose={() => setShowCustomerSelector(false)}
        />
      )}

      {/* Payment Modal - Using MultiPaymentModal for multiple payments */}
      {showPaymentModal && cart.length > 0 && !showCartModal && (
        <MultiPaymentModal
          cart={cart}
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setShowCartModal(true); // Return to cart modal
          }}
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
