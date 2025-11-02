import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  name: { type: String, required: true },
  sku: String,
  barcode: String,
  hsn: String,
  price: { type: Number, required: true }, // price excluding tax by default
  cost: { type: Number, default: 0 },
  mrp: { type: Number, default: 0 },
  stockUnit: { type: String, default: "pcs" },
  trackStock: { type: Boolean, default: true },
  currentStock: { type: Number, default: 0 },
  minStockQty: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 }, // percentage
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", productSchema);

