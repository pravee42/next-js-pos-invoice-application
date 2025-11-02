import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: [
        "office_supplies",
        "travel",
        "utilities",
        "rent",
        "marketing",
        "equipment",
        "maintenance",
        "insurance",
        "taxes",
        "other",
      ],
      default: "other",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "bank_transfer", "cheque"],
      default: "cash",
    },
    date: { type: Date, default: Date.now },
    reference: String, // Receipt number, transaction ID, etc.
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model("Expense", expenseSchema);

