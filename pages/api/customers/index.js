import { createRouter } from "next-connect";
import { dbConnect } from "../../../lib/dbConnect";
import Customer from "../../../models/Customer";
import { requireAuth } from "../../../middleware/requireAuth";

const router = createRouter();

router.use(async (req,res,next) => { await dbConnect(); next(); });
router.use(requireAuth);

router.get(async (req,res) => {
  const { q } = req.query;
  const filter = { companyId: req.companyId };
  if (q) filter.name = new RegExp(q, "i");
  const customers = await Customer.find(filter).sort({ createdAt:-1 }).limit(200);
  res.json({ success:true, customers });
});

router.post(async (req,res) => {
  const payload = { ...req.body, companyId: req.companyId };
  const c = await Customer.create(payload);
  res.status(201).json({ success:true, customer: c });
});

export default router.handler();

