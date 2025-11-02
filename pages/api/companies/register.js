import { createRouter } from "next-connect";
import cookie from "cookie";
import { dbConnect } from "../../../lib/dbConnect";
import Company from "../../../models/Company";
import User from "../../../models/User";
import { signToken } from "../../../lib/jwt";

const router = createRouter();

router.use(async (req,res,next) => { await dbConnect(); next(); });

router.post(async (req,res) => {
  try {
    const { companyName, companyEmail, ownerName, ownerEmail, ownerPassword, seats=5 } = req.body;
    const company = await Company.create({
      name: companyName, 
      email: companyEmail,
      subscription: {
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear()+1)),
        seats,
        active: true
      },
      settings: { 
        invoicePrefix: companyName ? companyName.split(" ")[0].toUpperCase().substring(0, 3) : "INV" 
      }
    });

    const owner = await User.create({
      companyId: company._id,
      name: ownerName,
      email: ownerEmail,
      password: ownerPassword,
      role: "owner"
    });

    // Generate JWT token
    const token = signToken({
      userId: owner._id,
      companyId: company._id,
      role: owner.role
    });

    // Set cookie
    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    }));

    res.status(201).json({ success:true, company, owner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:"Failed to create company" });
  }
});

export default router.handler();

