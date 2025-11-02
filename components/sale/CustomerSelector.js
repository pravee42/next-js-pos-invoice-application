"use client";

import { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { FiSearch, FiX } from "react-icons/fi";

export default function CustomerSelector({ onSelect, onClose }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getCustomers(search);
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Select Customer</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent/10 rounded-lg"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <CardContent className="p-4">
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
            <Input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <button
            onClick={() => {
              onSelect(null);
              onClose();
            }}
            className="w-full p-3 text-left border border-border rounded-lg hover:bg-accent/10 mb-2"
          >
            <div className="font-medium">Skip Customer</div>
            <div className="text-sm text-muted">Quick Sale (No Customer)</div>
          </button>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-muted">Loading...</div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-muted">No customers found</div>
            ) : (
              customers.map((customer) => (
                <button
                  key={customer._id}
                  onClick={() => {
                    onSelect(customer);
                    onClose();
                  }}
                  className="w-full p-3 text-left border border-border rounded-lg hover:bg-accent/10 hover:border-primary transition-colors"
                >
                  <div className="font-medium">{customer.name}</div>
                  {customer.phone && (
                    <div className="text-sm text-muted">{customer.phone}</div>
                  )}
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

