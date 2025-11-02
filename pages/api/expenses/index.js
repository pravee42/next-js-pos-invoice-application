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

// GET expenses list
router.get(async (req, res) => {
  try {
    const { q, category, startDate, endDate } = req.query;
    const filter = { companyId: req.companyId };

    if (q) {
      filter.$or = [
        { description: new RegExp(q, "i") },
        { reference: new RegExp(q, "i") },
        { notes: new RegExp(q, "i") },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter)
      .populate("createdBy", "name email")
      .sort({ date: -1 })
      .limit(500);

    res.json({ success: true, expenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch expenses" });
  }
});

// POST create expense
router.post(async (req, res) => {
  try {
    const payload = {
      ...req.body,
      companyId: req.companyId,
      createdBy: req.user._id,
    };

    const expense = await Expense.create(payload);
    res.status(201).json({ success: true, expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create expense" });
  }
});

export default router.handler();

