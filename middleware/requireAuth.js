import jwt from "jsonwebtoken";
import cookie from "cookie";
import { dbConnect } from "../lib/dbConnect";
import User from "../models/User";
import Company from "../models/Company";

export async function requireAuth(req,res,next) {
  try {
    await dbConnect();
    const { token } = cookie.parse(req.headers.cookie || "");
    if (!token) return res.status(401).json({ success:false, message: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ success:false, message: "Invalid token" });

    // load company
    const company = await Company.findById(decoded.companyId);
    if (!company) return res.status(401).json({ success:false, message: "Company not found" });

    // check subscription expiry
    if (!company.subscription.active || new Date(company.subscription.endDate) < new Date()) {
      return res.status(403).json({ success:false, message: "SUBSCRIPTION_EXPIRED" });
    }

    req.user = user;
    req.companyId = decoded.companyId;
    req.company = company;
    req.role = decoded.role;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ success:false, message: "Auth failed" });
  }
}

