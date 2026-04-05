const mongoose = require("mongoose");

const earningSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },

  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },

  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing"
  },

  type: {
    type: String,
    enum: ["credit", "debit"],
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  description: String,

  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  }

}, { timestamps: true });

module.exports = mongoose.model("Earning", earningSchema);