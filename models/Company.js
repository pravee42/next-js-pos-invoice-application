import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  tenantSlug: { type: String, unique: true, sparse: true },
  currency: { type: String, default: "INR" },
  timezone: { type: String, default: "Asia/Kolkata" },
  subscription: {
    startDate: Date,
    endDate: Date,
    seats: { type: Number, default: 5 },
    active: { type: Boolean, default: true }
  },
  settings: {
    invoicePrefix: { type: String, default: "INV" },
    taxInclusive: { type: Boolean, default: false },
    paymentMethods: { 
      type: [String], 
      default: ["cash", "card", "upi", "bank_transfer", "cheque"],
      enum: ["cash", "card", "upi", "bank_transfer", "cheque", "wallet", "credit"]
    }
  }
}, { timestamps: true });

export default mongoose.models.Company || mongoose.model("Company", companySchema);

