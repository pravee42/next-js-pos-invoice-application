import { createRouter } from "next-connect";
import { dbConnect } from "../../../lib/dbConnect";
import Invoice from "../../../models/Invoice";
import Product from "../../../models/Product";
import StockMovement from "../../../models/StockMovement";
import Customer from "../../../models/Customer";
import { requireAuth } from "../../../middleware/requireAuth";

const router = createRouter();

router.use(async (req, res, next) => {
  await dbConnect();
  next();
});
router.use(requireAuth);

// Create invoice (sale or normal invoice)
router.post(async (req, res) => {
  try {
    const {
      type = "invoice",
      customerId = null,
      items = [],
      paymentStatus = "unpaid",
      payment,
      payments = [], // Support multiple payments
    } = req.body;
    // basic validations
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ success: false, message: "No items" });

    // compute totals
    let subtotal = 0,
      taxTotal = 0;
    const processedItems = [];
    for (const it of items) {
      const prod = await Product.findOne({
        _id: it.productId,
        companyId: req.companyId,
      });
      if (!prod)
        return res.status(400).json({
          success: false,
          message: `Product not found: ${it.productId}`,
        });

      const unitPrice = it.unitPrice ?? prod.price;
      const totalBeforeTax = unitPrice * it.qty;
      const tax = ((prod.taxRate || 0) * totalBeforeTax) / 100;
      subtotal += totalBeforeTax;
      taxTotal += tax;

      processedItems.push({
        productId: prod._id,
        name: prod.name,
        qty: it.qty,
        unitPrice,
        taxRate: prod.taxRate || 0,
        discount: it.discount || 0,
        total: totalBeforeTax + tax - (it.discount || 0),
      });
    }
    const totalAmount = subtotal + taxTotal;

    // generate invoice number (simple)
    const count = await Invoice.countDocuments({ companyId: req.companyId });
    const companyPref =
      (req.company &&
        req.company.settings &&
        req.company.settings.invoicePrefix) ||
      "INV";
    const invoiceNo = `${companyPref}-${(count + 1)
      .toString()
      .padStart(5, "0")}`;

    // Calculate total payments
    const allPayments = payments.length > 0 ? payments : (payment ? [payment] : []);
    const totalPaid = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Determine status based on type and payments
    let invoiceStatus = "draft";
    if (type === "quick_sale") {
      invoiceStatus = "paid";
    } else if (payment?.skipPayment || (!payment && !payments.length && paymentStatus === "draft")) {
      invoiceStatus = "draft";
    } else if (totalPaid >= totalAmount) {
      invoiceStatus = "paid";
    } else if (totalPaid > 0) {
      invoiceStatus = "partially_paid";
    } else if (paymentStatus === "draft") {
      invoiceStatus = "draft";
    } else if (paymentStatus === "issued" || (!payment && !payments.length)) {
      invoiceStatus = "issued";
    }

    // create invoice
    const invoice = await Invoice.create({
      companyId: req.companyId,
      invoiceNo,
      type,
      status: invoiceStatus,
      customerId,
      items: processedItems,
      subtotal,
      taxTotal,
      totalAmount,
      payments: allPayments.filter(p => !p.skipPayment), // Filter out skipPayment flag
      createdBy: req.user._id,
    });

    // stock adjustments: for issued or paid invoices we decrement stock (not for drafts)
    if (["issued", "paid"].includes(invoice.status)) {
      for (const it of processedItems) {
        if (it.qty > 0) {
          await Product.findOneAndUpdate(
            { _id: it.productId, companyId: req.companyId },
            { $inc: { currentStock: -it.qty } }
          );
          await StockMovement.create({
            companyId: req.companyId,
            productId: it.productId,
            type: "out",
            qty: it.qty,
            reference: invoice.invoiceNo,
            byUser: req.user._id,
          });
        }
      }
    }

    // update customer balance if needed (not for drafts)
    if (customerId && invoice.totalAmount && invoice.status !== "draft") {
      await Customer.findOneAndUpdate(
        { _id: customerId, companyId: req.companyId },
        { $inc: { balance: invoice.totalAmount } }
      );
    }

    res.status(201).json({ success: true, invoice });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create invoice" });
  }
});

// GET list invoices
router.get(async (req, res) => {
  const invoices = await Invoice.find({ companyId: req.companyId })
    .sort({ createdAt: -1 })
    .limit(200);
  res.json({ success: true, invoices });
});

export default router.handler();
