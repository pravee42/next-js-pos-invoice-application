import { createRouter } from "next-connect";
import cookie from "cookie";
import { dbConnect } from "../../../lib/dbConnect";
import User from "../../../models/User";
import Company from "../../../models/Company";
import { signToken } from "../../../lib/jwt";

const router = createRouter();

router.use(async (req,res,next) => { await dbConnect(); next(); });

router.post(async (req,res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account is inactive" });
    }

    // Load company and check subscription
    const company = await Company.findById(user.companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    if (!company.subscription.active || new Date(company.subscription.endDate) < new Date()) {
      return res.status(403).json({ success: false, message: "SUBSCRIPTION_EXPIRED" });
    }

    // Generate JWT token
    const token = signToken({
      userId: user._id,
      companyId: user.companyId,
      role: user.role
    });

    // Set cookie
    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    }));

    res.json({ 
      success: true, 
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, companyId: user.companyId },
      company 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to login" });
  }
});

export default router.handler();

