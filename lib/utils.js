// Utility Functions

export function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Calculate totals for cart items with dynamic per-item tax rates
 * Each item can have its own taxRate (0 or undefined means no tax)
 *
 * @param {Array} items - Array of items with properties: price/unitPrice, qty, taxRate (optional)
 * @param {Number} defaultTaxRate - Default tax rate if item doesn't have taxRate (default: 18)
 * @returns {Object} Object with subtotal, tax, and total
 */
export function calculateTotal(items, defaultTaxRate = 18) {
  if (!Array.isArray(items) || items.length === 0) {
    return { subtotal: 0, tax: 0, total: 0 };
  }

  let subtotal = 0;
  let taxTotal = 0;

  items.forEach((item) => {
    const unitPrice = item.price || item.unitPrice || 0;
    const qty = item.qty || 0;
    // Use item's taxRate if provided, otherwise use default
    // taxRate of 0 or undefined means no tax for that item
    const itemTaxRate =
      item.taxRate !== undefined && item.taxRate !== null
        ? item.taxRate
        : defaultTaxRate;

    // Calculate item subtotal (before tax)
    const itemSubtotal = unitPrice * qty;
    subtotal += itemSubtotal;

    // Calculate tax on this item (only if taxRate > 0)
    if (itemTaxRate > 0) {
      const itemTax = (itemTaxRate * itemSubtotal) / 100;
      taxTotal += itemTax;
    }
  });

  // Total = subtotal + tax
  const total = subtotal + taxTotal;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(taxTotal * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
