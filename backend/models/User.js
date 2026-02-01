const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ---------- OTP ----------
    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    otpPurpose: {
      type: String,
      enum: ["signup", "login", "reset"],
      default: null,
    },

    otpAttempts: {
      type: Number,
      default: 0,
    },

    lastOtpSentAt: {
      type: Date,
      default: null,
    },

    // ---------- LOGIN FLOW ----------
    loginToken: {
      type: String,
      default: null,
    },

    loginTokenExpiry: {
      type: Date,
      default: null,
    },

    // ---------- PASSWORD RESET ----------
    resetToken: {
      type: String,
      default: null,
    },

    resetTokenExpiry: {
      type: Date,
      default: null,
    },

    // ---------- STATUS ----------
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
