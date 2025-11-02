import { createRouter } from "next-connect";
import { dbConnect } from "../../../lib/dbConnect";
import Company from "../../../models/Company";
import { requireAuth } from "../../../middleware/requireAuth";

const router = createRouter();

router.use(async (req,res,next) => { await dbConnect(); next(); });
router.use(requireAuth);

// Only superadmin or owner allowed (simple check)
router.post(async (req,res) => {
  if (!["owner","superadmin"].includes(req.user.role)) return res.status(403).json({ success:false, message:"Forbidden" });
  const { companyId, startDate, endDate, seats } = req.body;
  const comp = await Company.findByIdAndUpdate(companyId || req.companyId, { 
    "subscription.startDate": new Date(startDate), 
    "subscription.endDate": new Date(endDate), 
    "subscription.seats": seats 
  }, { new:true });
  res.json({ success:true, company: comp });
});

export default router.handler();

