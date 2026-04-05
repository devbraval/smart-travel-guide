const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
  },
  owner: {

    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectionReason: {
    type: String,
    default: ""
  },
  state: {
    type: String,
    required: true,
    index: true,
  },

  district: {
    type: String,
    required: true,
    index: true,
  },

  category: {
    type: String,
    required: true,
    index: true,
  },

  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.5,
  },

  img: {
    type: String,
    required: true,
  },
  images: {
    cover: { type: String, default: "" },
    gallery: [{ type: String }],
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  isUserAdded: {
    type: Boolean,
    default: false,
  },
  price:{
    amount: {
      type: Number,
    },
    type: {
      type: String,
      enum: ["per_night", "per_person", "per_meal","per_day","per_hour","per_service"],
    }
    },
    isBookable: {
      type: Boolean,
      default: false,
  },

  tags: [String],

}, { timestamps: true });

// Unique constraint
listingSchema.index({ name: 1, district: 1, state: 1 }, { unique: true });

module.exports = mongoose.model("Listing", listingSchema);