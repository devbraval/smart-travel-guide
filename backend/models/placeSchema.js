import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    // 🔹 Basic Details
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Hotel", "PG", "Resort", "Tour Package", "Cab Service"],
      required: true,
    },
    description: {
      type: String,
    },

    // 🔹 Location
    location: {
      state: String,
      city: String,
      address: String,
      lat: Number,
      lng: Number,
    },

    // 🔹 Pricing
    pricing: {
      price: {
        type: Number,
        required: true,
      },
      discountPrice: Number,
      taxesIncluded: {
        type: Boolean,
        default: false,
      },
    },

    // 🔹 Category Specific (Dynamic)
    details: {
      // Hotel / PG / Resort
      rooms: Number,
      roomTypes: [String],
      maxGuests: Number,

      // Cab Service
      vehicleType: String,
      pricePerKm: Number,
      driverIncluded: Boolean,

      // Tour Package
      durationDays: Number,
      includes: [String], // hotel, food, transport
    },

    // 🔹 Images
    images: {
      cover: String,
      gallery: [String],
    },

    // 🔹 Facilities
    facilities: [
      {
        type: String,
        enum: [
          "WiFi",
          "Parking",
          "AC",
          "Food",
          "Swimming Pool",
          "TV",
          "Power",
        ],
      },
    ],

    // 🔹 Availability & Policies
    availability: {
      from: Date,
      to: Date,
      alwaysAvailable: {
        type: Boolean,
        default: false,
      },
      checkIn: String,
      checkOut: String,
    },

    policies: {
      cancellation: String,
      houseRules: String,
    },

    // 🔹 Contact
    contact: {
      phone: String,
      whatsapp: String,
      instantBooking: {
        type: Boolean,
        default: false,
      },
    },

    // 🔹 Owner / Provider
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔹 Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },

  },
  { timestamps: true }
);

export default mongoose.model("Place", placeSchema);