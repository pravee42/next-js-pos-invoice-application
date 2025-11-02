import { createRouter } from "next-connect";
import { dbConnect } from "../../../lib/dbConnect";
import User from "../../../models/User";
import Company from "../../../models/Company";
import { requireAuth } from "../../../middleware/requireAuth";

const router = createRouter();

router.use(async (req,res,next) => { await dbConnect(); next(); });
router.use(requireAuth);

// Only company owner/admin should add users: check role
router.post(async (req,res) => {
  if (!["owner","admin","superadmin"].includes(req.user.role)) {
    return res.status(403).json({ success:false, message:"Forbidden" });
  }

  // enforce seats
  const company = await Company.findById(req.companyId);
  const activeUsersCount = await User.countDocuments({ companyId: req.companyId, isActive: true });
  if (activeUsersCount >= (company.subscription.seats || 0)) {
    return res.status(403).json({ success:false, message:"SEATS_EXCEEDED" });
  }

  const { name, email, password, role="admin" } = req.body;
  const u = await User.create({ companyId: req.companyId, name, email, password, role });
  res.status(201).json({ success:true, user: u });
});

// list users for company
router.get(async (req,res) => {
  const users = await User.find({ companyId: req.companyId }).select("-password").limit(200);
  res.json({ success:true, users });
});

export default router.handler();

