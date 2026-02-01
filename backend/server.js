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

    while (places.length < 10 && radius <= 12000) {
      places = await runOverpass(lat, lng, radius);
      radius += 2000;
    }

    if (places.length < 5) {
      const cityInfo = await reverseGeocode(lat, lng);
      if (cityInfo?.lat && cityInfo?.lng) {
        places = await runOverpass(cityInfo.lat, cityInfo.lng, 12000);
        source = "city";
        city = cityInfo.city;
      }
    }

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

    const categorizedPlaces = categorizePlaces(
      places,
      Array.isArray(selectedNames)
        ? selectedNames
        : places.map((p) => p.name)
    );

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
