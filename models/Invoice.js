import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  qty: Number,
  unitPrice: Number,
  taxRate: Number,
  discount: { type: Number, default: 0 },
  total: Number
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  invoiceNo: { type: String, required: true, index: true },
  type: { type: String, enum: ["invoice","sale","quick_sale"], default: "invoice" },
  status: { type: String, enum: ["draft","issued","paid","partially_paid","cancelled"], default: "issued" },
  date: { type: Date, default: Date.now },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  items: [itemSchema],
  subtotal: Number,
  taxTotal: Number,
  totalAmount: Number,
  payments: [{ method: String, amount: Number, date: Date, reference: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

