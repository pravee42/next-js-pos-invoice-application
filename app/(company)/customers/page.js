"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { apiClient } from "../../../lib/api";
import { formatCurrency } from "../../../lib/utils";
import CustomerForm from "../../../components/forms/CustomerForm";
import { FiPlus, FiSearch, FiEdit, FiTrash2 } from "react-icons/fi";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (selectedCustomer) {
        await apiClient.updateCustomer(selectedCustomer._id, formData);
      } else {
        await apiClient.createCustomer(formData);
      }
      setShowForm(false);
      setSelectedCustomer(null);
      loadCustomers();
    } catch (error) {
      console.error("Error saving customer:", error);
      alert(error.response?.data?.message || "Failed to save customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      const data = await apiClient.deleteCustomer(id);
      if (data.success) {
        loadCustomers();
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert(error.response?.data?.message || "Failed to delete customer");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-accent">Customers</h1>
        <Button onClick={() => {
          setSelectedCustomer(null);
          setShowForm(true);
        }}>
          <FiPlus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
        <Input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12 text-muted">No customers found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <Card key={customer._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{customer.name}</h3>
                    {customer.phone && (
                      <p className="text-sm text-muted">{customer.phone}</p>
                    )}
                    {customer.email && (
                      <p className="text-sm text-muted">{customer.email}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)}>
                      <FiEdit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(customer._id)}
                      className="text-error hover:text-error"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {customer.balance !== undefined && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between">
                      <span className="text-muted">Balance</span>
                      <span className="font-semibold text-accent">
                        {formatCurrency(customer.balance || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CustomerForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleSubmit}
        customer={selectedCustomer}
        isLoading={isSubmitting}
      />
    </div>
  );
}

