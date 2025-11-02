import mongoose from "mongoose";

const smSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  type: { type: String, enum: ["in","out","adjustment"], default: "out" },
  qty: Number,
  reference: String,
  byUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.models.StockMovement || mongoose.model("StockMovement", smSchema);

