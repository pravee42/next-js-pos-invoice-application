// App Constants

export const COLORS = {
  primary: "#dd9f52",
  secondary: "#dcc894",
  accent: "#2c586e",
  muted: "#8da1af",
  light: "#bed0db",
  dark: "#2b576d",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",
  
  // Products
  PRODUCTS: "/api/products",
  PRODUCT_BY_ID: (id) => `/api/products/${id}`,
  
  // Customers
  CUSTOMERS: "/api/customers",
  
  // Invoices
  INVOICES: "/api/invoices",
  QUICK_SALE: "/api/quick-sale",
  
  // Quotations
  QUOTATIONS: "/api/quotations",
  QUOTATION_BY_ID: (id) => `/api/quotations/${id}`,
  
  // Users
  USERS: "/api/users",
  
  // Companies
  COMPANY_REGISTER: "/api/companies/register",
  COMPANY_SUBSCRIPTION: "/api/companies/subscription",
};

export const USER_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  CASHIER: "cashier",
  SUPERADMIN: "superadmin",
};

export const INVOICE_STATUS = {
  DRAFT: "draft",
  ISSUED: "issued",
  PAID: "paid",
  PARTIALLY_PAID: "partially_paid",
  CANCELLED: "cancelled",
};

export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  UPI: "upi",
  BANK_TRANSFER: "bank_transfer",
  CHEQUE: "cheque",
  WALLET: "wallet",
  CREDIT: "credit",
};

// Payment method labels for display
export const PAYMENT_METHOD_LABELS = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  cheque: "Cheque",
  wallet: "Wallet",
  credit: "Credit",
};

