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

router.get(async (req, res) => {
  const p = await Product.findOne({
    _id: req.query.id,
    companyId: req.companyId,
  });
  if (!p) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, product: p });
});

router.put(async (req, res) => {
  const update = req.body;
  const p = await Product.findOneAndUpdate(
    { _id: req.query.id, companyId: req.companyId },
    update,
    { new: true }
  );
  if (!p) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, product: p });
});

router.delete(async (req, res) => {
  await Product.findOneAndDelete({
    _id: req.query.id,
    companyId: req.companyId,
  });
  res.json({ success: true, message: "Deleted" });
});

export default router.handler();
