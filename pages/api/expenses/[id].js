import { createRouter } from "next-connect";
import { dbConnect } from "../../../lib/dbConnect";
import Expense from "../../../models/Expense";
import { requireAuth } from "../../../middleware/requireAuth";

const router = createRouter();

router.use(async (req, res, next) => {
  await dbConnect();
  next();
});
router.use(requireAuth);

// GET single expense
router.get(async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.query.id,
      companyId: req.companyId,
    }).populate("createdBy", "name email");

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    res.json({ success: true, expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch expense" });
  }
});

// PUT update expense
router.put(async (req, res) => {
  try {
    const update = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.query.id, companyId: req.companyId },
      update,
      { new: true }
    );

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    res.json({ success: true, expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update expense" });
  }
});

// DELETE expense
router.delete(async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.query.id,
      companyId: req.companyId,
    });

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete expense" });
  }
});

export default router.handler();

