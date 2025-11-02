import { createRouter } from "next-connect";
import { dbConnect } from "../../../lib/dbConnect";
import Quotation from "../../../models/Quotation";
import { requireAuth } from "../../../middleware/requireAuth";

const router = createRouter();

router.use(async (req,res,next) => { await dbConnect(); next(); });
router.use(requireAuth);

router.post(async (req,res) => {
  const { customerId, items=[] } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ success:false, message:"No items" });

  const count = await Quotation.countDocuments({ companyId: req.companyId });
  const quoteNo = `QUO-${(count + 1).toString().padStart(5,"0")}`;

  // compute totals
  let subtotal = 0, taxTotal = 0;
  const processed = items.map(it => {
    const total = (it.unitPrice || 0) * (it.qty || 0);
    subtotal += total;
    return { ...it, total };
  });

  const totalAmount = subtotal + taxTotal;

  const quote = await Quotation.create({
    companyId: req.companyId,
    quoteNo,
    customerId,
    items: processed,
    subtotal,
    taxTotal,
    totalAmount,
    createdBy: req.user._id
  });

  res.status(201).json({ success:true, quote });
});

router.get(async (req,res) => {
  const quotes = await Quotation.find({ companyId: req.companyId }).sort({ createdAt:-1 }).limit(200);
  res.json({ success:true, quotes });
});

export default router.handler();

