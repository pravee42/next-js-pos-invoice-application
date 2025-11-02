"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { apiClient } from "../../../lib/api";
import { formatCurrency, formatDate } from "../../../lib/utils";
import ExpenseForm from "../../../components/forms/ExpenseForm";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiDollarSign } from "react-icons/fi";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getExpenses({ q: search });
      if (data.success) {
        setExpenses(data.expenses || []);
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadExpenses();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (selectedExpense) {
        await apiClient.updateExpense(selectedExpense._id, formData);
      } else {
        await apiClient.createExpense(formData);
      }
      setShowForm(false);
      setSelectedExpense(null);
      loadExpenses();
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const data = await apiClient.deleteExpense(id);
      if (data.success) {
        loadExpenses();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense");
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">Expenses</h1>
          <p className="text-muted mt-1">Track and manage business expenses</p>
        </div>
        <Button onClick={() => {
          setSelectedExpense(null);
          setShowForm(true);
        }}>
          <FiPlus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-accent to-dark text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 mb-1">Total Expenses</p>
              <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
            </div>
            <FiDollarSign className="w-12 h-12 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
        <Input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted">Loading expenses...</div>
      ) : expenses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FiDollarSign className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
            <p className="text-lg text-muted mb-2">No expenses found</p>
            <p className="text-sm text-muted">Start tracking your expenses by adding one</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <Card key={expense._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{expense.description}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span>{formatDate(expense.date)}</span>
                      {expense.category && (
                        <span className="px-2 py-1 bg-accent/10 text-accent rounded-full">
                          {expense.category}
                        </span>
                      )}
                      <span className="capitalize">{expense.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-accent">
                      {formatCurrency(expense.amount || 0)}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                        <FiEdit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense._id)}
                        className="text-error hover:text-error"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ExpenseForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedExpense(null);
        }}
        onSubmit={handleSubmit}
        expense={selectedExpense}
        isLoading={isSubmitting}
      />
    </div>
  );
}

