const express = require("express");
const router = express.Router();

const Payment = require("../models/Payment");

// GET all payments
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// POST new payment
router.post("/", async (req, res) => {
  try {
    const payment = new Payment(req.body);
    const savedPayment = await payment.save();

    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// PUT update payment
router.put("/:id", async (req, res) => {
  console.log("🔥 PAYMENT PUT ROUTE CALLED");
  console.log("ID:", req.params.id);
  console.log("DATA:", req.body);
  try {
    const updatedPayment =
      await Payment.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

    if (!updatedPayment) {
      return res.status(404).json({
        message: "Payment not found"
      });
    }

    res.json(updatedPayment);

  } catch (error) {
    console.error("Payment update error:", error);

    res.status(400).json({
      message: error.message
    });
  }
});

// DELETE payment
router.delete("/:id", async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);

    res.json({
      message: "Payment deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;
