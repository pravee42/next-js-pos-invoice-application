import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  quoteNo: { type: String, required: true, index: true },
  date: { type: Date, default: Date.now },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    qty: Number,
    unitPrice: Number,
    total: Number
  }],
  subtotal: Number,
  taxTotal: Number,
  totalAmount: Number,
  status: { type: String, enum: ["draft","sent","accepted","rejected"], default: "draft" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.models.Quotation || mongoose.model("Quotation", quotationSchema);

