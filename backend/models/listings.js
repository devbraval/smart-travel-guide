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
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    index:true,
  },
  isPublic:{
    type:Boolean,
    default:false,
  },
  lat:{
    type:Number,
    required:true,
  },
  lng:{
    type:Number,
    required:true,
  },

  tags: [String],

}, { timestamps: true });

// Unique constraint
listingSchema.index({ name: 1, district: 1, state: 1 }, { unique: true });

module.exports = mongoose.model("Listing", listingSchema);