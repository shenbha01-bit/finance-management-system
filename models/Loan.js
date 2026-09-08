const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    loanAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    interestRate: {
      type: Number,
      required: true,
      min: 0,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalInterest: {
      type: Number,
      required: true,
    },

    totalPayable: {
      type: Number,
      required: true,
    },

    monthlyPayment: {
      type: Number,
      required: true,
    },

    balance: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Loan", loanSchema);
