"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { apiClient } from "../../../lib/api";
import { formatCurrency } from "../../../lib/utils";
import ProductForm from "../../../components/forms/ProductForm";
import { FiPlus, FiSearch, FiEdit, FiTrash2 } from "react-icons/fi";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getProducts(search);
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (selectedProduct) {
        await apiClient.updateProduct(selectedProduct._id, formData);
      } else {
        await apiClient.createProduct(formData);
      }
      setShowForm(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiClient.deleteProduct(id);
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-accent">Products</h1>
        <Button
          onClick={() => {
            setSelectedProduct(null);
            setShowForm(true);
          }}
          className="text-sm px-3 py-2"
        >
          <FiPlus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
        <Input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 text-sm"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-sm text-muted">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted">
          No products found
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {products.map((product) => (
            <Card key={product._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">
                      {product.name}
                    </h3>
                    {product.sku && (
                      <p className="text-xs text-muted mb-2">
                        SKU: {product.sku}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(product)}
                      className="h-8 w-8"
                    >
                      <FiEdit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product._id)}
                      className="h-8 w-8 text-error"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 pt-3 border-t border-border">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted">Price</span>
                    <span className="font-semibold text-sm">
                      {formatCurrency(product.price || 0)}
                    </span>
                  </div>
                  {product.currentStock !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-xs text-muted">Stock</span>
                      <span className="font-semibold text-sm">
                        {product.currentStock}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleSubmit}
        product={selectedProduct}
        isLoading={isSubmitting}
      />
    </div>
  );
}
