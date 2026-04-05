import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },

  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place", 
    required: true,
  },

  date: {
    type: Date,
    required: true,
  },
  
  toDate: {
    type: Date,
    required: true,
  },

  guests: {
    type: Number,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  }

}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);