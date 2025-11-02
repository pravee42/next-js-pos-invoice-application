"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { apiClient } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/utils";
import { FiPackage, FiUsers, FiFileText, FiDollarSign } from "react-icons/fi";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    recentInvoices: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [products, customers, invoices] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getCustomers(),
        apiClient.getInvoices(),
      ]);

      const totalRevenue = (invoices.data?.invoices || []).reduce(
        (sum, inv) => sum + (inv.totalAmount || 0),
        0
      );

      setStats({
        totalProducts: products.data?.products?.length || 0,
        totalCustomers: customers.data?.customers?.length || 0,
        totalInvoices: invoices.data?.invoices?.length || 0,
        totalRevenue,
        recentInvoices: (invoices.data?.invoices || []).slice(0, 5),
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-accent">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Total Products</p>
                <p className="text-2xl font-bold text-accent">
                  {stats.totalProducts}
                </p>
              </div>
              <FiPackage className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Total Customers</p>
                <p className="text-2xl font-bold text-accent">
                  {stats.totalCustomers}
                </p>
              </div>
              <FiUsers className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Total Invoices</p>
                <p className="text-2xl font-bold text-accent">
                  {stats.totalInvoices}
                </p>
              </div>
              <FiFileText className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-accent">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <FiDollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted">No recent invoices</div>
          ) : (
            <div className="space-y-4">
              {stats.recentInvoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <div>
                    <p className="font-medium">{invoice.invoiceNo}</p>
                    <p className="text-sm text-muted">
                      {formatDate(invoice.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent">
                      {formatCurrency(invoice.totalAmount || 0)}
                    </p>
                    <p className="text-xs text-muted capitalize">
                      {invoice.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
