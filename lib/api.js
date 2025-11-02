"use client";

import axios from "axios";
import { getToken, removeToken } from "./auth";

const api = axios.create({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// API Methods
export const apiClient = {
  // Auth
  login: async (credentials) => {
    const { data } = await api.post("/api/auth/login", credentials);
    return data;
  },

  register: async (userData) => {
    const { data } = await api.post("/api/auth/register", userData);
    return data;
  },

  logout: async () => {
    const { data } = await api.post("/api/auth/logout");
    removeToken();
    return data;
  },

  // Products
  getProducts: async (query = "") => {
    const { data } = await api.get("/api/products", {
      params: { q: query },
    });
    return data;
  },

  getProduct: async (id) => {
    const { data } = await api.get(`/api/products/${id}`);
    return data;
  },

  createProduct: async (product) => {
    const { data } = await api.post("/api/products", product);
    return data;
  },

  updateProduct: async (id, product) => {
    const { data } = await api.put(`/api/products/${id}`, product);
    return data;
  },

  deleteProduct: async (id) => {
    const { data } = await api.delete(`/api/products/${id}`);
    return data;
  },

  // Customers
  getCustomers: async (query = "") => {
    const { data } = await api.get("/api/customers", {
      params: { q: query },
    });
    return data;
  },

  createCustomer: async (customer) => {
    const { data } = await api.post("/api/customers", customer);
    return data;
  },

  getCustomer: async (id) => {
    const { data } = await api.get(`/api/customers/${id}`);
    return data;
  },

  updateCustomer: async (id, customer) => {
    const { data } = await api.put(`/api/customers/${id}`, customer);
    return data;
  },

  deleteCustomer: async (id) => {
    const { data } = await api.delete(`/api/customers/${id}`);
    return data;
  },

  // Invoices
  getInvoices: async () => {
    const { data } = await api.get("/api/invoices");
    return data;
  },

  createInvoice: async (invoice) => {
    const { data } = await api.post("/api/invoices", invoice);
    return data;
  },

  getInvoice: async (id) => {
    const { data } = await api.get(`/api/invoices/${id}`);
    return data;
  },

  updateInvoice: async (id, invoice) => {
    const { data } = await api.put(`/api/invoices/${id}`, invoice);
    return data;
  },

  deleteInvoice: async (id) => {
    const { data } = await api.delete(`/api/invoices/${id}`);
    return data;
  },

  cancelInvoice: async (id) => {
    const { data } = await api.post(`/api/invoices/${id}`);
    return data;
  },

  createQuickSale: async (sale) => {
    const { data } = await api.post("/api/quick-sale", sale);
    return data;
  },

  // Quotations
  getQuotations: async () => {
    const { data } = await api.get("/api/quotations");
    return data;
  },

  createQuotation: async (quotation) => {
    const { data } = await api.post("/api/quotations", quotation);
    return data;
  },

  convertQuotationToInvoice: async (id) => {
    const { data } = await api.post(`/api/quotations/${id}`);
    return data;
  },

  // Users
  getUsers: async () => {
    const { data } = await api.get("/api/users");
    return data;
  },

  createUser: async (user) => {
    const { data } = await api.post("/api/users", user);
    return data;
  },

  updateUser: async (id, user) => {
    const { data } = await api.put(`/api/users/${id}`, user);
    return data;
  },

  deleteUser: async (id) => {
    const { data } = await api.delete(`/api/users/${id}`);
    return data;
  },

  // Expenses
  getExpenses: async (query = {}) => {
    const { data } = await api.get("/api/expenses", { params: query });
    return data;
  },

  createExpense: async (expense) => {
    const { data } = await api.post("/api/expenses", expense);
    return data;
  },

  getExpense: async (id) => {
    const { data } = await api.get(`/api/expenses/${id}`);
    return data;
  },

  updateExpense: async (id, expense) => {
    const { data } = await api.put(`/api/expenses/${id}`, expense);
    return data;
  },

  deleteExpense: async (id) => {
    const { data } = await api.delete(`/api/expenses/${id}`);
    return data;
  },
};

export default api;
