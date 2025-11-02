import { createRouter } from "next-connect";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/models/Product";
import { requireAuth } from "@/middleware/requireAuth";

const router = createRouter();

router.use(async (req, res, next) => {
  await dbConnect();
  next();
});
router.use(requireAuth);

// GET products list
router.get(async (req, res) => {
  const { q } = req.query;
  const filter = { companyId: req.companyId };
  if (q)
    filter.$or = [
      { name: new RegExp(q, "i") },
      { sku: new RegExp(q, "i") },
      { barcode: new RegExp(q, "i") },
    ];
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ success: true, products });
});

// POST create product
router.post(async (req, res) => {
  const payload = { ...req.body, companyId: req.companyId };
  const product = await Product.create(payload);
  res.status(201).json({ success: true, product });
});

export default router.handler();
