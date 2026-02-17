const express = require("express");
const app = express();
require("dotenv").config();

const cors = require("cors");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

require("./db");
const User = require("./models/user");
const sendOtp = require("./utils/sendOtp");
const generateOtp = require("./utils/otp");

const { runOverpass } = require("./overpass");
const { reverseGeocode } = require("./utils/reverseGeocode");
const { processWithAi } = require("./ai");
const { categorizePlaces } = require("./utils/categorizePlaces");

const { getGeoLocation } = require("./utils/getGeoLocation");
const { getPlaceFromOverpass } = require("./utils/getPlaceFromOverpass");
const { filterAndShortlist } = require("./utils/filterAndShortlist");
const { rankplaces } = require("./utils/aiRanker");


const port = process.env.PORT || 8080;

app.use(cors());
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

    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.otpPurpose = "signup";
    user.otpAttempts = 0;

    await user.save();
    await sendOtp(email, otp);

    res.json({ success: true, message: "OTP sent to email" });
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

app.post("/api/nearby-places", async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    let places = [];
    let radius = 2000;
    let source = "local";
    let city = null;

    // Search radii: 2km -> 5km -> 10km -> 15km -> 25km
    while (places.length < 10 && radius <= 25000) {
      console.log(`[DEBUG] Searching radius: ${radius}m...`);
      const newPlaces = await runOverpass(lat, lng, radius);
      console.log(`[DEBUG] Found ${newPlaces.length} places at ${radius}m`);

      // If we significantly improve results, update places
      if (newPlaces.length > places.length) places = newPlaces;

      if (radius < 5000) radius = 5000;
      else if (radius < 10000) radius = 10000;
      else if (radius < 15000) radius = 15000;
      else radius += 10000;
    }

    console.log(`[DEBUG] Final Local Search Result: ${places.length} places`);

    // Helper to calculate distance
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371e3; // metres
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Correct coordinates for city fallback if needed
    let searchLat = lat;
    let searchLng = lng;

    if (places.length < 5) {
      console.log("[DEBUG] Few places found nearby, checking city fallback...");
      const cityInfo = await reverseGeocode(lat, lng);
      if (cityInfo?.lat && cityInfo?.lng) {
        const cityPlaces = await runOverpass(cityInfo.lat, cityInfo.lng, 12000);
        console.log(`[DEBUG] City Fallback Found: ${cityPlaces.length} places in ${cityInfo.city}`);

        if (cityPlaces.length > places.length) {
          places = cityPlaces;
          source = "city";
          city = cityInfo.city;
          searchLat = cityInfo.lat; // Update search center
          searchLng = cityInfo.lng;
          console.log(`[DEBUG] Switched to city source: ${city}`);
        }
      }
    }

    // SORT BY DISTANCE
    places = places.map(p => ({
      ...p,
      distance: getDistance(searchLat, searchLng, p.lat, p.lng)
    })).sort((a, b) => a.distance - b.distance);

    console.log("[DEBUG] Places sorted by distance. Closest:", places[0]?.name, Math.round(places[0]?.distance) + "m");

    if (!places.length) {
      return res.json({
        success: true,
        source,
        city,
        totalPlaces: 0,
        categories: {},
      });
    }

    const selectedNames = await processWithAi(places);

    console.log(`Places found: ${places.length}, AI selected: ${Array.isArray(selectedNames) ? selectedNames.length : "ALL"}`);

    let finalNames = selectedNames;
    if (Array.isArray(selectedNames) && selectedNames.length < 3 && places.length >= 3) {
      console.log("AI selected too few places, falling back to showing top 10 original places.");
      finalNames = places.slice(0, 10).map(p => p.name);
    }

    let categorizedPlaces = categorizePlaces(
      places,
      Array.isArray(finalNames)
        ? finalNames
        : places.map((p) => p.name)
    );


    let totalCategorized = Object.values(categorizedPlaces).flat().length;

    if (totalCategorized < 3 && places.length >= 3) {
      console.log("Categorization dropped too many items. Forcefully adding raw places to 'Other'.");
      if (!categorizedPlaces["Other"]) categorizedPlaces["Other"] = [];

      const existingNames = new Set(Object.values(categorizedPlaces).flat().map(p => p.name));

      places.slice(0, 15).forEach(p => {
        if (!existingNames.has(p.name)) {
          categorizedPlaces["Other"].push(p);
        }
      });
    }

    res.json({
      success: true,
      source,
      city,
      totalPlaces: places.length,
      categories: categorizedPlaces,
    });
  } catch (err) {
    res.json({ success: false, message: "Failed to fetch nearby places" });
  }
});

app.post("/search-district", async (req, res) => {
  try {
    const { district } = req.body;
    if (!district || typeof district !== "string") {
      return res.json({
        success: false,
        message: "District required",
      });
    }
    const geo = await getGeoLocation(district);
    const raw = await getPlaceFromOverpass(
      geo.boundingbox
    );
    if (!raw.length) {
      return res.json({
        success: true,
        location: geo.display_name,
        results: {}
      });

    }
    const grouped = filterAndShortlist(raw, 200);
    const ranked = await rankplaces(grouped);
    res.json({
      success: true,
      location: geo.display_name,
      categories: Object.keys(ranked).length,
      results: ranked
    });
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({
      success: false,
      message: "Search failed"
    });
  }
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
