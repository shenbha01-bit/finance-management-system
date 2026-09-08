const express = require("express");
const router = express.Router();

const Loan = require("../models/Loan");

// GET all loans
router.get("/", async (req, res) => {
  try {
    const loans = await Loan.find().sort({
      createdAt: -1,
    });

    res.json(loans);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch loans",
      error: error.message,
    });
  }
});

// POST new loan
router.post("/", async (req, res) => {
  try {
    const loan = new Loan(req.body);
    const savedLoan = await loan.save();

    res.status(201).json(savedLoan);
  } catch (error) {
    res.status(400).json({
      message: "Failed to save loan",
      error: error.message,
    });
  }
});

// PUT update loan
router.put("/:id", async (req, res) => {
  try {
    const updatedLoan =
      await Loan.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedLoan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    res.json(updatedLoan);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update loan",
      error: error.message,
    });
  }
});

// DELETE loan
router.delete("/:id", async (req, res) => {
  try {
    const deletedLoan =
      await Loan.findByIdAndDelete(req.params.id);

    if (!deletedLoan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    res.json({
      message: "Loan deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete loan",
      error: error.message,
    });
  }
});

module.exports = router;