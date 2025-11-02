import jwt from "jsonwebtoken";
import cookie from "cookie";
import { dbConnect } from "../lib/dbConnect";
import User from "../models/User";

export async function requireSuperAdmin(req,res,next) {
  try {
    await dbConnect();
    const { token } = cookie.parse(req.headers.cookie || "");
    if (!token) return res.status(401).json({ success:false });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "superadmin") return res.status(403).json({ success:false, message:"Forbidden" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success:false, message:"Auth failed" });
  }
}

