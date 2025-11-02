import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  name: { type: String, required: true },
  phone: String,
  email: String,
  billingAddress: String,
  shippingAddress: String,
  gstin: String,
  openingBalance: { type: Number, default: 0 },
  balance: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Customer || mongoose.model("Customer", customerSchema);

