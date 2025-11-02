import { createRouter } from "next-connect";
import { dbConnect } from "../../../lib/dbConnect";
import Company from "../../../models/Company";
import { requireSuperAdmin } from "../../../middleware/requireSuperAdmin";

const router = createRouter();

router.use(async (req,res,next) => { await dbConnect(); next(); });
router.use(requireSuperAdmin);

router.post(async (req,res) => {
  const { name, email, seats=5 } = req.body;
  const comp = await Company.create({ 
    name, 
    email, 
    settings: { 
      invoicePrefix: name ? name.split(" ")[0].toUpperCase().substring(0, 3) : "INV" 
    }, 
    subscription: { 
      seats, 
      startDate: new Date(), 
      endDate: new Date(new Date().setFullYear(new Date().getFullYear()+1)), 
      active:true 
    } 
  });
  res.status(201).json({ success:true, company: comp });
});

router.get(async (req,res) => {
  const companies = await Company.find().sort({ createdAt: -1 }).limit(500);
  res.json({ success:true, companies });
});

export default router.handler();

