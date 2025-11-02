import { createRouter } from "next-connect";
import { dbConnect } from "../../../lib/dbConnect";
import Invoice from "../../../models/Invoice";
import Product from "../../../models/Product";
import StockMovement from "../../../models/StockMovement";
import Customer from "../../../models/Customer";
import { requireAuth } from "../../../middleware/requireAuth";

const router = createRouter();

router.use(async (req, res, next) => {
  await dbConnect();
  next();
});
router.use(requireAuth);

// GET single invoice
router.get(async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.query.id,
      companyId: req.companyId,
    })
      .populate("customerId", "name email phone")
      .populate("createdBy", "name email");

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    res.json({ success: true, invoice });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch invoice" });
  }
});

// PUT update invoice
router.put(async (req, res) => {
  try {
    const { items, paymentStatus, payment, customerId } = req.body;

    const existingInvoice = await Invoice.findOne({
      _id: req.query.id,
      companyId: req.companyId,
    });

    if (!existingInvoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    // Don't allow editing cancelled invoices
    if (existingInvoice.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot edit cancelled invoice`,
      });
    }

    // Allow editing paid invoices only if they're quick sales (flexibility for quick sales)
    if (
      existingInvoice.status === "paid" &&
      existingInvoice.type !== "quick_sale"
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit paid invoice (only quick sales can be edited when paid)`,
      });
    }

    let updateData = {};

    // If items are provided, recalculate totals
    if (items && Array.isArray(items) && items.length > 0) {
      // Reverse previous stock movements if invoice was issued/paid
      if (["issued", "paid"].includes(existingInvoice.status)) {
        for (const oldItem of existingInvoice.items) {
          await Product.findOneAndUpdate(
            { _id: oldItem.productId, companyId: req.companyId },
            { $inc: { currentStock: oldItem.qty } }
          );
        }
      }

      // Compute new totals
      let subtotal = 0,
        taxTotal = 0;
      const processedItems = [];
      for (const it of items) {
        const prod = await Product.findOne({
          _id: it.productId,
          companyId: req.companyId,
        });
        if (!prod) {
          return res.status(400).json({
            success: false,
            message: `Product not found: ${it.productId}`,
          });
        }

        const unitPrice = it.unitPrice ?? prod.price;
        const totalBeforeTax = unitPrice * it.qty;
        // Use product's taxRate (0 means no tax)
        const tax = ((prod.taxRate || 0) * totalBeforeTax) / 100;
        subtotal += totalBeforeTax;
        taxTotal += tax;

        processedItems.push({
          productId: prod._id,
          name: prod.name,
          qty: it.qty,
          unitPrice,
          taxRate: prod.taxRate || 0,
          discount: it.discount || 0,
          total: totalBeforeTax + tax - (it.discount || 0),
        });
      }
      const totalAmount = subtotal + taxTotal;

      updateData = {
        items: processedItems,
        subtotal,
        taxTotal,
        totalAmount,
      };

      // Apply stock movements if status is issued/paid
      if (
        ["issued", "paid"].includes(paymentStatus || existingInvoice.status)
      ) {
        for (const it of processedItems) {
          if (it.qty > 0) {
            await Product.findOneAndUpdate(
              { _id: it.productId, companyId: req.companyId },
              { $inc: { currentStock: -it.qty } }
            );
            await StockMovement.create({
              companyId: req.companyId,
              productId: it.productId,
              type: "out",
              qty: it.qty,
              reference: existingInvoice.invoiceNo,
              byUser: req.user._id,
            });
          }
        }
      }
    }

    // Update payment status if provided
    if (paymentStatus) {
      updateData.status = paymentStatus;
    }

    // Update customer if provided
    if (customerId !== undefined) {
      // Revert old customer balance if invoice was issued/paid
      if (
        existingInvoice.customerId &&
        existingInvoice.totalAmount &&
        existingInvoice.status !== "draft"
      ) {
        await Customer.findOneAndUpdate(
          { _id: existingInvoice.customerId, companyId: req.companyId },
          { $inc: { balance: -existingInvoice.totalAmount } }
        );
      }

      updateData.customerId = customerId;

      // Update new customer balance if status is issued/paid
      if (
        customerId &&
        updateData.totalAmount !== undefined &&
        (paymentStatus || existingInvoice.status) !== "draft"
      ) {
        await Customer.findOneAndUpdate(
          { _id: customerId, companyId: req.companyId },
          {
            $inc: {
              balance: updateData.totalAmount || existingInvoice.totalAmount,
            },
          }
        );
      }
    }

    // Update payments if provided
    if (req.body.payments !== undefined) {
      // Replace all payments with new array
      updateData.payments = req.body.payments;

      // Calculate new status based on payments
      const totalPaid = req.body.payments.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
      );
      const invoiceTotal =
        updateData.totalAmount || existingInvoice.totalAmount;

      if (totalPaid >= invoiceTotal) {
        updateData.status = "paid";
      } else if (totalPaid > 0) {
        updateData.status = "partially_paid";
      } else {
        updateData.status = "issued";
      }
    } else if (payment) {
      // Legacy support: add single payment
      updateData.payments = existingInvoice.payments || [];
      updateData.payments.push(payment);

      // Recalculate status
      const totalPaid = updateData.payments.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
      );
      const invoiceTotal =
        updateData.totalAmount || existingInvoice.totalAmount;

      if (totalPaid >= invoiceTotal) {
        updateData.status = "paid";
      } else if (totalPaid > 0) {
        updateData.status = "partially_paid";
      }
    }

    const updatedInvoice = await Invoice.findOneAndUpdate(
      { _id: req.query.id, companyId: req.companyId },
      updateData,
      { new: true }
    );

    res.json({ success: true, invoice: updatedInvoice });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update invoice" });
  }
});

// DELETE invoice
router.delete(async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.query.id,
      companyId: req.companyId,
    });

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    // Don't allow deleting paid invoices
    if (invoice.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete paid invoice",
      });
    }

    // Reverse stock movements if invoice was issued
    if (["issued", "partially_paid"].includes(invoice.status)) {
      for (const item of invoice.items) {
        await Product.findOneAndUpdate(
          { _id: item.productId, companyId: req.companyId },
          { $inc: { currentStock: item.qty } }
        );
      }
    }

    // Revert customer balance if needed
    if (
      invoice.customerId &&
      invoice.totalAmount &&
      invoice.status !== "draft"
    ) {
      await Customer.findOneAndUpdate(
        { _id: invoice.customerId, companyId: req.companyId },
        { $inc: { balance: -invoice.totalAmount } }
      );
    }

    await Invoice.findOneAndDelete({
      _id: req.query.id,
      companyId: req.companyId,
    });

    res.json({ success: true, message: "Invoice deleted" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete invoice" });
  }
});

// POST cancel invoice
router.post(async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.query.id,
      companyId: req.companyId,
    });

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    // Don't allow cancelling already cancelled invoices
    if (invoice.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Invoice is already cancelled",
      });
    }

    // Reverse stock movements if invoice was issued/paid
    if (["issued", "paid", "partially_paid"].includes(invoice.status)) {
      for (const item of invoice.items) {
        if (item.qty > 0 && item.productId) {
          await Product.findOneAndUpdate(
            { _id: item.productId, companyId: req.companyId },
            { $inc: { currentStock: item.qty } }
          );
        }
      }
    }

    // Revert customer balance if needed
    if (
      invoice.customerId &&
      invoice.totalAmount &&
      invoice.status !== "draft"
    ) {
      await Customer.findOneAndUpdate(
        { _id: invoice.customerId, companyId: req.companyId },
        { $inc: { balance: -invoice.totalAmount } }
      );
    }

    // Update invoice status to cancelled
    const updatedInvoice = await Invoice.findOneAndUpdate(
      { _id: req.query.id, companyId: req.companyId },
      { status: "cancelled" },
      { new: true }
    );

    res.json({
      success: true,
      invoice: updatedInvoice,
      message: "Invoice cancelled",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to cancel invoice" });
  }
});

export default router.handler();
