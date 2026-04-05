import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cors from "cors";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

import "./db.js";

import User from "./models/user.js";
import Place from "./models/placeSchema.js";
import sendOtp from "./utils/sendOtp.js";
import generateOtp from "./utils/otp.js";
import { distanceKm } from "./utils/distance.js";
import { getGeoLocation } from "./utils/getGeoLocation.js";
import { getPlaceFromOverpass } from "./utils/getPlaceFromOverpass.js";
import { filterAndShortlist } from "./utils/filterAndShortlist.js";
import { rankplaces } from "./utils/aiRanker.js";
import { filterPlaces } from "./utils/filter.js";
import { runOverpass } from "./utils/overpass.js";
import { reverseGeocode } from "./utils/reverseGeocode.js";
import { processWithAi } from "./utils/ai.js";
import auth from "./middleware/auth.js";
import isAdmin from "./middleware/isAdmin.js";
import { categorizePlaces } from "./utils/categorizePlaces.js";
import sendEmail from "./utils/sendEmail.js";
import Listings from "./models/listings.js";
import Comment from "./models/comments.js";
import user from "./models/user.js";
import Booking from "./models/booking.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080; app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("App is Live");
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.json({ success: false, message: "User already exists" });
    }
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 5);

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        userId: uuidv4(),
        name,
        email,
        password: hashedPassword,
      });
    }
    const token = jwt.sign({
      id: user._id,
      email: user.email,
      role: user.role,
    },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY },
    );
    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.otpPurpose = "signup";
    user.otpAttempts = 0;

    await user.save();
    await sendOtp(email, otp);

    res.json({
      success: true,
      message: "OTP sent to email",
      userId: user._id,
      role: user.role,
      token: token,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.json({
        success: false,
        message: "Please verify your account first",
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.json({ success: false, message: "Wrong password" });
    }
    const token = jwt.sign({
      id: user._id,
      email: user.email,
      role: user.role,
    },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY },
    );
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 5);

    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.otpPurpose = "login";
    user.otpAttempts = 0;

    user.loginToken = uuidv4();
    user.loginTokenExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();
    await sendOtp(email, otp);

    res.json({
      success: true,
      message: "OTP sent",
      loginToken: user.loginToken,
      token,
      userId: user.id,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, loginToken } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.otpPurpose) {
      return res.json({ success: false, message: "Invalid request" });
    }

    if (user.otpPurpose === "login") {
      if (
        !user.loginToken ||
        user.loginToken !== loginToken ||
        user.loginTokenExpiry < Date.now()
      ) {
        return res.json({ success: false, message: "Invalid login flow" });
      }
    }

    if (user.otpExpiry < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    if (user.otpAttempts >= 5) {
      return res.json({ success: false, message: "Too many attempts" });
    }

    const isMatched = await bcrypt.compare(otp, user.otp);
    if (!isMatched) {
      user.otpAttempts += 1;
      await user.save();
      return res.json({ success: false, message: "Invalid OTP" });
    }

    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    user.otpPurpose = null;
    user.isVerified = true;
    user.loginToken = null;
    user.loginTokenExpiry = null;

    await user.save();

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/resend-otp", async (req, res) => {
  try {
    const { email, loginToken } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.otpPurpose) {
      return res.json({ success: false, message: "Invalid request" });
    }

    if (user.otpPurpose === "login") {
      if (
        !loginToken ||
        user.loginToken !== loginToken ||
        user.loginTokenExpiry < Date.now()
      ) {
        return res.json({ success: false, message: "Invalid request" });
      }
    }

    const otp = generateOtp();
    user.otp = await bcrypt.hash(otp, 5);
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.otpAttempts = 0;

    await user.save();
    await sendOtp(email, otp);

    res.json({ success: true, message: "OTP resent" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: true,
        message: "If the email exists, OTP has been sent",
      });
    }

    const otp = generateOtp();
    user.otp = await bcrypt.hash(otp, 5);
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.otpPurpose = "reset";
    user.otpAttempts = 0;

    await user.save();
    await sendOtp(email, otp);

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.otpPurpose !== "reset") {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    const isMatched = await bcrypt.compare(otp, user.otp);
    if (!isMatched) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    user.resetToken = uuidv4();
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    user.otpPurpose = null;

    await user.save();

    res.json({ success: true, resetToken: user.resetToken });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { email, resetToken, password } = req.body;

    const user = await User.findOne({ email, resetToken });
    if (!user || user.resetTokenExpiry < Date.now()) {
      return res.json({ success: false, message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.get("/dashboard", auth, async (req, res) => {
  try {
    const { sortBy } = req.query;

    let query = { status: "approved" };

    let sortOption = {};

    if (sortBy === "rating") sortOption.rating = -1;
    if (sortBy === "name") sortOption.name = 1;

    const listingPlaces = await Listings.find(query).sort(sortOption);
    const providerPlaces = await Place.find(query).sort(sortOption);

    // Merge results from both collections
    const allPlaces = [...listingPlaces, ...providerPlaces];

    res.json({
      success: true,
      result: allPlaces
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
app.get("/place/:id", auth, async (req, res) => {
  try {
    let place = await Listings.findById(req.params.id);
    if (!place) {
      place = await Place.findById(req.params.id);
    }
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    const activeBooking = await Booking.findOne({
      listing: req.params.id,
      toDate: { $gte: new Date() },
      status: "confirmed"
    });

    res.status(200).json({
      success: true,
      result: { ...place._doc, isBooked: !!activeBooking },
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
    });
  }
});
app.post("/add-place", auth, async (req, res) => {
  try {
    const { name, description, state, district, category, rating, img, images, lat, lng } = req.body;
    if (!name || !description || !state || !district || !category || !rating || !lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "something went wrong",
      });
    }

    const finalImg = img || (images && images.cover) || "";
    if (!finalImg) {
      return res.status(400).json({ success: false, message: "Cover image is required" });
    }

    const newListing = new Listings({
      name,
      description,
      state,
      district,
      category,
      rating,
      img: finalImg,
      images: images || { cover: finalImg, gallery: [] },
      lat,
      lng,
      owner: req.user.id,
      status: "pending",
      isUserAdded: true,
    });
    await newListing.save();
    res.status(200).json({
      success: true,
      listing: newListing,
    });
  } catch (err) {
    console.error("Add Place Error:", err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Place already exists in this location",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }

});
app.get("/edit-place/:id", auth, async (req, res) => {
  try {
    const place = await Listings.findOne({
      _id: req.params.id,
    });
    if (!place) {
      return res.status(401).json({
        success: false,
        message: "Place not founded",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Place founded",
      result: place,
    });
  } catch (err) {
    return res.status(401).json({
      success: true,
      message: "Server Error",
    });
  }
});
app.put("/edit-place/:id", auth, async (req, res) => {
  try {
    const updatedPlace = await Listings.findOneAndUpdate(
      {
        owner: req.user.id,
        _id: req.params.id,
      },
      req.body,
      { new: true, runValidators: true },
    );
    if (!updatedPlace) {
      return res.status(403).json({
        success: false,
        message: "Not Authorized",
      });
    }
    return res.status(200).json({
      success: true,
      result: updatedPlace,
    });
  } catch (err) {
    return res.status(501).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.delete("/delete-place/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    let query = { _id: req.params.id };
    if (req.user.role !== "admin") {
      query.owner = new mongoose.Types.ObjectId(userId);
    }
    const deletePlace = await Listings.findOneAndDelete(query);
    if (!deletePlace) {
      return res.status(404).json({
        success: false,
        message: "Place not found and not authorized",
      });

    }
    return res.status(200).json({
      success: true,
      message: "Place Deleted Successfully",
    });
  } catch (err) {
    return res.status(501).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.post("/add-comments/:id", auth, async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const placeId = req.params.id;
    if (!placeId || !comment || !rating) {
      return res.status(400).json({
        success: false,
        message: "Provide All the required data",
      });
    }
    const user = await User.findById(req.user.id);
    const newComment = new Comment({
      placeId,
      userId: req.user.id,
      userName: user.name,
      comment,
      rating,
    });
    await newComment.save();
    res.json({
      success: true,
      message: "Comment added successfully",
      result: newComment,
    });

  } catch (err) {
    console.log(err);
    return res.status(501).json({
      success: false,
      message: "Server Error",
    });
  }
});

app.get("/get-comments/:id", async (req, res) => {
  try {

    const comments = await Comment.find({
      placeId: req.params.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      result: comments
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});
app.put("/edit-comment/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { comment, rating } = req.body;
    const updatedComment = await Comment.findOneAndUpdate({
      _id: id,
      user: userId,
    }, {
      comment, rating
    }, {
      new: true,
      runValidators: true,
    });
    if (!updatedComment) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this comment",
      });

    }
    return res.status(200).json({
      success: true,
      message: "Comment Updated Successfully",
      data: updatedComment,
    });
  } catch (err) {
    res.status(501).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.delete("/delete-comment/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const deletedComment = await Comment.findOneAndDelete({
      _id: id,
      user: userId,
    });
    if (!deletedComment) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete the comment",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Comment Deleted Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// app.post("/search-district", auth, async (req, res) => {
//   try {
//     const { district } = req.body;
//     if (!district || typeof district !== "string") {
//       return res.json({ success: false, message: "District required" });
//     }

//     const geo = await getGeoLocation(district);
//     const raw = await getPlaceFromOverpass(geo.boundingbox);

//     if (!raw.length) {
//       return res.json({
//         success: true,
//         location: geo.display_name,
//         results: {}
//       });
//     }

//     const grouped = filterAndShortlist(raw, 400);
//     const ranked = await rankplaces(grouped);

//     res.json({
//       success: true,
//       location: geo.display_name,
//       categories: Object.keys(ranked).length,
//       results: ranked
//     });

//   } catch (err) {
//     console.error("Search Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Search failed"
//     });
//   }
// });
app.get("/search", auth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.json({
        success: false,
        message: "Query is required",
      });
    }

    const query = q.trim().toLowerCase();

    const listingPlaces = await Listings.find({
      status: "approved",
      $or: [
        { name: { $regex: query, $options: "i" } },
        { district: { $regex: query, $options: "i" } },
        { state: { $regex: query, $options: "i" } },
      ],
    }).limit(50);

    const providerPlaces = await Place.find({
      status: "approved",
      $or: [
        { name: { $regex: query, $options: "i" } },
        { district: { $regex: query, $options: "i" } },
        { state: { $regex: query, $options: "i" } },
      ],
    }).limit(50);

    const mergedPlaces = [...listingPlaces, ...providerPlaces].slice(0, 50);

    res.json({
      success: true,
      result: mergedPlaces, // 🔥 FIXED KEY
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.get("/suggestions", auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res.json({
        success: false,
        message: "Query is required",
      });

    }
    const filter = { status: "approved" };
    const regex = new RegExp(q.trim(), "i");
    const name = await Listings.distinct("name", { ...filter, name: regex });
    const district = await Listings.distinct("district", { ...filter, district: regex });
    const state = await Listings.distinct("state", { ...filter, state: regex });

    const providerName = await Place.distinct("name", { ...filter, name: regex });
    const providerDistrict = await Place.distinct("district", { ...filter, district: regex });
    const providerState = await Place.distinct("state", { ...filter, state: regex });

    const suggestions = [...new Set([...name, ...district, ...state, ...providerName, ...providerDistrict, ...providerState])].slice(0, 15);
    res.json({
      success: true,
      message: "Suggestions found",
      results: suggestions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.get("/user/status", auth, async (req, res) => {
  try {
    const listings = await Listings.find({ owner: req.user.id });
    if (listings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No listings found",
      });
    }
    return res.status(200).json({
      success: true,
      result: listings,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.get("/admin/listings/pending", auth, isAdmin, async (req, res) => {
  try {
    const listing = await Listings.find(
      { status: "pending" },
      { owner: { $exists: true, $ne: null } }
    )
      .populate("owner", "name email");
    return res.status(200).json({
      success: true,
      message: "Places are availble",
      result: listing,
    });

  } catch (err) {
    return res.status(501).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.put("/admin/listing/:id/approve", auth, isAdmin, async (req, res) => {
  try {
    const listing = await Listings.findById(req.params.id).populate("owner", "name email");

    if (!listing) {
      return res.json({
        success: false,
        message: "Listing not found",
      });
    }

    const name = listing.name.trim().toLowerCase();
    const district = listing.district.trim().toLowerCase();
    const state = listing.state.trim().toLowerCase();


    const exactDuplicate = await Listings.findOne({
      _id: { $ne: listing._id }, // exclude same listing
      name: { $regex: `^${name}$`, $options: "i" },
      district: { $regex: `^${district}$`, $options: "i" },
      state: { $regex: `^${state}$`, $options: "i" },
      status: "approved",
    });

    if (exactDuplicate) {
      return res.status(400).json({
        success: false,
        message: "This place is already approved",
        existing: exactDuplicate,
      });
    }

    const similarPlaces = await Listings.find({
      _id: { $ne: listing._id },
      district: { $regex: district, $options: "i" },
      state: { $regex: state, $options: "i" },
      name: { $regex: name.split(" ")[0], $options: "i" }, // basic similarity
      status: "approved",
    }).limit(5);

    listing.status = "approved";
    listing.rejectionReason = "";
    await listing.save();


    if (listing.owner && listing.owner.email) {
      await sendEmail({
        to: listing.owner.email,
        subject: "Your listing has been approved",
        html: `<p>Hi ${listing.owner.name},</p><p>Your listing "${listing.name}" has been approved.</p>`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Place approved successfully",
      result: listing,
      warning: similarPlaces.length ? similarPlaces : null,
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate place already exists (DB level)",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.put("/admin/listing/:id/reject", auth, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const listing = await Listings.findById(req.params.id).populate("owner", "name email");
    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }
    if (!listing) {
      return res.json({
        success: false,
        message: "Something went wrong",
      });

    }
    console.log("owner:", listing.owner);
    listing.status = "rejected";
    listing.rejectionReason = reason;
    await listing.save();
    if (listing.owner && listing.owner.email) {
      await sendEmail({
        to: listing.owner.email,
        subject: "Your listing has been rejected",
        html: `<p>Hi ${listing.owner.name},</p><p>Your listing "${listing.name}" has been rejected for the following reason:</p><p>${listing.rejectionReason}</p><p>Please make the necessary changes and resubmit.</p>`
      });
    }

    return res.status(200).json({
      success: true,
      message: "Places rejected successfully",
      result: listing,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

app.delete("/admin/listing/:id", auth, isAdmin, async (req, res) => {
  try {
    const listing = await Listings.findById(req.params.id).populate("owner", "name email");

    if (!listing) {
      return res.status(401).json({
        success: false,
        message: "Listing not founded",
      });
    }
    await Listings.findByIdAndDelete(req.params.id);
    if (listing.owner && listing.owner.email) {
      await sendEmail({
        to: listing.owner.email,
        subject: "Your listing has been deleted",
        html: `<p>Hi ${listing.owner.name},</p><p>Your listing "${listing.name}" has been deleted from our platform.</p><p>If you have any questions, please contact us.</p>`
      });
    }

    res.json({
      success: true,
      message: "Listing deleted"
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.put("/admin/listing/:id/edit", auth, isAdmin, async (req, res) => {
  try {
    const listing = await Listings.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!listing) {
      return res.status(401).json({
        success: false,
        message: "Listing not founded",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Place updated successfully",
      result: listing,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.get("/admin/listings/all", auth, isAdmin, async (req, res) => {
  try {
    const listings = await Listings.find()
      .populate("owner", "name email");
    res.status(200).json({
      success: true,
      result: listings,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.get("/admin/users/all", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -LoginToken -resetToken -otpExpiry -loginTokenExpiry -resetTokenExpiry");
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }
    return res.status(200).json({
      success: true,
      result: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.get("/admin/user/dashboard", auth, isAdmin, async (req, res) => {
  try {
    const listings = await Listings.find();
    const places = await Place.find();

    const allPlaces = [...listings, ...places];

    if (allPlaces.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No listings found",
      });
    }
    return res.status(200).json({
      success: true,
      result: allPlaces,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.post("/toggle-favorite/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const placeId = req.params.id;
    if (!user.favorites) {
      user.favorites = [];
    }
    if (user.favorites.includes(placeId)) {
      user.favorites = user.favorites.filter((id) => id !== placeId);
    } else {
      user.favorites.push(placeId);
    }
    await user.save();
    return res.json({ success: true, favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get("/favorites", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json({ success: true, favorites: user.favorites || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.post("/become-provider", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { businessName, contactNumber, state, district, address, description, serviceType, propertyCount } = req.body;
    if (!businessName || !contactNumber || !state || !district || !address || !description || !serviceType || !propertyCount) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (req.user.providerStatus === "pending") {
      return res.status(400).json({
        success: false,
        message: "Your application is already pending",
      });
    }
    if (req.user.providerStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "You are already an approved provider",
      });
    }
    if (req.user.providerStatus === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Your previous application was rejected. Please contact support for more details.",
      });
    }
    user.providerInfo = {
      businessName,
      contactNumber,
      state,
      district,
      address,
      description,
      serviceType,
      propertyCount,
    };
    user.providerStatus = "pending";

    await user.save();
    res.status(200).json({
      success: true,
      message: "Provider application submitted successfully",
      result: user.providerInfo,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.get("/admin/provider/status/pending", auth, isAdmin, async (req, res) => {
  try {
    const user = await User.find({ providerStatus: "pending" }).select("-password -otp -LoginToken -resetToken -otpExpiry -loginTokenExpiry -resetTokenExpiry");

    if (user.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No pending providers found",
      });
    }
    res.status(200).json({
      success: true,
      message: "You are a pending provider",
      result: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

app.put("/admin/provider/:id/approve", auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.providerStatus = "approved";
    user.role = "provider";
    user.providerInfo.rejectionReason = "";
    await user.save();
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: "Your provider application has been approved",
        html: `<p>Hi ${user.name},</p><p>Congratulations! Your application to become a service provider has been approved. You can now access provider features on our platform.</p><p>If you have any questions, please contact us.</p>`
      });
    }
    res.status(200).json({
      success: true,
      message: "Provider approved successfully",
      result: user.providerInfo,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.put("/admin/provider/:id/reject", auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { reason } = req.body;
    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.providerStatus = "rejected";
    user.providerInfo.rejectionReason = reason;
    await user.save();
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: "Your provider application has been rejected",
        html: `<p>Hi ${user.name},</p><p>We regret to inform you that your application to become a service provider has been rejected for the following reason:</p><p>${reason}</p><p>Please review the requirements and consider reapplying in the future. If you have any questions, please contact us.</p>`
      });
    }
    res.status(200).json({
      success: true,
      message: "Provider rejected successfully",
      result: user.providerInfo,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.get("/admin/providers/approved", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ providerStatus: "approved" }).select("-password -otp -LoginToken -resetToken -otpExpiry -loginTokenExpiry -resetTokenExpiry");
    res.status(200).json({
      success: true,
      message: "Approved providers found",
      result: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.get("/admin/providers/rejected", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ providerStatus: "rejected" }).select("-password -otp -LoginToken -resetToken -otpExpiry -loginTokenExpiry -resetTokenExpiry");
    res.status(200).json({
      success: true,
      message: "Rejected providers found",
      result: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.post("/provider/add/place", auth, async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    const {
      name,
      category,
      description,
      location,
      pricing,
      details,
      images,
      facilities,
      availability,
      policies,
      contact,
    } = req.body;

    // ✅ Basic validation
    if (!name || !category || !pricing?.price) {
      return res.status(400).json({
        success: false,
        message: "Name, category and price are required",
      });
    }

    // ✅ Create new place
    const newPlace = new Place({
      name,
      category,
      description,
      location,
      pricing,
      details,
      images,
      facilities,
      availability,
      policies,
      contact,
      provider: userId,
      status: "pending",
    });

    await newPlace.save();

    res.status(201).json({
      success: true,
      message: "Place added successfully",
      data: newPlace,
    });
  } catch (error) {
    console.error("Add Place Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while adding place",
    });
  }
});
app.get("/provider/myservices", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const places = await Place.find({ provider: userId });
    if (places.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No services found",
        result: [],
      });
    }
    res.status(200).json({
      success: true,
      message: "Services found",
      result: places,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
app.get("/admin/proivder-service/pending", auth, isAdmin, async (req, res) => {
  try {
    const places = await Place.find({ status: "pending" }).populate("provider", "name email");
    if (places.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No pending services found",
        result: []
      })
    }
    res.status(200).json({
      success: true,
      message: "Pending services found",
      result: places
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    })
  }
});
app.put("/admin/provider-service/approve/:id", auth, isAdmin, async (req, res) => {
  try {
    const placeId = req.params.id;
    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found"
      })
    }
    place.status = "approved";
    place.rejectionReason = "";
    await place.save();
    res.status(200).json({
      success: true,
      message: "Place approved successfully",
      result: place
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    })
  }
});
app.put("/admin/provider-service/reject/:id", auth, isAdmin, async (req, res) => {
  try {
    const placeId = req.params.id;
    const { reason } = req.body;
    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required"
      })
    }
    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found"
      })
    }
    place.status = "rejected";
    place.rejectionReason = reason;
    await place.save();
    res.status(200).json({
      success: true,
      message: "Place rejected successfully",
      result: place
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    })
  }
});
app.get("/provider/service/:id", auth, async (req, res) => {
  try {
    const placeId = req.params.id;
    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found"
      })
    }
    res.status(200).json({
      success: true,
      message: "Place found",
      result: place
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    })
  }
});
app.get("/admin/places/pending", auth, isAdmin, async (req, res) => {
  try {
    const places = await Place.find({ status: "pending" }).populate("provider", "name email");
    if (places.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No pending services found",
        result: []
      })
    }
    res.status(200).json({
      success: true,
      message: "Pending services found",
      result: places
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    })
  }
});
app.get("/admin/places/approved", auth, isAdmin, async (req, res) => {
  try {
    const places = await Place.find({ status: "approved" }).populate("provider", "name email");
    if (places.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No approved services found",
        result: []
      })
    }
    res.status(200).json({
      success: true,
      message: "Approved services found",
      result: places
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    })
  }
});
app.get("/admin/places/rejected", auth, isAdmin, async (req, res) => {
  try {
    const places = await Place.find({ status: "rejected" }).populate("provider", "name email");
    if (places.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No rejected services found",
        result: []
      })
    }
    res.status(200).json({
      success: true,
      message: "Rejected services found",
      result: places
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    })
  }
});
app.post("/book", auth, async (req, res) => {
  try {
    const { providerId, listingId, from, to, guests, amount } = req.body;

    if (!providerId || !listingId || !from || !to || !guests || !amount) {
      return res.status(400).json({ success: false, message: "Missing required booking details" });
    }

    const newBooking = new Booking({
      bookingId: uuidv4(),
      customer: req.user.id,
      provider: providerId,
      listing: listingId,
      date: new Date(from),
      toDate: new Date(to),
      guests: Number(guests),
      amount: Number(amount),
      status: "confirmed"
    });

    await newBooking.save();

    res.json({ success: true, message: "Booking confirmed successfully!", result: newBooking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
});

app.get("/user/bookings", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate("listing", "name img images category district state")
      .populate("provider", "name email contact");

    res.json({ success: true, result: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
});

app.get("/provider/dashboard-stats", auth, async (req, res) => {
  try {
    const servicesCount = await Place.countDocuments({ provider: req.user.id });
    const bookings = await Booking.find({ provider: req.user.id }).populate("customer", "name email");

    const bookingsCount = bookings.length;
    const earnings = bookings.filter(b => b.status === "confirmed" || b.status === "Completed").reduce((sum, b) => sum + b.amount, 0);

    const recentBookings = [...bookings].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);

    res.json({
      success: true,
      stats: {
        servicesCount,
        bookingsCount,
        earnings,
        rating: 4.8
      },
      recentBookings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
});

app.get("/provider/bookings", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user.id })
      .populate("listing", "name")
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, result: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
});

app.get("/provider/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
});

app.put("/provider/profile", auth, async (req, res) => {
  try {
    const { name, contactNumber, businessName, address, description } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;

    if (!user.providerInfo) user.providerInfo = {};
    if (contactNumber !== undefined) user.providerInfo.contactNumber = contactNumber;
    if (businessName !== undefined) user.providerInfo.businessName = businessName;
    if (address !== undefined) user.providerInfo.address = address;
    if (description !== undefined) user.providerInfo.description = description;

    await user.save();
    res.json({ success: true, message: "Profile updated successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
});
app.post("/toggle-favorite/:id", auth, async (req, res) => {
  try {
    const placeId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isAlreadyFav = user.favorites.some(
      (id) => id.toString() === placeId
    );

    if (isAlreadyFav) {
      // ❌ remove
      user.favorites = user.favorites.filter(
        (id) => id.toString() !== placeId
      );
    } else {
      // ❤️ add
      user.favorites.push(placeId);
    }

    await user.save();

    res.json({
      success: true,
      favorites: user.favorites, // 🔥 IMPORTANT
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});