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
    role: {
      type: String,
      enum: ["user", "admin", "provider"],
      default: "user",
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
    providerStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    providerInfo: {
      businessName: {
        type: String,

      },
      contactNumber: {
        type: String,

      },

      state: {
        type: String,

      },

      district: {
        type: String,

      },

      address: {
        type: String,
      },

      propertyCount: {
        type: Number,

      },

      description: {
        type: String,
      },
      rejectionReason: {
        type: String,
      },

      serviceType: {
        type: String,
        enum: ["hotel", "villa", "restaurant", "guide", "other"],

      },
    },
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
