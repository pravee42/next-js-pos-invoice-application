import { createRouter } from "next-connect";
import { dbConnect } from "../../../lib/dbConnect";
import User from "../../../models/User";
import { requireAuth } from "../../../middleware/requireAuth";

const router = createRouter();

router.use(async (req, res, next) => {
  await dbConnect();
  next();
});
router.use(requireAuth);

// PUT update user/employee
router.put(async (req, res) => {
  try {
    // Only owner/admin can update users
    if (!["owner", "admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Don't allow changing own role to non-admin
    if (req.user._id.toString() === req.query.id && req.body.role) {
      if (!["owner", "admin", "superadmin"].includes(req.body.role)) {
        return res.status(400).json({
          success: false,
          message: "Cannot change your own role to non-admin",
        });
      }
    }

    const update = { ...req.body };
    // Don't allow updating password through this endpoint (use separate password change)
    delete update.password;

    const user = await User.findOneAndUpdate(
      { _id: req.query.id, companyId: req.companyId },
      update,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
});

// DELETE user/employee
router.delete(async (req, res) => {
  try {
    // Only owner/admin can delete users
    if (!["owner", "admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const user = await User.findOne({
      _id: req.query.id,
      companyId: req.companyId,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Don't allow deleting yourself
    if (req.user._id.toString() === req.query.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // Don't allow deleting company owner
    if (user.role === "owner") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete company owner",
      });
    }

    await User.findOneAndDelete({
      _id: req.query.id,
      companyId: req.companyId,
    });

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});

export default router.handler();

