import { createRouter } from "next-connect";
import { dbConnect } from "../../../lib/dbConnect";
import Company from "../../../models/Company";
import { requireSuperAdmin } from "../../../middleware/requireSuperAdmin";

const router = createRouter();

router.use(async (req,res,next) => { await dbConnect(); next(); });
router.use(requireSuperAdmin);

router.post(async (req,res) => {
  const { companyId, startDate, endDate, seats } = req.body;
  const c = await Company.findByIdAndUpdate(companyId, { 
    "subscription.startDate": new Date(startDate), 
    "subscription.endDate": new Date(endDate), 
    "subscription.seats": seats, 
    "subscription.active": new Date(endDate) > new Date() 
  }, { new:true });
  res.json({ success:true, company: c });
});

export default router.handler();

