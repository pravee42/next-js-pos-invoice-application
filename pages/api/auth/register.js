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
    const { name, email, password, companyName, companyEmail } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create company first
    const company = await Company.create({
      name: companyName,
      email: companyEmail,
      subscription: {
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        seats: 5,
        active: true
      },
      settings: { 
        invoicePrefix: companyName ? companyName.split(" ")[0].toUpperCase().substring(0, 3) : "INV" 
      }
    });

    // Create owner user
    const user = await User.create({
      companyId: company._id,
      name,
      email,
      password,
      role: "owner"
    });

    // Generate JWT token
    const token = signToken({
      userId: user._id,
      companyId: company._id,
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

    res.status(201).json({ 
      success: true, 
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      company 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to register" });
  }
});

export default router.handler();

