const express = require("express");
const app = express();
require("dotenv").config();

const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

require("./db");
const User = require("./models/user");
const sendOtp = require("./utils/sendOtp");
const generateOtp = require("./utils/otp");
const { distanceKm } = require("./utils/distance");
const { getGeoLocation } = require("./utils/getGeoLocation");
const { getPlaceFromOverpass } = require("./utils/getPlaceFromOverpass");
const { filterAndShortlist } = require("./utils/filterAndShortlist");
const { rankplaces } = require("./utils/aiRanker");
const { filterPlaces } = require("./utils/filter");
const port = process.env.PORT || 8080;
const { runOverpass } = require("./utils/overpass");
const { reverseGeocode } = require("./utils/reverseGeocode");
const { processWithAi } = require("./utils/ai");
const auth = require("./middleware/auth");
const { categorizePlaces } = require("./utils/categorizePlaces");
const Listings = require("./models/listings");
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
    const token = jwt.sign({
      id:user.id,
      email:user.email,
    },
    process.env.JWT_SECRET,
    {expiresIn:process.env.JWT_EXPIRY},
  );
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
    const token = jwt.sign({
      id:user.id,
      email:user.email,
    },
    process.env.JWT_SECRET,
    {expiresIn:process.env.JWT_EXPIRY},
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
app.get("/dashboard",auth,async(req,res)=>{
  try{
    const places = await Listings.find({});
    res.status(200).json({
      success:true,
      count:places.length,
      result:places,
    });
  }catch(err){
    res.status(501).json({
      success:false,
      count:places.length,
      error:err.message,
    });
  }
  
});
app.get("/place/:id",auth,async(req,res)=>{
  try{
    const place = await Listings.findById(req.params.id);
    res.status(200).json({
      success:true,
      result:place,
    });
  }catch(err){
    res.json({
      success:false,
      error:err.message,
    });
  }
})
app.post("/search-district", auth,async (req, res) => {
  try {
    const { district } = req.body;
    if (!district || typeof district !== "string") {
      return res.json({ success: false, message: "District required" });
    }

    const geo = await getGeoLocation(district);
    const raw = await getPlaceFromOverpass(geo.boundingbox);

    if (!raw.length) {
      return res.json({
        success: true,
        location: geo.display_name,
        results: {}
      });
    }

    const grouped = filterAndShortlist(raw, 400);
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