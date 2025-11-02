import { createRouter } from "next-connect";
import { dbConnect } from "@/lib/dbConnect";
import Quotation from "@/models/Quotation";
import Invoice from "@/models/Invoice";
import { requireAuth } from "@/middleware/requireAuth";

const router = createRouter();

router.use(async (req, res, next) => {
  await dbConnect();
  next();
});
router.use(requireAuth);

router.get(async (req, res) => {
  const q = await Quotation.findOne({
    _id: req.query.id,
    companyId: req.companyId,
  });
  if (!q) return res.status(404).json({ success: false });
  res.json({ success: true, quote: q });
});

// convert quotation to invoice
router.post(async (req, res) => {
  const q = await Quotation.findOne({
    _id: req.query.id,
    companyId: req.companyId,
  });
  if (!q)
    return res
      .status(404)
      .json({ success: false, message: "Quotation not found" });

  // create invoice
  const count = await Invoice.countDocuments({ companyId: req.companyId });
  const companyPref =
    (req.company &&
      req.company.settings &&
      req.company.settings.invoicePrefix) ||
    "INV";
  const invoiceNo = `${companyPref}-${(count + 1).toString().padStart(5, "0")}`;
  const invoice = await Invoice.create({
    companyId: req.companyId,
    invoiceNo,
    type: "invoice",
    status: "issued",
    customerId: q.customerId,
    items: q.items,
    subtotal: q.subtotal,
    taxTotal: q.taxTotal,
    totalAmount: q.totalAmount,
    createdBy: req.user._id,
  });

  res.json({ success: true, invoice });
});

export default router.handler();
