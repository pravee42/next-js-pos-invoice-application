import { createRouter } from "next-connect";
import { dbConnect } from "../../../lib/dbConnect";
import Customer from "../../../models/Customer";
import Invoice from "../../../models/Invoice";
import { requireAuth } from "../../../middleware/requireAuth";

const router = createRouter();

router.use(async (req, res, next) => {
  await dbConnect();
  next();
});
router.use(requireAuth);

// GET single customer
router.get(async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.query.id,
      companyId: req.companyId,
    });

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, customer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch customer" });
  }
});

// PUT update customer
router.put(async (req, res) => {
  try {
    const update = req.body;
    const customer = await Customer.findOneAndUpdate(
      { _id: req.query.id, companyId: req.companyId },
      update,
      { new: true }
    );

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, customer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update customer" });
  }
});

// DELETE customer
router.delete(async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.query.id,
      companyId: req.companyId,
    });

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    // Check if customer has any invoices
    const invoiceCount = await Invoice.countDocuments({
      customerId: customer._id,
      companyId: req.companyId,
      status: { $nin: ["cancelled"] },
    });

    if (invoiceCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customer with ${invoiceCount} active invoice(s). Please cancel or delete invoices first.`,
      });
    }

    await Customer.findOneAndDelete({
      _id: req.query.id,
      companyId: req.companyId,
    });

    res.json({ success: true, message: "Customer deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete customer" });
  }
});

export default router.handler();

