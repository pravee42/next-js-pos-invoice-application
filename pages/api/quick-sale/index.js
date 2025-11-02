import { createRouter } from "next-connect";
import { dbConnect } from "../../../lib/dbConnect";
import Invoice from "../../../models/Invoice";
import Product from "../../../models/Product";
import StockMovement from "../../../models/StockMovement";
import { requireAuth } from "../../../middleware/requireAuth";

const router = createRouter();

router.use(async (req,res,next) => { await dbConnect(); next(); });
router.use(requireAuth);

// Quick sale - creates invoice with type="quick_sale" and status="paid"
router.post(async (req,res) => {
  try {
    const { items=[], payment, payments=[] } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success:false, message:"No items" });
    }

    // Support multiple payments
    const allPayments = payments.length > 0 ? payments : (payment ? [payment] : []);

    // compute totals
    let subtotal = 0, taxTotal = 0;
    const processedItems = [];
    for (const it of items) {
      const prod = await Product.findOne({ _id: it.productId, companyId: req.companyId });
      if (!prod) return res.status(400).json({ success:false, message: `Product not found: ${it.productId}` });

      const unitPrice = it.unitPrice ?? prod.price;
      const totalBeforeTax = unitPrice * it.qty;
      const tax = (prod.taxRate || 0) * totalBeforeTax / 100;
      subtotal += totalBeforeTax;
      taxTotal += tax;

      processedItems.push({
        productId: prod._id,
        name: prod.name,
        qty: it.qty,
        unitPrice,
        taxRate: prod.taxRate || 0,
        discount: it.discount || 0,
        total: totalBeforeTax + tax - (it.discount||0)
      });
    }
    const totalAmount = subtotal + taxTotal;

    // generate invoice number
    const count = await Invoice.countDocuments({ companyId: req.companyId });
    const companyPref = (req.company && req.company.settings && req.company.settings.invoicePrefix) || "INV";
    const invoiceNo = `${companyPref}-QS-${(count + 1).toString().padStart(5,"0")}`;

    // create quick sale invoice
    const invoice = await Invoice.create({
      companyId: req.companyId,
      invoiceNo,
      type: "quick_sale",
      status: "paid",
      customerId: null,
      items: processedItems,
      subtotal,
      taxTotal,
      totalAmount,
      payments: allPayments.filter(p => !p.skipPayment), // Filter out skipPayment flag
      createdBy: req.user._id
    });

    // stock adjustments
    for (const it of processedItems) {
      if (it.qty > 0) {
        await Product.findOneAndUpdate({ _id: it.productId, companyId: req.companyId }, { $inc: { currentStock: -it.qty } });
        await StockMovement.create({
          companyId: req.companyId,
          productId: it.productId,
          type: "out",
          qty: it.qty,
          reference: invoice.invoiceNo,
          byUser: req.user._id
        });
      }
    }

    res.status(201).json({ success: true, invoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message: "Failed to create quick sale" });
  }
});

export default router.handler();

