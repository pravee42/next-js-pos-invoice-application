"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { apiClient } from "../../../lib/api";
import { formatCurrency, formatDate } from "../../../lib/utils";
import { FiPlus } from "react-icons/fi";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getQuotations();
      if (data.success) {
        setQuotations(data.quotes || []);
      }
    } catch (error) {
      console.error("Error loading quotations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-accent">Quotations</h1>
        <Button>
          <FiPlus className="w-4 h-4 mr-2" />
          New Quotation
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted">Loading quotations...</div>
      ) : quotations.length === 0 ? (
        <div className="text-center py-12 text-muted">No quotations found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quotations.map((quote) => (
            <Card key={quote._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{quote.quoteNo}</h3>
                    <p className="text-sm text-muted">{formatDate(quote.date)}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-lg bg-accent/10 text-accent capitalize">
                    {quote.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted">Total</span>
                    <span className="font-semibold text-accent">
                      {formatCurrency(quote.totalAmount || 0)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={async () => {
                      try {
                        const data = await apiClient.convertQuotationToInvoice(quote._id);
                        if (data.success) {
                          alert("Quotation converted to invoice!");
                          loadQuotations();
                        }
                      } catch (error) {
                        console.error("Error converting quotation:", error);
                        alert("Failed to convert quotation");
                      }
                    }}
                  >
                    Convert to Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

