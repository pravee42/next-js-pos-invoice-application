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
    <div className="space-y-4 p-3">
      <h1 className="text-2xl font-bold text-accent mb-4">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted mb-1">Products</p>
                <p className="text-xl font-bold text-accent">
                  {stats.totalProducts}
                </p>
              </div>
              <FiPackage className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted mb-1">Customers</p>
                <p className="text-xl font-bold text-accent">
                  {stats.totalCustomers}
                </p>
              </div>
              <FiUsers className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted mb-1">Invoices</p>
                <p className="text-xl font-bold text-accent">
                  {stats.totalInvoices}
                </p>
              </div>
              <FiFileText className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted mb-1">Revenue</p>
                <p className="text-lg font-bold text-accent">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <FiDollarSign className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {stats.recentInvoices.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted">No recent invoices</div>
          ) : (
            <div className="space-y-3">
              {stats.recentInvoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{invoice.invoiceNo}</p>
                    <p className="text-xs text-muted">
                      {formatDate(invoice.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-accent">
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
