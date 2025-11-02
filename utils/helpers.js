// Helper utility functions

export function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN');
}

export function generateInvoiceNumber(prefix, count) {
  return `${prefix}-${(count + 1).toString().padStart(5, "0")}`;
}

