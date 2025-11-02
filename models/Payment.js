import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  amount: Number,
  method: String,
  date: { type: Date, default: Date.now },
  reference: String
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

