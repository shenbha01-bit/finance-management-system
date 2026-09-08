const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },

  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Loan",
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  paymentDate: {
    type: Date,
    required: true
  },

  paymentMethod: {
    type: String,
    default: "Cash"
  },

  notes: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model("Payment", paymentSchema);
